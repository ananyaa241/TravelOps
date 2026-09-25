// backend/src/controllers/travelRequestController.js
const TravelRequest = require('../models/TravelRequest');
const Department = require('../models/Department');
const { evaluateTravelPolicy } = require('../services/policyEngine');
const { logAudit } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

// Helper to generate sequential Request ID (e.g., TR-1045)
const generateRequestId = async () => {
  const count = await TravelRequest.countDocuments();
  return `TR-${1000 + count + 1}`;
};

// @desc    Get travel requests with filtering, pagination & role isolation
// @route   GET /api/travel-requests
// @access  Private
const getTravelRequests = async (req, res, next) => {
  try {
    const { status, policyStatus, department, travelType, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role-based visibility
    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user._id;
    } else if (req.user.role === 'MANAGER') {
      // Manager sees requests from their department OR requests assigned to them
      query.$or = [
        { department: req.user.department },
        { 'approvalChain.approver': req.user._id },
        { employee: req.user._id }
      ];
    }
    // COMPANY ADMIN, FINANCE OFFICER, TRAVEL COORDINATOR see all

    if (status) query.status = status;
    if (policyStatus) query.policyStatus = policyStatus;
    if (department) query.department = department;
    if (travelType) query.travelType = travelType;

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await TravelRequest.countDocuments(query);
    const requests = await TravelRequest.find(query)
      .populate('employee', 'name email employeeId avatar designation')
      .populate('department', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single travel request by ID
// @route   GET /api/travel-requests/:id
// @access  Private
const getTravelRequestById = async (req, res, next) => {
  try {
    const travelRequest = await TravelRequest.findById(req.params.id)
      .populate('employee', 'name email employeeId phone designation city avatar')
      .populate('department', 'name code annualBudget spentBudget');

    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    res.json({ success: true, data: travelRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Realtime policy check preview for draft/form
// @route   POST /api/travel-requests/check-policy
// @access  Private
const checkPolicyPreview = async (req, res, next) => {
  try {
    const policyResult = await evaluateTravelPolicy(req.body, req.user.department);
    res.json({ success: true, data: policyResult });
  } catch (error) {
    next(error);
  }
};

// @desc    Create and submit a new travel request
// @route   POST /api/travel-requests
// @access  Private
const createTravelRequest = async (req, res, next) => {
  try {
    const {
      purpose,
      travelType,
      origin,
      destination,
      departureDate,
      returnDate,
      travelersCount = 1,
      estimatedAccommodationCost = 0,
      estimatedTransportationCost = 0,
      estimatedMealsCost = 0,
      estimatedOtherCost = 0,
      advanceRequested = 0,
      businessCode = 'PRJ-GENERAL',
      notes = '',
      attachments = [],
      status = 'Submitted',
    } = req.body;

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ success: false, message: 'Business purpose of travel is required.' });
    }
    if (!origin || !origin.trim()) {
      return res.status(400).json({ success: false, message: 'Origin city is required.' });
    }
    if (!destination || !destination.trim()) {
      return res.status(400).json({ success: false, message: 'Destination city is required.' });
    }
    if (!departureDate || !returnDate) {
      return res.status(400).json({ success: false, message: 'Departure and return dates are required.' });
    }

    const user = req.user;
    const deptId = user.department;
    let deptName = user.departmentName || 'Engineering';

    if (deptId) {
      const d = await Department.findById(deptId);
      if (d) deptName = d.name;
    }

    // Compute duration
    const diffTime = Math.abs(new Date(returnDate) - new Date(departureDate));
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const estimatedTotalCost = Number(estimatedAccommodationCost) +
                               Number(estimatedTransportationCost) +
                               Number(estimatedMealsCost) +
                               Number(estimatedOtherCost);

    // Validate with policy engine
    const policyEvaluation = await evaluateTravelPolicy({
      travelType,
      durationDays,
      estimatedAccommodationCost,
      estimatedTransportationCost,
      estimatedMealsCost,
      estimatedTotalCost,
      advanceRequested,
    }, deptId);

    const requestId = await generateRequestId();

    // Construct approval chain based on amount and policy
    const approvalChain = [
      {
        level: 1,
        role: 'MANAGER',
        status: 'Pending',
      }
    ];

    if (estimatedTotalCost > 50000 || policyEvaluation.policyStatus === 'Policy Exception') {
      approvalChain.push({
        level: 2,
        role: 'FINANCE OFFICER',
        status: 'Pending',
      });
    }

    if (estimatedTotalCost > 100000) {
      approvalChain.push({
        level: 3,
        role: 'COMPANY ADMIN',
        status: 'Pending',
      });
    }

    const initialStatus = status === 'Draft' ? 'Draft' : 'Pending Manager Approval';

    const travelRequest = await TravelRequest.create({
      requestId,
      employee: user._id,
      employeeName: user.name,
      employeeEmail: user.email,
      employeeIdCode: user.employeeId,
      department: deptId || null,
      departmentName: deptName,
      travelType,
      purpose,
      origin,
      destination,
      departureDate,
      returnDate,
      durationDays,
      travelersCount,
      estimatedAccommodationCost,
      estimatedTransportationCost,
      estimatedMealsCost,
      estimatedOtherCost,
      estimatedTotalCost,
      advanceRequested,
      businessCode,
      notes,
      attachments,
      status: initialStatus,
      policyStatus: policyEvaluation.policyStatus,
      policyViolations: policyEvaluation.violations,
      currentApprovalLevel: 1,
      approvalChain,
    });

    // Create audit log
    await logAudit({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'TRAVEL_REQUEST_CREATED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `Travel request ${requestId} (${origin} → ${destination}) submitted by ${user.name}. Status: ${initialStatus}. Policy: ${policyEvaluation.policyStatus}`,
      newState: travelRequest,
    });

    // Notify managers
    await createNotification({
      role: 'MANAGER',
      title: 'New Travel Request Pending Approval',
      message: `${user.name} submitted travel request ${requestId} for ${destination} (Est. ₹${estimatedTotalCost.toLocaleString()})`,
      type: 'TRAVEL_APPROVAL',
      link: `/approvals?id=${travelRequest._id}`,
      metadata: { requestId, travelRequestId: travelRequest._id },
    });

    res.status(201).json({
      success: true,
      message: 'Travel request submitted successfully',
      data: travelRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update travel request
// @route   PUT /api/travel-requests/:id
// @access  Private
const updateTravelRequest = async (req, res, next) => {
  try {
    const travelRequest = await TravelRequest.findById(req.params.id);
    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    // Only owner or admin can update if in draft or changes requested
    if (req.user.role === 'EMPLOYEE' && String(travelRequest.employee) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this request' });
    }

    const prevState = travelRequest.toObject();
    Object.assign(travelRequest, req.body);

    await travelRequest.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TRAVEL_REQUEST_UPDATED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `Travel request ${travelRequest.requestId} was updated`,
      previousState: prevState,
      newState: travelRequest.toObject(),
    });

    res.json({ success: true, data: travelRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel travel request
// @route   POST /api/travel-requests/:id/cancel
// @access  Private
const cancelTravelRequest = async (req, res, next) => {
  try {
    const travelRequest = await TravelRequest.findById(req.params.id);
    if (!travelRequest) {
      return res.status(404).json({ success: false, message: 'Travel request not found' });
    }

    travelRequest.status = 'Cancelled';
    await travelRequest.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TRAVEL_REQUEST_CANCELLED',
      entity: 'TRAVEL_REQUEST',
      entityId: travelRequest.requestId,
      description: `Travel request ${travelRequest.requestId} was cancelled by ${req.user.name}`,
    });

    res.json({ success: true, message: 'Travel request cancelled', data: travelRequest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTravelRequests,
  getTravelRequestById,
  checkPolicyPreview,
  createTravelRequest,
  updateTravelRequest,
  cancelTravelRequest,
};
