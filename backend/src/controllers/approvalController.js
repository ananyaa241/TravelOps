// backend/src/controllers/approvalController.js
const TravelRequest = require('../models/TravelRequest');
const Approval = require('../models/Approval');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

// @desc    Get pending approvals for manager/finance/admin
// @route   GET /api/approvals
// @access  Private (Manager, Finance, Admin)
const getPendingApprovals = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === 'MANAGER') {
      query = {
        status: { $in: ['Pending Manager Approval', 'Policy Review'] },
        $or: [
          { department: req.user.department },
          { 'approvalChain.role': 'MANAGER', 'approvalChain.status': 'Pending' }
        ]
      };
    } else if (userRole === 'FINANCE OFFICER') {
      query = {
        status: { $in: ['Pending Additional Approval', 'Pending Manager Approval'] },
        'approvalChain.role': 'FINANCE OFFICER',
        'approvalChain.status': 'Pending',
      };
    } else if (userRole === 'COMPANY ADMIN') {
      query = {
        status: { $in: ['Pending Manager Approval', 'Pending Additional Approval'] },
      };
    }

    const requests = await TravelRequest.find(query)
      .populate('employee', 'name email employeeId avatar designation phone')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    const recentDecisions = await Approval.find({ approver: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: requests,
      recentDecisions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve travel request at current workflow level
// @route   POST /api/approvals/:id/approve
// @access  Private (Manager, Finance, Admin)
const approveRequest = async (req, res, next) => {
  try {
    const { comment = '' } = req.body;
    const travelRequest = await TravelRequest.findById(req.params.id);

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    const currentLevel = travelRequest.currentApprovalLevel;
    const chainItem = travelRequest.approvalChain.find(item => item.level === currentLevel);

    if (chainItem) {
      chainItem.status = 'Approved';
      chainItem.approver = req.user._id;
      chainItem.approverName = req.user.name;
      chainItem.comment = comment;
      chainItem.actionDate = new Date();
    }

    // Check if there are further pending approval levels
    const nextPending = travelRequest.approvalChain.find(item => item.level > currentLevel && item.status === 'Pending');

    let newStatus = 'Approved';
    if (nextPending) {
      travelRequest.currentApprovalLevel = nextPending.level;
      newStatus = 'Pending Additional Approval';
      
      // Notify next approver role
      await createNotification({
        role: nextPending.role,
        title: `Travel Request ${travelRequest.requestId} Escalated for Approval`,
        message: `${travelRequest.employeeName}'s travel to ${travelRequest.destination} (₹${travelRequest.estimatedTotalCost.toLocaleString()}) needs your level ${nextPending.level} approval.`,
        type: 'TRAVEL_APPROVAL',
        link: `/approvals?id=${travelRequest._id}`,
      });
    } else {
      newStatus = 'Approved';
      // Complete approval! Notify travel coordinator for booking & notify employee
      await createNotification({
        role: 'TRAVEL COORDINATOR',
        title: `Ready for Booking: ${travelRequest.requestId}`,
        message: `${travelRequest.employeeName} to ${travelRequest.destination} has been fully approved. Ready for flight & hotel booking.`,
        type: 'BOOKING_UPDATE',
        link: `/bookings`,
      });
      await createNotification({
        recipientId: travelRequest.employee,
        title: `Travel Request ${travelRequest.requestId} Approved 🎉`,
        message: `Your travel request to ${travelRequest.destination} has been fully approved by ${req.user.name}.`,
        type: 'TRAVEL_APPROVAL',
        link: `/trips`,
      });
    }

    travelRequest.status = newStatus;
    await travelRequest.save();

    // Create Approval record
    await Approval.create({
      travelRequest: travelRequest._id,
      requestId: travelRequest.requestId,
      approver: req.user._id,
      approverName: req.user.name,
      role: req.user.role,
      level: currentLevel,
      decision: 'Approved',
      comment,
    });

    // Audit log
    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TRAVEL_REQUEST_APPROVED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `${req.user.role} ${req.user.name} approved request ${travelRequest.requestId} (Level ${currentLevel}). New status: ${newStatus}`,
      newState: travelRequest.toObject(),
    });

    res.json({
      success: true,
      message: `Travel request ${travelRequest.requestId} approved successfully`,
      data: travelRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject travel request
// @route   POST /api/approvals/:id/reject
// @access  Private (Manager, Finance, Admin)
const rejectRequest = async (req, res, next) => {
  try {
    const { comment = 'Does not meet current travel priorities.' } = req.body;
    const travelRequest = await TravelRequest.findById(req.params.id);

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    travelRequest.status = 'Rejected';
    travelRequest.rejectionReason = comment;

    const chainItem = travelRequest.approvalChain.find(item => item.level === travelRequest.currentApprovalLevel);
    if (chainItem) {
      chainItem.status = 'Rejected';
      chainItem.approver = req.user._id;
      chainItem.approverName = req.user.name;
      chainItem.comment = comment;
      chainItem.actionDate = new Date();
    }

    await travelRequest.save();

    await Approval.create({
      travelRequest: travelRequest._id,
      requestId: travelRequest.requestId,
      approver: req.user._id,
      approverName: req.user.name,
      role: req.user.role,
      level: travelRequest.currentApprovalLevel,
      decision: 'Rejected',
      comment,
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TRAVEL_REQUEST_REJECTED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `${req.user.name} rejected travel request ${travelRequest.requestId}. Reason: ${comment}`,
    });

    // Notify employee
    await createNotification({
      recipientId: travelRequest.employee,
      title: `Travel Request ${travelRequest.requestId} Rejected`,
      message: `Your travel request to ${travelRequest.destination} was rejected. Note: "${comment}"`,
      type: 'TRAVEL_APPROVAL',
      link: `/trips`,
    });

    res.json({ success: true, message: 'Travel request rejected', data: travelRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Request changes on travel request
// @route   POST /api/approvals/:id/request-changes
// @access  Private
const requestChanges = async (req, res, next) => {
  try {
    const { comment = 'Please adjust budget / itinerary.' } = req.body;
    const travelRequest = await TravelRequest.findById(req.params.id);

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    travelRequest.status = 'Draft';
    travelRequest.rejectionReason = comment;
    await travelRequest.save();

    await Approval.create({
      travelRequest: travelRequest._id,
      requestId: travelRequest.requestId,
      approver: req.user._id,
      approverName: req.user.name,
      role: req.user.role,
      level: travelRequest.currentApprovalLevel,
      decision: 'Changes Requested',
      comment,
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TRAVEL_REQUEST_CHANGES_REQUESTED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `${req.user.name} requested changes on ${travelRequest.requestId}: ${comment}`,
    });

    await createNotification({
      recipientId: travelRequest.employee,
      title: `Changes Requested for ${travelRequest.requestId}`,
      message: `Reviewer comment: "${comment}". Please revise and resubmit.`,
      type: 'TRAVEL_APPROVAL',
      link: `/trips`,
    });

    res.json({ success: true, message: 'Changes requested successfully', data: travelRequest });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingApprovals, approveRequest, rejectRequest, requestChanges };
