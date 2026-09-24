// backend/src/controllers/reimbursementController.js
const Reimbursement = require('../models/Reimbursement');
const Expense = require('../models/Expense');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

// @desc    Get reimbursements with filters & role scoping
// @route   GET /api/reimbursements
// @access  Private
const getReimbursements = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user._id;
    }

    if (status) query.status = status;

    const reimbursements = await Reimbursement.find(query)
      .populate('employee', 'name email employeeId avatar designation')
      .populate('expenses')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reimbursements });
  } catch (error) {
    next(error);
  }
};

// @desc    Process reimbursement payment (Mark Paid / Processing)
// @route   POST /api/reimbursements/:id/process
// @access  Private (Finance, Admin)
const processReimbursement = async (req, res, next) => {
  try {
    const { paymentMethod, paymentReference, remarks, status = 'Paid' } = req.body;
    const reimbursement = await Reimbursement.findById(req.params.id);

    if (!reimbursement) {
      return res.status(404).json({ success: false, message: 'Reimbursement record not found' });
    }

    reimbursement.status = status;
    reimbursement.paymentMethod = paymentMethod || reimbursement.paymentMethod;
    reimbursement.paymentReference = paymentReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    reimbursement.processingDate = new Date();
    reimbursement.financeOfficer = req.user._id;
    reimbursement.financeOfficerName = req.user.name;
    if (remarks) reimbursement.remarks = remarks;

    await reimbursement.save();

    // Update the associated expenses status to 'Reimbursed'
    if (status === 'Paid') {
      await Expense.updateMany(
        { _id: { $in: reimbursement.expenses } },
        { approvalStatus: 'Reimbursed' }
      );
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REIMBURSEMENT_PROCESSED',
      entity: 'REIMBURSEMENT',
      entityId: reimbursement.reimbursementId,
      description: `Disbursed ₹${reimbursement.netPayableAmount.toLocaleString()} to ${reimbursement.employeeName} via ${paymentMethod} (Ref: ${reimbursement.paymentReference})`,
      newState: reimbursement.toObject(),
    });

    // Notify employee
    await createNotification({
      recipientId: reimbursement.employee,
      title: `Reimbursement Paid — ₹${reimbursement.netPayableAmount.toLocaleString()} 💸`,
      message: `Your travel reimbursement of ₹${reimbursement.netPayableAmount.toLocaleString()} has been paid via ${reimbursement.paymentMethod} (Ref: ${reimbursement.paymentReference}).`,
      type: 'REIMBURSEMENT_PAID',
      link: `/reimbursements`,
    });

    res.json({
      success: true,
      message: `Reimbursement marked as ${status}`,
      data: reimbursement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReimbursements, processReimbursement };
