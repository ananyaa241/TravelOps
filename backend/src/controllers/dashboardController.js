// backend/src/controllers/dashboardController.js
const TravelRequest = require('../models/TravelRequest');
const Expense = require('../models/Expense');
const Reimbursement = require('../models/Reimbursement');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Employee Dashboard Metrics & Lists
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      upcomingTrips,
      pendingRequests,
      recentRequests,
      expenses,
      reimbursements,
    ] = await Promise.all([
      TravelRequest.find({
        employee: userId,
        status: { $in: ['Approved', 'Booked'] },
        departureDate: { $gte: new Date() },
      }).sort({ departureDate: 1 }).limit(5),

      TravelRequest.countDocuments({
        employee: userId,
        status: { $in: ['Submitted', 'Pending Manager Approval', 'Pending Additional Approval', 'Policy Review'] },
      }),

      TravelRequest.find({ employee: userId }).sort({ createdAt: -1 }).limit(5),

      Expense.find({ employee: userId }),

      Reimbursement.find({ employee: userId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalTravelSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const pendingExpensesCount = expenses.filter(e => e.approvalStatus === 'Submitted').length;
    const policyExceptionsCount = recentRequests.filter(r => r.policyStatus === 'Policy Exception').length;

    res.json({
      success: true,
      data: {
        stats: {
          upcomingTripsCount: upcomingTrips.length,
          pendingRequestsCount: pendingRequests,
          pendingExpensesCount,
          totalTravelSpend,
          policyExceptionsCount,
        },
        upcomingTrips,
        recentRequests,
        reimbursements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manager Dashboard Metrics & Approvals Queue
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
const getManagerDashboard = async (req, res, next) => {
  try {
    const deptId = req.user.department;

    const [
      pendingApprovals,
      approvedRequests,
      teamTrips,
      allDeptRequests,
    ] = await Promise.all([
      TravelRequest.find({
        status: { $in: ['Pending Manager Approval', 'Policy Review'] },
        $or: [
          { department: deptId },
          { 'approvalChain.role': 'MANAGER', 'approvalChain.status': 'Pending' },
        ],
      }).populate('employee', 'name email designation avatar').sort({ createdAt: -1 }),

      TravelRequest.find({
        status: 'Approved',
        $or: [{ department: deptId }, { 'approvalChain.approver': req.user._id }],
      }).sort({ updatedAt: -1 }).limit(5),

      TravelRequest.find({
        department: deptId,
        departureDate: { $gte: new Date() },
        status: { $in: ['Approved', 'Booked'] },
      }).populate('employee', 'name email designation avatar').sort({ departureDate: 1 }).limit(6),

      TravelRequest.find({ department: deptId }),
    ]);

    const teamTravelSpend = allDeptRequests.reduce((sum, r) => sum + (r.estimatedTotalCost || 0), 0);
    const policyExceptionsCount = pendingApprovals.filter(r => r.policyStatus === 'Policy Exception').length;

    res.json({
      success: true,
      data: {
        stats: {
          pendingApprovalsCount: pendingApprovals.length,
          teamTravelSpend,
          upcomingTeamTripsCount: teamTrips.length,
          policyExceptionsCount,
        },
        pendingApprovals,
        approvedRequests,
        teamTrips,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Travel Coordinator Dashboard
// @route   GET /api/dashboard/coordinator
// @access  Private (Coordinator)
const getCoordinatorDashboard = async (req, res, next) => {
  try {
    const [
      pendingBookings,
      upcomingBookings,
      activeTrips,
      allBookings,
    ] = await Promise.all([
      TravelRequest.find({
        status: 'Approved',
        bookingStatus: { $in: ['Not Started', 'In Progress'] },
      }).populate('employee', 'name email employeeId phone designation').sort({ departureDate: 1 }),

      Booking.find({
        travelDate: { $gte: new Date() },
        status: 'Confirmed',
      }).sort({ travelDate: 1 }).limit(10),

      TravelRequest.find({
        status: { $in: ['Booked', 'Approved'] },
        departureDate: { $lte: new Date() },
        returnDate: { $gte: new Date() },
      }).populate('employee', 'name email designation'),

      Booking.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          pendingBookingTasks: pendingBookings.length,
          upcomingBookingsCount: upcomingBookings.length,
          activeTripsCount: activeTrips.length,
          totalBookingsCount: allBookings.length,
        },
        pendingBookings,
        upcomingBookings,
        activeTrips,
        recentBookings: allBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finance Dashboard Metrics & Trends
// @route   GET /api/dashboard/finance
// @access  Private (Finance)
const getFinanceDashboard = async (req, res, next) => {
  try {
    const [
      pendingExpenses,
      approvedExpenses,
      reimbursements,
      allRequests,
    ] = await Promise.all([
      Expense.find({ approvalStatus: 'Submitted' }).populate('employee', 'name email employeeId designation').populate('travelRequest', 'requestId destination departureDate returnDate'),
      Expense.find({ approvalStatus: 'Approved' }),
      Reimbursement.find().populate('employee', 'name email').sort({ createdAt: -1 }),
      TravelRequest.find({ status: { $in: ['Approved', 'Booked', 'Completed'] } }),
    ]);

    const totalTravelSpending = allRequests.reduce((sum, r) => sum + (r.estimatedTotalCost || 0), 0);
    const pendingReimbursementAmount = reimbursements
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + (r.netPayableAmount || 0), 0);
    const paidReimbursementAmount = reimbursements
      .filter(r => r.status === 'Paid')
      .reduce((sum, r) => sum + (r.netPayableAmount || 0), 0);

    // Spend by Department breakdown
    const deptSpendMap = {};
    allRequests.forEach(r => {
      deptSpendMap[r.departmentName] = (deptSpendMap[r.departmentName] || 0) + (r.estimatedTotalCost || 0);
    });
    const departmentSpendingChart = Object.keys(deptSpendMap).map(name => ({
      name,
      spend: deptSpendMap[name],
    }));

    // Expense Category Breakdown
    const catMap = {};
    [...pendingExpenses, ...approvedExpenses].forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0);
    });
    const expenseCategoryChart = Object.keys(catMap).map(category => ({
      name: category,
      value: catMap[category],
    }));

    // Monthly Spend Trend (Simulated / aggregated)
    const monthlySpendingChart = [
      { month: 'May', spend: 320000 },
      { month: 'Jun', spend: 450000 },
      { month: 'Jul', spend: 380000 },
      { month: 'Aug', spend: 520000 },
      { month: 'Sep', spend: totalTravelSpending || 640000 },
    ];

    res.json({
      success: true,
      data: {
        stats: {
          pendingExpensesCount: pendingExpenses.length,
          approvedExpensesCount: approvedExpenses.length,
          totalTravelSpending,
          pendingReimbursementAmount,
          paidReimbursementAmount,
          policyExceptionsCount: pendingExpenses.filter(e => e.policyStatus === 'Policy Exception').length,
        },
        pendingExpenses,
        reimbursementQueue: reimbursements.filter(r => r.status === 'Pending'),
        charts: {
          departmentSpending: departmentSpendingChart,
          expenseCategories: expenseCategoryChart,
          monthlySpending: monthlySpendingChart,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Organization-wide Overview
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      departments,
      allRequests,
      activeTrips,
      pendingApprovals,
      expenses,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Department.find(),
      TravelRequest.find().sort({ createdAt: -1 }),
      TravelRequest.find({
        status: { $in: ['Booked', 'Approved'] },
        departureDate: { $lte: new Date() },
        returnDate: { $gte: new Date() },
      }),
      TravelRequest.countDocuments({
        status: { $in: ['Submitted', 'Pending Manager Approval', 'Pending Additional Approval', 'Policy Review'] },
      }),
      Expense.find(),
    ]);

    const totalTravelSpend = allRequests.reduce((sum, r) => sum + (r.estimatedTotalCost || 0), 0);
    const policyExceptionsCount = allRequests.filter(r => r.policyStatus === 'Policy Exception').length;

    // Destination distribution chart data
    const destMap = {};
    allRequests.forEach(r => {
      if (r.destination) {
        destMap[r.destination] = (destMap[r.destination] || 0) + 1;
      }
    });
    const destinationChart = Object.keys(destMap).slice(0, 6).map(dest => ({
      destination: dest,
      count: destMap[dest],
    }));

    // Travel type distribution
    const typeMap = {};
    allRequests.forEach(r => {
      typeMap[r.travelType] = (typeMap[r.travelType] || 0) + 1;
    });
    const travelTypeChart = Object.keys(typeMap).map(type => ({
      name: type,
      value: typeMap[type],
    }));

    // Department spend
    const deptSpendMap = {};
    allRequests.forEach(r => {
      deptSpendMap[r.departmentName] = (deptSpendMap[r.departmentName] || 0) + (r.estimatedTotalCost || 0);
    });
    const departmentSpendChart = Object.keys(deptSpendMap).map(dept => ({
      department: dept,
      spend: deptSpendMap[dept],
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          departmentsCount: departments.length,
          activeTripsCount: activeTrips.length,
          pendingApprovalsCount: pendingApprovals,
          totalTravelSpend,
          policyExceptionsCount,
        },
        recentRequests: allRequests.slice(0, 8),
        charts: {
          destinations: destinationChart,
          travelTypes: travelTypeChart,
          departmentSpend: departmentSpendChart,
          monthlyTrend: [
            { month: 'Jun', spend: 410000, trips: 12 },
            { month: 'Jul', spend: 530000, trips: 18 },
            { month: 'Aug', spend: 490000, trips: 15 },
            { month: 'Sep', spend: totalTravelSpend || 680000, trips: allRequests.length },
          ],
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployeeDashboard,
  getManagerDashboard,
  getCoordinatorDashboard,
  getFinanceDashboard,
  getAdminDashboard,
};
