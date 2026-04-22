/**
 * Recommendation Service - Plant Recommendation Logic
 * Implements filtering, scoring, and ranking algorithm
 * 
 * Scoring System:
 * +2 if temperature matches
 * +2 if sunlight matches
 * +2 if soil matches
 * +2 if spaceType matches
 * +1 if region matches
 */

/**
 * Check if plant temperature range matches current temperature
 * @param {Object} plant - Plant object with temperature_range
 * @param {number} currentTemp - Current temperature
 * @returns {boolean} True if temperature is suitable
 */
function checkTemperatureMatch(plant, currentTemp) {
  const { min, max } = plant.temperature_range;
  return currentTemp >= min && currentTemp <= max;
}

/**
 * Check if plant sunlight requirement matches input
 * @param {string} plantSunlight - Plant's sunlight requirement ('low', 'medium', 'high')
 * @param {string} userSunlight - User's available sunlight
 * @returns {boolean} True if sunlight matches
 */
function checkSunlightMatch(plantSunlight, userSunlight) {
  // Mapping of sunlight levels for flexibility
  const sunlightMap = {
    low: ["low", "medium"],      // Low light plants can work in medium
    medium: ["low", "medium", "high"],  // Medium tolerates all
    high: ["medium", "high"]     // High light plants work in medium or high
  };
  
  return sunlightMap[plantSunlight]?.includes(userSunlight) || false;
}

/**
 * Check if plant space type matches user's space
 * @param {Array<string>} plantSpaces - Spaces where plant can grow
 * @param {string} userSpace - User's available space
 * @returns {boolean} True if space is compatible
 */
function checkSpaceMatch(plantSpaces, userSpace) {
  return plantSpaces.includes(userSpace);
}

/**
 * Check if plant soil requirements match user's soil
 * @param {Array<string>} plantSoils - Plant's soil requirements
 * @param {Array<string>} userSoils - User's available soils (optional)
 * @returns {boolean} True if soil matches or user has no soil preference
 */
function checkSoilMatch(plantSoils, userSoils) {
  if (!userSoils || userSoils.length === 0) {
    return true; // If user doesn't specify soil, all plants match
  }
  
  return userSoils.some(userSoil => plantSoils.includes(userSoil));
}

/**
 * Check if plant region preference matches climate
 * @param {Array<string>} plantRegions - Plant's preferred regions
 * @param {Array<string>} climateRegions - Current climate regions
 * @returns {boolean} True if at least one region matches
 */
function checkRegionMatch(plantRegions, climateRegions) {
  return plantRegions.some(region => climateRegions.includes(region));
}

/**
 * Calculate recommendation score for a plant
 * @param {Object} plant - Plant object
 * @param {Object} criteria - Recommendation criteria
 * @returns {number} Total score (higher is better)
 */
function calculatePlantScore(plant, criteria) {
  let score = 0;
  const { temperature, sunlight, space, soilTypes, climateRegions } = criteria;
  
  // Temperature match: +2 points
  if (checkTemperatureMatch(plant, temperature)) {
    score += 2;
  }
  
  // Sunlight match: +2 points
  if (checkSunlightMatch(plant.sunlight, sunlight)) {
    score += 2;
  }
  
  // Space type match: +2 points
  if (checkSpaceMatch(plant.space, space)) {
    score += 2;
  }
  
  // Soil match: +2 points
  if (checkSoilMatch(plant.soil, soilTypes)) {
    score += 2;
  }
  
  // Region/climate match: +1 point
  if (checkRegionMatch(plant.region, climateRegions)) {
    score += 1;
  }
  
  return score;
}

/**
 * Generate explanation for why a plant is recommended
 * @param {Object} plant - Plant object
 * @param {Object} criteria - Recommendation criteria
 * @returns {string} Human-readable explanation
 */
function generateExplanation(plant, criteria) {
  const reasons = [];
  const { temperature, sunlight, space, climateRegions } = criteria;
  
  // Temperature explanation
  if (checkTemperatureMatch(plant, temperature)) {
    reasons.push(`thrives in ${temperature}°C temperatures`);
  }
  
  // Sunlight explanation
  if (checkSunlightMatch(plant.sunlight, sunlight)) {
    reasons.push(`perfect for ${sunlight} sunlight environments`);
  }
  
  // Space explanation
  if (checkSpaceMatch(plant.space, space)) {
    reasons.push(`ideal for ${space} spaces`);
  }
  
  // Region explanation
  if (checkRegionMatch(plant.region, climateRegions)) {
    const matchedRegion = plant.region.find(r => climateRegions.includes(r));
    reasons.push(`suited for ${matchedRegion} climates in your region`);
  }
  
  // Maintenance info
  if (plant.maintenance === "low") {
    reasons.push("low maintenance");
  }
  
  return reasons.length > 0 
    ? `Suitable because it ${reasons.join(", ")}.`
    : "Matches your space requirements.";
}

/**
 * Filter plants based on hard constraints
 * @param {Array<Object>} plants - All available plants
 * @param {Object} criteria - Filtering criteria
 * @returns {Array<Object>} Filtered plants that meet minimum requirements
 */
function filterPlants(plants, criteria) {
  return plants.filter(plant => {
    // Hard constraints - plant must meet all these
    const tempMatches = checkTemperatureMatch(plant, criteria.temperature);
    const sunlightMatches = checkSunlightMatch(plant.sunlight, criteria.sunlight);
    const spaceMatches = checkSpaceMatch(plant.space, criteria.space);
    
    return tempMatches && sunlightMatches && spaceMatches;
  });
}

/**
 * Get top recommended plants
 * @param {Array<Object>} plants - All available plants
 * @param {Object} criteria - Recommendation criteria
 * @param {number} topN - Number of top recommendations to return (default: 5)
 * @returns {Array<Object>} Top N recommended plants with scores and explanations
 */
function getTopRecommendations(plants, criteria, topN = 5) {
  // Step 1: Filter plants that meet hard requirements
  const filteredPlants = filterPlants(plants, criteria);
  
  if (filteredPlants.length === 0) {
    return [];
  }
  
  // Step 2: Score each filtered plant
  const scoredPlants = filteredPlants.map(plant => ({
    ...plant,
    score: calculatePlantScore(plant, criteria),
    reason: generateExplanation(plant, criteria)
  }));
  
  // Step 3: Sort by score (descending)
  scoredPlants.sort((a, b) => b.score - a.score);
  
  // Step 4: Return top N plants
  return scoredPlants.slice(0, topN);
}

/**
 * Get alternative recommendations if top recommendations are insufficient
 * @param {Array<Object>} plants - All available plants
 * @param {Object} criteria - Original criteria
 * @param {number} topN - Number of recommendations needed
 * @returns {Array<Object>} Recommendations with relaxed constraints
 */
function getAlternativeRecommendations(plants, criteria, topN = 5) {
  // Score all plants without filtering
  const scoredPlants = plants.map(plant => ({
    ...plant,
    score: calculatePlantScore(plant, criteria),
    reason: generateExplanation(plant, criteria)
  }));
  
  // Sort by score (descending)
  scoredPlants.sort((a, b) => b.score - a.score);
  
  // Return top N plants
  return scoredPlants.slice(0, topN);
}

module.exports = {
  checkTemperatureMatch,
  checkSunlightMatch,
  checkSpaceMatch,
  checkSoilMatch,
  checkRegionMatch,
  calculatePlantScore,
  generateExplanation,
  filterPlants,
  getTopRecommendations,
  getAlternativeRecommendations
};
