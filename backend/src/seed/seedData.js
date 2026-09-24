// backend/src/seed/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const TravelPolicy = require('../models/TravelPolicy');
const ApprovalRule = require('../models/ApprovalRule');
const TravelRequest = require('../models/TravelRequest');
const Approval = require('../models/Approval');
const Itinerary = require('../models/Itinerary');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const Expense = require('../models/Expense');
const Reimbursement = require('../models/Reimbursement');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelops';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      TravelPolicy.deleteMany({}),
      ApprovalRule.deleteMany({}),
      TravelRequest.deleteMany({}),
      Approval.deleteMany({}),
      Itinerary.deleteMany({}),
      Booking.deleteMany({}),
      Vendor.deleteMany({}),
      Expense.deleteMany({}),
      Reimbursement.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data.');

    // 1. Create Departments
    const deptEngineering = await Department.create({
      name: 'Engineering & Technology',
      code: 'ENG',
      description: 'Core platform engineering and cloud infrastructure team',
      annualBudget: 2500000,
      spentBudget: 620000,
    });

    const deptSales = await Department.create({
      name: 'Sales & Business Development',
      code: 'SBD',
      description: 'Enterprise client acquisition and international sales',
      annualBudget: 4000000,
      spentBudget: 1450000,
    });

    const deptProduct = await Department.create({
      name: 'Product & Design',
      code: 'PRD',
      description: 'Product strategy, user research, and UI/UX design',
      annualBudget: 1500000,
      spentBudget: 380000,
    });

    const deptFinance = await Department.create({
      name: 'Finance & Legal',
      code: 'FIN',
      description: 'Corporate finance, taxation, compliance, and accounts',
      annualBudget: 1000000,
      spentBudget: 210000,
    });

    console.log('[Seed] Created Departments.');

    // 2. Create Users
    const password = 'TravelOps@2026';

    const adminUser = await User.create({
      name: 'Rajesh Sharma',
      email: 'admin@travelops.demo',
      password,
      role: 'COMPANY ADMIN',
      department: deptFinance._id,
      departmentName: deptFinance.name,
      employeeId: 'EMP-1001',
      designation: 'VP of Corporate Operations',
      phone: '+91 98112 34567',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const managerUser = await User.create({
      name: 'Priya Venkatesh',
      email: 'manager@travelops.demo',
      password,
      role: 'MANAGER',
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      employeeId: 'EMP-1002',
      designation: 'Engineering Director',
      phone: '+91 98450 12345',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const employeeUser = await User.create({
      name: 'Arjun Verma',
      email: 'employee@travelops.demo',
      password,
      role: 'EMPLOYEE',
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      employeeId: 'EMP-1003',
      designation: 'Senior Lead Architect',
      phone: '+91 97170 88990',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const coordinatorUser = await User.create({
      name: 'Sunita Menon',
      email: 'coordinator@travelops.demo',
      password,
      role: 'TRAVEL COORDINATOR',
      department: deptFinance._id,
      departmentName: deptFinance.name,
      employeeId: 'EMP-1004',
      designation: 'Lead Travel & Logistics Specialist',
      phone: '+91 99200 44556',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const financeUser = await User.create({
      name: 'Vikramaditya Rao',
      email: 'finance@travelops.demo',
      password,
      role: 'FINANCE OFFICER',
      department: deptFinance._id,
      departmentName: deptFinance.name,
      employeeId: 'EMP-1005',
      designation: 'Senior Finance Controller',
      phone: '+91 98300 77889',
      city: 'Delhi',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    });

    // Link managers to depts
    deptEngineering.manager = managerUser._id;
    await deptEngineering.save();
    deptFinance.manager = adminUser._id;
    await deptFinance.save();

    console.log('[Seed] Created Demo Users.');

    // 3. Create Travel Policies
    await TravelPolicy.create([
      {
        title: 'Standard Domestic Travel Policy',
        department: null,
        departmentName: 'All Departments',
        travelType: 'Domestic',
        hotelMaxPerNight: 8000,
        mealsMaxPerDay: 2000,
        transportMaxPerDay: 3000,
        flightClassDomestic: 'Economy',
        flightClassInternational: 'Economy',
        advanceLimitPercentage: 80,
        requireReceiptThreshold: 500,
        notes: 'Standard policy: Economy flights, 4-star hotel capped at ₹8,000/night.',
      },
      {
        title: 'Sales & Executive Client Visit Policy',
        department: deptSales._id,
        departmentName: deptSales.name,
        travelType: 'Client Visit',
        hotelMaxPerNight: 12000,
        mealsMaxPerDay: 3500,
        transportMaxPerDay: 5000,
        flightClassDomestic: 'Economy',
        flightClassInternational: 'Premium Economy',
        advanceLimitPercentage: 90,
        requireReceiptThreshold: 500,
        notes: 'Enhanced allowances for client facing meetings and high-tier hospitality.',
      },
      {
        title: 'International Business & Conferences',
        department: null,
        departmentName: 'All Departments',
        travelType: 'International',
        hotelMaxPerNight: 20000,
        mealsMaxPerDay: 6000,
        transportMaxPerDay: 8000,
        flightClassDomestic: 'Economy',
        flightClassInternational: 'Business',
        advanceLimitPercentage: 85,
        notes: 'Covers international transit, visa allowances, and foreign per-diem.',
      }
    ]);

    // 4. Create Approval Rules
    await ApprovalRule.create([
      {
        name: 'Standard Low Value Approval (< ₹25k)',
        minAmount: 0,
        maxAmount: 25000,
        requiredApprovalLevels: [
          { level: 1, role: 'MANAGER', label: 'Direct Reporting Manager' }
        ],
      },
      {
        name: 'Mid Value Travel Tier (₹25k - ₹1,00,000)',
        minAmount: 25001,
        maxAmount: 100000,
        requiredApprovalLevels: [
          { level: 1, role: 'MANAGER', label: 'Reporting Manager' },
          { level: 2, role: 'FINANCE OFFICER', label: 'Finance Controller Review' }
        ],
      },
      {
        name: 'Executive & High Value Travel (> ₹1,00,000)',
        minAmount: 100001,
        maxAmount: 10000000,
        requiredApprovalLevels: [
          { level: 1, role: 'MANAGER', label: 'Department Head' },
          { level: 2, role: 'FINANCE OFFICER', label: 'Finance Controller' },
          { level: 3, role: 'COMPANY ADMIN', label: 'Executive Admin Sign-off' }
        ],
      }
    ]);

    // 5. Create Vendors
    const vendorIndigo = await Vendor.create({
      name: 'IndiGo Airlines Corporate',
      vendorType: 'Airline',
      contactPerson: 'Karan Mehra',
      email: 'corpdesk@goindigo.in',
      phone: '+91 124 6173838',
      city: 'Gurugram',
      rating: 4.8,
    });

    const vendorTaj = await Vendor.create({
      name: 'Taj Hotels & Resorts Business Program',
      vendorType: 'Hotel',
      contactPerson: 'Ananya Singhania',
      email: 'corpreservations@ihcltata.com',
      phone: '+91 22 66653366',
      city: 'Mumbai',
      rating: 4.9,
    });

    const vendorMarriott = await Vendor.create({
      name: 'Marriott Bonvoy Corporate Desk',
      vendorType: 'Hotel',
      contactPerson: 'Rohan Gupta',
      email: 'corporate.apac@marriott.com',
      phone: '+91 11 43335555',
      city: 'Delhi',
      rating: 4.7,
    });

    const vendorUber = await Vendor.create({
      name: 'Uber for Business India',
      vendorType: 'Transport',
      contactPerson: 'Corporate Support',
      email: 'business-support@uber.com',
      phone: '1800-266-8237',
      city: 'Hyderabad',
      rating: 4.6,
    });

    // 6. Create Travel Requests showcasing various lifecycle stages
    // TR-1: Approved & Booked Trip (Hyderabad -> Bengaluru) - The Perfect User Flow Demo!
    const trip1 = await TravelRequest.create({
      requestId: 'TR-1024',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      employeeEmail: employeeUser.email,
      employeeIdCode: employeeUser.employeeId,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelType: 'Business Conference',
      purpose: 'Keynote Speaker at AWS Community Day & Tech Summit 2026',
      origin: 'Hyderabad',
      destination: 'Bengaluru',
      departureDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      returnDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),    // 3 days duration
      durationDays: 3,
      travelersCount: 1,
      estimatedAccommodationCost: 18000, // ₹6,000 / night (Within ₹8,000 policy)
      estimatedTransportationCost: 9000,
      estimatedMealsCost: 4500,          // ₹1,500 / day (Within ₹2,000 policy)
      estimatedOtherCost: 500,
      estimatedTotalCost: 32000,
      advanceRequested: 10000,
      businessCode: 'PRJ-AWS-CONF-26',
      status: 'Booked',
      policyStatus: 'Within Policy',
      policyViolations: [],
      currentApprovalLevel: 1,
      bookingStatus: 'Completed',
      approvalChain: [
        {
          level: 1,
          role: 'MANAGER',
          approver: managerUser._id,
          approverName: managerUser.name,
          status: 'Approved',
          comment: 'Approved. Essential technical keynote representation for TravelOps.',
          actionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        }
      ]
    });

    // Itinerary for TR-1024
    await Itinerary.create({
      travelRequest: trip1._id,
      requestId: trip1.requestId,
      employee: employeeUser._id,
      items: [
        {
          type: 'Flight',
          provider: 'IndiGo Airlines (6E-512)',
          bookingReference: '6E-HYD-BLR-892',
          date: trip1.departureDate,
          startTime: '08:30',
          endTime: '09:45',
          origin: 'RGIA Airport (HYD)',
          destination: 'Kempegowda Int. Airport (BLR)',
          location: 'Hyderabad → Bengaluru',
          cost: 4500,
          status: 'Confirmed',
          notes: 'Terminal 2 arrival. Seat 4A Window (Web check-in complete).',
        },
        {
          type: 'Taxi',
          provider: 'Uber Premier Business',
          bookingReference: 'UBR-77821',
          date: trip1.departureDate,
          startTime: '10:15',
          endTime: '11:30',
          location: 'BLR Airport → Taj West End, Race Course Rd',
          cost: 1450,
          status: 'Confirmed',
        },
        {
          type: 'Hotel',
          provider: 'Taj West End Bengaluru',
          bookingReference: 'TAJ-BLR-66712',
          date: trip1.departureDate,
          startTime: '12:00',
          endTime: '11:00',
          location: 'Race Course Rd, High Grounds, Bengaluru',
          cost: 18000,
          status: 'Confirmed',
          notes: '3 Nights Luxury Room with complimentary breakfast & high-speed Wi-Fi.',
        },
        {
          type: 'Meeting',
          provider: 'AWS Cloud Summit',
          bookingReference: 'SUMMIT-PASS-VIP',
          date: new Date(trip1.departureDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          startTime: '09:30',
          endTime: '17:00',
          location: 'Bangalore International Exhibition Centre (BIEC)',
          cost: 0,
          status: 'Confirmed',
          notes: 'Keynote session on Enterprise Microservices at 14:30.',
        },
        {
          type: 'Flight',
          provider: 'IndiGo Airlines (6E-678)',
          bookingReference: '6E-BLR-HYD-991',
          date: trip1.returnDate,
          startTime: '19:40',
          endTime: '20:50',
          location: 'Bengaluru → Hyderabad',
          cost: 4500,
          status: 'Confirmed',
        }
      ]
    });

    // Bookings for TR-1024
    await Booking.create([
      {
        bookingId: 'BK-2001',
        travelRequest: trip1._id,
        requestId: trip1.requestId,
        employeeName: trip1.employeeName,
        destination: trip1.destination,
        vendor: vendorIndigo._id,
        vendorName: 'IndiGo Airlines Corporate',
        bookingType: 'Flight',
        referenceNumber: '6E-HYD-BLR-892',
        travelDate: trip1.departureDate,
        cost: 9000,
        coordinator: coordinatorUser._id,
        status: 'Confirmed',
        notes: 'Round-trip HYD-BLR Economy booked via corporate rate.',
      },
      {
        bookingId: 'BK-2002',
        travelRequest: trip1._id,
        requestId: trip1.requestId,
        employeeName: trip1.employeeName,
        destination: trip1.destination,
        vendor: vendorTaj._id,
        vendorName: 'Taj Hotels & Resorts',
        bookingType: 'Hotel',
        referenceNumber: 'TAJ-BLR-66712',
        travelDate: trip1.departureDate,
        returnDate: trip1.returnDate,
        cost: 18000,
        coordinator: coordinatorUser._id,
        status: 'Confirmed',
        notes: 'Executive room reserved with corporate discount code TOP-CORP-2026.',
      }
    ]);

    // TR-2: Pending Manager Approval (Mumbai -> Delhi, Client Visit)
    const trip2 = await TravelRequest.create({
      requestId: 'TR-1025',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      employeeEmail: employeeUser.email,
      employeeIdCode: employeeUser.employeeId,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelType: 'Client Visit',
      purpose: 'Strategic Architecture Review with Tata Consultancy Group',
      origin: 'Mumbai',
      destination: 'Delhi NCR',
      departureDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      durationDays: 2,
      travelersCount: 1,
      estimatedAccommodationCost: 14000,
      estimatedTransportationCost: 11000,
      estimatedMealsCost: 3000,
      estimatedOtherCost: 1000,
      estimatedTotalCost: 29000,
      advanceRequested: 5000,
      businessCode: 'PRJ-CLIENT-TATA',
      status: 'Pending Manager Approval',
      policyStatus: 'Within Policy',
      policyViolations: [],
      currentApprovalLevel: 1,
      approvalChain: [
        {
          level: 1,
          role: 'MANAGER',
          status: 'Pending',
        }
      ]
    });

    // TR-3: Policy Exception Example (Pune -> Goa, Team Offsite with luxury hotel violation)
    const trip3 = await TravelRequest.create({
      requestId: 'TR-1026',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      employeeEmail: employeeUser.email,
      employeeIdCode: employeeUser.employeeId,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelType: 'Site Visit',
      purpose: 'Annual Cloud Infrastructure Engineering Offsite',
      origin: 'Pune',
      destination: 'Goa',
      departureDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      durationDays: 3,
      travelersCount: 1,
      estimatedAccommodationCost: 36000, // ₹12,000 / night (Policy cap is ₹8,000)
      estimatedTransportationCost: 8000,
      estimatedMealsCost: 9000,          // ₹3,000 / day (Policy cap is ₹2,000)
      estimatedOtherCost: 2000,
      estimatedTotalCost: 55000,
      advanceRequested: 25000,
      businessCode: 'PRJ-OFFSITE-2026',
      status: 'Pending Additional Approval',
      policyStatus: 'Policy Exception',
      policyViolations: [
        {
          rule: 'Hotel Nightly Rate Cap Exceeded',
          category: 'Accommodation',
          requestedAmount: 12000,
          allowedAmount: 8000,
          difference: 4000,
          description: 'Requested ₹12,000/night exceeds policy cap of ₹8,000/night (Excess: ₹4,000/night)',
        },
        {
          rule: 'Daily Meal Allowance Cap Exceeded',
          category: 'Meals',
          requestedAmount: 3000,
          allowedAmount: 2000,
          difference: 1000,
          description: 'Requested ₹3,000/day exceeds policy limit of ₹2,000/day (Excess: ₹1,000/day)',
        }
      ],
      currentApprovalLevel: 2,
      approvalChain: [
        {
          level: 1,
          role: 'MANAGER',
          approver: managerUser._id,
          approverName: managerUser.name,
          status: 'Approved',
          comment: 'Approved at department level. Escalating to Finance due to hotel exception.',
          actionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          level: 2,
          role: 'FINANCE OFFICER',
          status: 'Pending',
        }
      ]
    });

    // TR-4: Completed Trip with submitted Expenses & Reimbursement
    const trip4 = await TravelRequest.create({
      requestId: 'TR-1020',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      employeeEmail: employeeUser.email,
      employeeIdCode: employeeUser.employeeId,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelType: 'Domestic',
      purpose: 'Fintech Security Audit at Client Data Center',
      origin: 'Hyderabad',
      destination: 'Chennai',
      departureDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      returnDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      durationDays: 3,
      travelersCount: 1,
      estimatedAccommodationCost: 15000,
      estimatedTransportationCost: 8000,
      estimatedMealsCost: 4000,
      estimatedTotalCost: 27000,
      advanceRequested: 0,
      businessCode: 'PRJ-FINTECH-AUDIT',
      status: 'Completed',
      policyStatus: 'Within Policy',
      bookingStatus: 'Completed',
      expensesSubmitted: true,
      totalActualExpense: 19700,
    });

    // 7. Create Expenses for TR-1020
    const exp1 = await Expense.create({
      expenseId: 'EX-3001',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelRequest: trip4._id,
      requestId: trip4.requestId,
      category: 'Hotel',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      amount: 7500,
      currency: 'INR',
      description: 'ITC Grand Chola Chennai 2-Night Stay',
      merchant: 'ITC Grand Chola',
      receiptUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
      receiptName: 'ITC_Invoice_7500.pdf',
      policyStatus: 'Within Policy',
      approvalStatus: 'Approved',
      financeReviewer: financeUser._id,
      financeReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    const exp2 = await Expense.create({
      expenseId: 'EX-3002',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelRequest: trip4._id,
      requestId: trip4.requestId,
      category: 'Flight',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      amount: 9000,
      currency: 'INR',
      description: 'Air India HYD-MAA Return Airfare Ticket',
      merchant: 'Air India',
      receiptUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60',
      receiptName: 'AirIndia_E_Ticket.pdf',
      policyStatus: 'Within Policy',
      approvalStatus: 'Approved',
      financeReviewer: financeUser._id,
      financeReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    const exp3 = await Expense.create({
      expenseId: 'EX-3003',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelRequest: trip4._id,
      requestId: trip4.requestId,
      category: 'Food',
      date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      amount: 2000,
      currency: 'INR',
      description: 'Dinner & client working lunch',
      merchant: 'Dakshin Restaurant',
      receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60',
      receiptName: 'Food_Bill_2000.pdf',
      policyStatus: 'Within Policy',
      approvalStatus: 'Approved',
      financeReviewer: financeUser._id,
      financeReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    const exp4 = await Expense.create({
      expenseId: 'EX-3004',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      department: deptEngineering._id,
      departmentName: deptEngineering.name,
      travelRequest: trip4._id,
      requestId: trip4.requestId,
      category: 'Taxi',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      amount: 1200,
      currency: 'INR',
      description: 'Airport transfers & client site commute',
      merchant: 'Uber Business',
      receiptUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60',
      receiptName: 'Uber_Receipts.pdf',
      policyStatus: 'Within Policy',
      approvalStatus: 'Approved',
      financeReviewer: financeUser._id,
      financeReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    // 8. Create Reimbursement for TR-1020
    await Reimbursement.create({
      reimbursementId: 'RMB-4001',
      employee: employeeUser._id,
      employeeName: employeeUser.name,
      departmentName: deptEngineering.name,
      travelRequest: trip4._id,
      requestId: trip4.requestId,
      destination: trip4.destination,
      expenses: [exp1._id, exp2._id, exp3._id, exp4._id],
      totalClaimedAmount: 19700,
      approvedAmount: 19700,
      advanceDeducted: 0,
      netPayableAmount: 19700,
      paymentMethod: 'Bank Transfer (NEFT/RTGS)',
      paymentReference: 'NEFT-HDFC-9928174',
      processingDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      financeOfficer: financeUser._id,
      financeOfficerName: financeUser.name,
      status: 'Paid',
      remarks: 'All bills validated against policy. Transferred to salary account.',
    });

    // 9. Create Notifications
    await Notification.create([
      {
        recipient: employeeUser._id,
        title: 'Reimbursement Paid — ₹19,700 💸',
        message: 'Your travel reimbursement for Chennai trip (TR-1020) has been credited to your bank account.',
        type: 'REIMBURSEMENT_PAID',
        isRead: false,
        link: '/reimbursements',
      },
      {
        recipient: employeeUser._id,
        title: 'Travel Request TR-1024 Approved 🎉',
        message: 'Your trip to Bengaluru was approved by Priya Venkatesh. Bookings are confirmed.',
        type: 'TRAVEL_APPROVAL',
        isRead: true,
        link: '/trips',
      },
      {
        recipient: managerUser._id,
        title: 'Travel Request TR-1025 Pending Approval',
        message: 'Arjun Verma submitted request for Delhi NCR (₹29,000). Awaiting your approval.',
        type: 'TRAVEL_APPROVAL',
        isRead: false,
        link: '/approvals',
      },
      {
        recipient: financeUser._id,
        title: 'Policy Exception Review: TR-1026',
        message: 'Engineering offsite trip has a hotel exception exceeding ₹8k/night. Requires finance review.',
        type: 'POLICY_EXCEPTION',
        isRead: false,
        link: '/approvals',
      }
    ]);

    // 10. Create Initial Audit Logs
    await AuditLog.create([
      {
        user: employeeUser._id,
        userName: employeeUser.name,
        userRole: employeeUser.role,
        action: 'TRAVEL_REQUEST_CREATED',
        entity: 'TRAVEL_REQUEST',
        entityId: 'TR-1024',
        description: 'Arjun Verma created travel request TR-1024 (Hyderabad → Bengaluru)',
      },
      {
        user: managerUser._id,
        userName: managerUser.name,
        userRole: managerUser.role,
        action: 'TRAVEL_REQUEST_APPROVED',
        entity: 'TRAVEL_REQUEST',
        entityId: 'TR-1024',
        description: 'Priya Venkatesh approved travel request TR-1024 (Level 1)',
      },
      {
        user: coordinatorUser._id,
        userName: coordinatorUser.name,
        userRole: coordinatorUser.role,
        action: 'BOOKING_CREATED',
        entity: 'BOOKING',
        entityId: 'BK-2001',
        description: 'Sunita Menon booked IndiGo flights (Ref: 6E-HYD-BLR-892) for TR-1024',
      },
      {
        user: financeUser._id,
        userName: financeUser.name,
        userRole: financeUser.role,
        action: 'REIMBURSEMENT_PROCESSED',
        entity: 'REIMBURSEMENT',
        entityId: 'RMB-4001',
        description: 'Vikramaditya Rao processed disbursement of ₹19,700 via NEFT (Ref: NEFT-HDFC-9928174)',
      }
    ]);

    console.log('[Seed] Database seeded with rich enterprise data successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
