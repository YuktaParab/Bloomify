import Papa from "papaparse";
import plantsCsvUrl from "../data/plants.csv?url";

let cachedPlants = null;

export async function loadPlantData() {
  if (cachedPlants) return cachedPlants;

  const response = await fetch(plantsCsvUrl);
  const csvText = await response.text();

  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  cachedPlants = data;
  return cachedPlants;
}

export function getPlantsBySunlight(plants, sunlight) {
  const level = (sunlight || "medium").toLowerCase();
  const filtered = plants.filter((p) => p.sunlight === level);
  // Shuffle and pick up to 5
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((p) => ({
    name: p.plant_name,
    desc: p.description,
    difficulty: p.difficulty,
    watering: p.watering,
    lightNeed: `${capitalize(p.sunlight)} (${p.light_hours}+ hrs)`,
  }));
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
