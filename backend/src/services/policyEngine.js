// backend/src/services/policyEngine.js
const TravelPolicy = require('../models/TravelPolicy');

/**
 * Validates a travel request against active corporate travel policies
 * @param {Object} travelData
 * @param {String} departmentId
 * @returns {Promise<{ policyStatus: string, violations: Array, appliedPolicy: Object }>}
 */
const evaluateTravelPolicy = async (travelData, departmentId) => {
  // Find specific department policy or fallback to global policy
  let policy = null;
  if (departmentId) {
    policy = await TravelPolicy.findOne({ department: departmentId, isActive: true });
  }
  if (!policy) {
    policy = await TravelPolicy.findOne({ department: null, isActive: true });
  }

  // Fallback defaults if no policy in DB
  const hotelMaxPerNight = policy ? policy.hotelMaxPerNight : 8000;
  const mealsMaxPerDay = policy ? policy.mealsMaxPerDay : 2000;
  const transportMaxPerDay = policy ? policy.transportMaxPerDay : 3000;
  const advanceLimitPercentage = policy ? policy.advanceLimitPercentage : 80;

  const durationDays = travelData.durationDays || 1;
  const violations = [];

  // 1. Hotel policy validation
  const requestedHotelPerNight = (travelData.estimatedAccommodationCost || 0) / durationDays;
  if (requestedHotelPerNight > hotelMaxPerNight) {
    const diff = Math.round(requestedHotelPerNight - hotelMaxPerNight);
    violations.push({
      rule: 'Hotel Nightly Rate Cap Exceeded',
      category: 'Accommodation',
      requestedAmount: requestedHotelPerNight,
      allowedAmount: hotelMaxPerNight,
      difference: diff,
      description: `Requested ₹${requestedHotelPerNight.toLocaleString()}/night exceeds policy cap of ₹${hotelMaxPerNight.toLocaleString()}/night (Excess: ₹${diff.toLocaleString()}/night)`,
    });
  }

  // 2. Meals policy validation
  const requestedMealsPerDay = (travelData.estimatedMealsCost || 0) / durationDays;
  if (requestedMealsPerDay > mealsMaxPerDay) {
    const diff = Math.round(requestedMealsPerDay - mealsMaxPerDay);
    violations.push({
      rule: 'Daily Meal Allowance Cap Exceeded',
      category: 'Meals',
      requestedAmount: requestedMealsPerDay,
      allowedAmount: mealsMaxPerDay,
      difference: diff,
      description: `Requested ₹${requestedMealsPerDay.toLocaleString()}/day exceeds policy limit of ₹${mealsMaxPerDay.toLocaleString()}/day (Excess: ₹${diff.toLocaleString()}/day)`,
    });
  }

  // 3. Transportation policy validation
  const requestedTransportPerDay = (travelData.estimatedTransportationCost || 0) / durationDays;
  if (requestedTransportPerDay > transportMaxPerDay && travelData.travelType === 'Domestic') {
    const diff = Math.round(requestedTransportPerDay - transportMaxPerDay);
    violations.push({
      rule: 'Daily Transport Allowance Exceeded',
      category: 'Transportation',
      requestedAmount: requestedTransportPerDay,
      allowedAmount: transportMaxPerDay,
      difference: diff,
      description: `Requested transport ₹${requestedTransportPerDay.toLocaleString()}/day exceeds normal domestic daily cap of ₹${transportMaxPerDay.toLocaleString()}/day`,
    });
  }

  // 4. Advance requested limit
  const totalEst = travelData.estimatedTotalCost || 0;
  const maxAdvanceAllowed = (totalEst * advanceLimitPercentage) / 100;
  if (travelData.advanceRequested && travelData.advanceRequested > maxAdvanceAllowed) {
    const diff = Math.round(travelData.advanceRequested - maxAdvanceAllowed);
    violations.push({
      rule: 'Advance Cash Request Exceeds Threshold',
      category: 'Advance',
      requestedAmount: travelData.advanceRequested,
      allowedAmount: maxAdvanceAllowed,
      difference: diff,
      description: `Requested advance ₹${travelData.advanceRequested.toLocaleString()} exceeds ${advanceLimitPercentage}% of estimated trip cost (Max allowed: ₹${maxAdvanceAllowed.toLocaleString()})`,
    });
  }

  const policyStatus = violations.length > 0 ? 'Policy Exception' : 'Within Policy';

  return {
    policyStatus,
    violations,
    appliedPolicy: policy,
  };
};

module.exports = { evaluateTravelPolicy };
