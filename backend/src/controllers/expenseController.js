// backend/src/controllers/expenseController.js
const Expense = require('../models/Expense');
const TravelRequest = require('../models/TravelRequest');
const Reimbursement = require('../models/Reimbursement');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const generateExpenseId = async () => {
  const count = await Expense.countDocuments();
  return `EX-${3000 + count + 1}`;
};

// @desc    Get expenses with role isolation and filters
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { tripId, category, approvalStatus, employeeId } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (tripId) query.travelRequest = tripId;
    if (category) query.category = category;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const expenses = await Expense.find(query)
      .populate('travelRequest', 'requestId destination departureDate returnDate advanceRequested')
      .populate('employee', 'name email employeeId avatar')
      .sort({ date: -1 });

    res.json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense claim
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { travelRequestId, category, date, amount, currency = 'INR', description, merchant, receiptUrl, receiptName } = req.body;

    const travelRequest = await TravelRequest.findById(travelRequestId);
    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Associated travel request not found' });
    }

    const expenseId = await generateExpenseId();

    // Check basic category policy heuristic
    let policyStatus = 'Within Policy';
    let policyNote = '';

    if (category === 'Food' && Number(amount) > 3000) {
      policyStatus = 'Policy Exception';
      policyNote = `Single meal expense ₹${Number(amount).toLocaleString()} exceeds typical single bill guidelines.`;
    } else if (category === 'Hotel' && Number(amount) > 12000) {
      policyStatus = 'Policy Exception';
      policyNote = `Hotel charge ₹${Number(amount).toLocaleString()} exceeds standard allowance cap.`;
    }

    const expense = await Expense.create({
      expenseId,
      employee: req.user._id,
      employeeName: req.user.name,
      department: req.user.department,
      departmentName: req.user.departmentName || 'General',
      travelRequest: travelRequestId,
      requestId: travelRequest.requestId,
      category,
      date: date || new Date(),
      amount: Number(amount),
      currency,
      description,
      merchant: merchant || '',
      receiptUrl: receiptUrl || '',
      receiptName: receiptName || 'Receipt_Doc',
      policyStatus,
      policyNote,
      approvalStatus: 'Submitted',
    });

    // Update total actual expenses on the trip
    travelRequest.totalActualExpense = (travelRequest.totalActualExpense || 0) + Number(amount);
    travelRequest.expensesSubmitted = true;
    await travelRequest.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'EXPENSE_SUBMITTED',
      entity: 'EXPENSE',
      entityId: expense.expenseId,
      description: `Submitted ${category} expense ₹${Number(amount).toLocaleString()} for ${travelRequest.requestId}`,
      newState: expense,
    });

    // Notify Finance
    await createNotification({
      role: 'FINANCE OFFICER',
      title: 'New Expense Claim Submitted',
      message: `${req.user.name} submitted ${category} expense claim for ₹${Number(amount).toLocaleString()} (${travelRequest.requestId})`,
      type: 'EXPENSE_UPDATE',
      link: `/expenses`,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Finance review (Approve / Reject single or multiple expenses)
// @route   POST /api/expenses/:id/review
// @access  Private (Finance, Admin)
const reviewExpense = async (req, res, next) => {
  try {
    const { decision, rejectionReason = '' } = req.body; // 'Approved' | 'Rejected'
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    expense.approvalStatus = decision === 'Approved' ? 'Approved' : 'Rejected';
    expense.rejectionReason = rejectionReason;
    expense.financeReviewer = req.user._id;
    expense.financeReviewDate = new Date();
    await expense.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: decision === 'Approved' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
      entity: 'EXPENSE',
      entityId: expense.expenseId,
      description: `Finance Officer ${req.user.name} ${decision.toLowerCase()} expense ${expense.expenseId} (₹${expense.amount.toLocaleString()})`,
    });

    // If approved, check if we should automatically bundle or create/update a Reimbursement queue entry
    if (decision === 'Approved') {
      const travelRequest = await TravelRequest.findById(expense.travelRequest);
      const advanceDeducted = (travelRequest && travelRequest.advanceRequested) || 0;

      // Find or create pending reimbursement record for this trip
      let reimbursement = await Reimbursement.findOne({
        travelRequest: expense.travelRequest,
        status: { $in: ['Pending', 'Approved'] },
      });

      if (!reimbursement) {
        const count = await Reimbursement.countDocuments();
        const reimbursementId = `RMB-${4000 + count + 1}`;
        
        reimbursement = await Reimbursement.create({
          reimbursementId,
          employee: expense.employee,
          employeeName: expense.employeeName,
          departmentName: expense.departmentName,
          travelRequest: expense.travelRequest,
          requestId: expense.requestId,
          destination: travelRequest ? travelRequest.destination : '',
          expenses: [expense._id],
          totalClaimedAmount: expense.amount,
          approvedAmount: expense.amount,
          advanceDeducted: Math.min(advanceDeducted, expense.amount),
          netPayableAmount: Math.max(0, expense.amount - advanceDeducted),
          status: 'Pending',
        });
      } else {
        if (!reimbursement.expenses.includes(expense._id)) {
          reimbursement.expenses.push(expense._id);
          reimbursement.totalClaimedAmount += expense.amount;
          reimbursement.approvedAmount += expense.amount;
          reimbursement.netPayableAmount = Math.max(0, reimbursement.approvedAmount - reimbursement.advanceDeducted);
          await reimbursement.save();
        }
      }
    }

    // Notify employee
    await createNotification({
      recipientId: expense.employee,
      title: `Expense ${expense.expenseId} ${decision}`,
      message: `Your ${expense.category} claim for ₹${expense.amount.toLocaleString()} was ${decision.toLowerCase()} by Finance.`,
      type: 'EXPENSE_UPDATE',
      link: `/expenses`,
    });

    res.json({ success: true, message: `Expense ${decision.toLowerCase()} successfully`, data: expense });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, createExpense, reviewExpense };
