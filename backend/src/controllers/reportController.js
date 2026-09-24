// backend/src/controllers/reportController.js
const TravelRequest = require('../models/TravelRequest');
const Expense = require('../models/Expense');
const Reimbursement = require('../models/Reimbursement');
const Department = require('../models/Department');

// @desc    Get aggregated travel report with multi-criteria filters
// @route   GET /api/reports/travel
// @access  Private (Admin, Finance, Manager)
const getTravelReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, travelType, status } = req.query;
    const query = {};

    if (department) query.department = department;
    if (travelType) query.travelType = travelType;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.departureDate = {};
      if (startDate) query.departureDate.$gte = new Date(startDate);
      if (endDate) query.departureDate.$lte = new Date(endDate);
    }

    const records = await TravelRequest.find(query)
      .populate('employee', 'name email employeeId designation')
      .populate('department', 'name code')
      .sort({ departureDate: -1 });

    const totalSpend = records.reduce((sum, r) => sum + (r.estimatedTotalCost || 0), 0);
    const totalTrips = records.length;
    const policyExceptionsCount = records.filter(r => r.policyStatus === 'Policy Exception').length;

    res.json({
      success: true,
      data: records,
      summary: {
        totalTrips,
        totalSpend,
        policyExceptionsCount,
        averageTripCost: totalTrips > 0 ? Math.round(totalSpend / totalTrips) : 0,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated expenses report
// @route   GET /api/reports/expenses
// @access  Private (Admin, Finance)
const getExpenseReport = async (req, res, next) => {
  try {
    const { category, department, startDate, endDate, approvalStatus } = req.query;
    const query = {};

    if (category) query.category = category;
    if (department) query.department = department;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('employee', 'name email employeeId')
      .populate('travelRequest', 'requestId destination')
      .sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({
      success: true,
      data: expenses,
      summary: {
        totalCount: expenses.length,
        totalAmount,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department budget vs spent report
// @route   GET /api/reports/department-spend
// @access  Private (Admin, Finance)
const getDepartmentSpendReport = async (req, res, next) => {
  try {
    const departments = await Department.find();
    
    // Aggregate travel spend per department from travel requests
    const spendAgg = await TravelRequest.aggregate([
      { $match: { status: { $in: ['Approved', 'Booked', 'Completed'] } } },
      { $group: { _id: '$departmentName', totalSpent: { $sum: '$estimatedTotalCost' }, count: { $sum: 1 } } }
    ]);

    const spendMap = {};
    spendAgg.forEach(item => {
      spendMap[item._id] = { spent: item.totalSpent, trips: item.count };
    });

    const report = departments.map(d => {
      const stats = spendMap[d.name] || { spent: 0, trips: 0 };
      const remaining = Math.max(0, d.annualBudget - stats.spent);
      const utilization = d.annualBudget > 0 ? Math.round((stats.spent / d.annualBudget) * 100) : 0;
      return {
        _id: d._id,
        name: d.name,
        code: d.code,
        annualBudget: d.annualBudget,
        spent: stats.spent,
        remaining,
        utilization,
        tripsCount: stats.trips,
      };
    });

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTravelReport, getExpenseReport, getDepartmentSpendReport };
