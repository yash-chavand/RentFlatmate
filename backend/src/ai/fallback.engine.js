function computeFallbackCompatibility(tenant, listing) {
  let score = 0;
  const pros = [];
  const cons = [];

  // 1. Budget Match (Weight: 40%)
  const rent = listing.rent;
  const minBudget = tenant.budgetMin;
  const maxBudget = tenant.budgetMax;

  if (rent <= maxBudget) {
    score += 40;
    pros.push('Property rent fits within your budget range.');
  } else {
    const excessPct = (rent - maxBudget) / maxBudget;
    if (excessPct < 0.25) {
      // Scale down points if slightly over budget
      const budgetPoints = Math.round(40 * (1 - excessPct * 4));
      score += budgetPoints;
      cons.push(`Monthly rent is slightly above your maximum budget ($${maxBudget}).`);
    } else {
      cons.push(`Monthly rent exceeds your maximum budget by more than 25%.`);
    }
  }

  // 2. Location Match (Weight: 30%)
  const cleanPrefLocation = (tenant.preferredLocation || '').toLowerCase().trim();
  const cleanListingLocation = (listing.location || '').toLowerCase().trim();

  // Simple overlap check
  const isSubstringMatch = 
    cleanListingLocation.includes(cleanPrefLocation) || 
    cleanPrefLocation.includes(cleanListingLocation);

  const getWordMatch = () => {
    const prefWords = cleanPrefLocation.split(/[\s,]+/);
    const listingWords = cleanListingLocation.split(/[\s,]+/);
    return prefWords.some(w => w.length > 2 && listingWords.includes(w));
  };

  if (isSubstringMatch || getWordMatch()) {
    score += 30;
    pros.push('Property is located in or near your preferred area.');
  } else {
    cons.push('Location is outside your preferred neighborhood.');
  }

  // 3. Move-in Date proximity (Weight: 20%)
  const moveInDate = new Date(tenant.moveInDate).getTime();
  const availableDate = new Date(listing.availableDate).getTime();
  const diffTime = Math.abs(availableDate - moveInDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    score += 20;
    pros.push('Available date aligns very well with your target move-in timeline.');
  } else if (diffDays <= 30) {
    const datePoints = Math.round(20 * (1 - (diffDays - 7) / 23));
    score += datePoints;
    pros.push('Available date is within one month of your target move-in date.');
  } else {
    cons.push(`Available date is ${diffDays} days away from your preferred move-in date.`);
  }

  // 4. Furnished Preference Match (Weight: 10%)
  const tenantPref = tenant.furnishedPref;
  const listingFurnished = listing.furnished;

  if (tenantPref === null || tenantPref === undefined) {
    // Tenant has no strong preference
    score += 10;
  } else if (tenantPref === listingFurnished) {
    score += 10;
    pros.push(listingFurnished ? 'Fully furnished room matches your preference.' : 'Unfurnished room matches your preference.');
  } else {
    cons.push(listingFurnished ? 'Room is fully furnished, which differs from your preference.' : 'Room is unfurnished, but you prefer a furnished one.');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    explanation: 'Rule-based matching algorithm computed compatibility based on budget, location, available date, and furnishing style.',
    pros,
    cons,
  };
}

module.exports = { computeFallbackCompatibility };
