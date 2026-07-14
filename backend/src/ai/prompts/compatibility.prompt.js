function generatePrompt(tenant, listing) {
  const listingDetails = `Title: ${listing.title}, Location: ${listing.location}, Rent: ₹${listing.rent}, Room Type: ${listing.roomType}, Furnished: ${listing.furnished ? 'Yes' : 'No'}`;
  const tenantDetails = `Preferred Location: ${tenant.preferredLocation}, Budget: ₹${tenant.budgetMin} to ₹${tenant.budgetMax}, Bio: ${tenant.bio || 'None'}`;
  
  return `Given this room listing: ${listingDetails} and this tenant profile: ${tenantDetails}, compute a compatibility score from 0 to 100 based on budget and location match. Return JSON: { score: number, explanation: string }`;
}

module.exports = { generatePrompt };
