// hooks/fetchCities.ts
/**
 * Bundled (hardcoded) list of India states + common cities.
 * Use this to avoid external API/rate-limit issues.
 *
 * Exports:
 * - fetchCities(): Promise<LocationItem[]>
 * - LocationItem, StateItem, CityItem types
 *
 * Feel free to extend or move data to assets/india_locations.json if needed.
 */

export type StateItem = {
  id: string;      // state code like "MH"
  name: string;    // e.g. "Maharashtra"
  type: "state";
  stateCode: string;
};

export type CityItem = {
  id: string | number;
  name: string;    // e.g. "Mumbai"
  type: "city";
  state?: string;      // region name
  stateCode?: string;  // region code
};

export type LocationItem = StateItem | CityItem;

/* --------------------
   Hardcoded data
   -------------------- */

const STATES: StateItem[] = [
  { id: "AP", name: "Andhra Pradesh", type: "state", stateCode: "AP" },
  { id: "AR", name: "Arunachal Pradesh", type: "state", stateCode: "AR" },
  { id: "AS", name: "Assam", type: "state", stateCode: "AS" },
  { id: "BR", name: "Bihar", type: "state", stateCode: "BR" },
  { id: "CT", name: "Chhattisgarh", type: "state", stateCode: "CT" },
  { id: "GA", name: "Goa", type: "state", stateCode: "GA" },
  { id: "GJ", name: "Gujarat", type: "state", stateCode: "GJ" },
  { id: "HR", name: "Haryana", type: "state", stateCode: "HR" },
  { id: "HP", name: "Himachal Pradesh", type: "state", stateCode: "HP" },
  { id: "JH", name: "Jharkhand", type: "state", stateCode: "JH" },
  { id: "KA", name: "Karnataka", type: "state", stateCode: "KA" },
  { id: "KL", name: "Kerala", type: "state", stateCode: "KL" },
  { id: "MP", name: "Madhya Pradesh", type: "state", stateCode: "MP" },
  { id: "MH", name: "Maharashtra", type: "state", stateCode: "MH" },
  { id: "MN", name: "Manipur", type: "state", stateCode: "MN" },
  { id: "ML", name: "Meghalaya", type: "state", stateCode: "ML" },
  { id: "MZ", name: "Mizoram", type: "state", stateCode: "MZ" },
  { id: "NL", name: "Nagaland", type: "state", stateCode: "NL" },
  { id: "OR", name: "Odisha", type: "state", stateCode: "OR" },
  { id: "PB", name: "Punjab", type: "state", stateCode: "PB" },
  { id: "RJ", name: "Rajasthan", type: "state", stateCode: "RJ" },
  { id: "SK", name: "Sikkim", type: "state", stateCode: "SK" },
  { id: "TN", name: "Tamil Nadu", type: "state", stateCode: "TN" },
  { id: "TG", name: "Telangana", type: "state", stateCode: "TG" },
  { id: "TR", name: "Tripura", type: "state", stateCode: "TR" },
  { id: "UP", name: "Uttar Pradesh", type: "state", stateCode: "UP" },
  { id: "UT", name: "Uttarakhand", type: "state", stateCode: "UT" },
  { id: "WB", name: "West Bengal", type: "state", stateCode: "WB" },

  // Union Territories
  { id: "AN", name: "Andaman and Nicobar Islands", type: "state", stateCode: "AN" },
  { id: "CH", name: "Chandigarh", type: "state", stateCode: "CH" },
  { id: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", type: "state", stateCode: "DN" },
  { id: "DL", name: "Delhi", type: "state", stateCode: "DL" },
  { id: "JK", name: "Jammu and Kashmir", type: "state", stateCode: "JK" },
  { id: "LA", name: "Ladakh", type: "state", stateCode: "LA" },
  { id: "LD", name: "Lakshadweep", type: "state", stateCode: "LD" },
  { id: "PY", name: "Puducherry", type: "state", stateCode: "PY" },
];

/**
 * A short, practical list of major/commonly-used cities per state (1-3 per state).
 * You can expand this list as needed.
 */
const CITIES: CityItem[] = [
  // Andhra Pradesh
  { id: "AP-1", name: "Visakhapatnam", type: "city", state: "Andhra Pradesh", stateCode: "AP" },
  { id: "AP-2", name: "Vijayawada", type: "city", state: "Andhra Pradesh", stateCode: "AP" },
  // Arunachal Pradesh
  { id: "AR-1", name: "Itanagar", type: "city", state: "Arunachal Pradesh", stateCode: "AR" },
  // Assam
  { id: "AS-1", name: "Guwahati", type: "city", state: "Assam", stateCode: "AS" },
  { id: "AS-2", name: "Dibrugarh", type: "city", state: "Assam", stateCode: "AS" },
  // Bihar
  { id: "BR-1", name: "Patna", type: "city", state: "Bihar", stateCode: "BR" },
  { id: "BR-2", name: "Gaya", type: "city", state: "Bihar", stateCode: "BR" },
  // Chhattisgarh
  { id: "CT-1", name: "Raipur", type: "city", state: "Chhattisgarh", stateCode: "CT" },
  // Goa
  { id: "GA-1", name: "Panaji", type: "city", state: "Goa", stateCode: "GA" },
  { id: "GA-2", name: "Margao", type: "city", state: "Goa", stateCode: "GA" },
  // Gujarat
  { id: "GJ-1", name: "Ahmedabad", type: "city", state: "Gujarat", stateCode: "GJ" },
  { id: "GJ-2", name: "Surat", type: "city", state: "Gujarat", stateCode: "GJ" },
  // Haryana
  { id: "HR-1", name: "Chandigarh", type: "city", state: "Haryana", stateCode: "HR" },
  { id: "HR-2", name: "Gurugram", type: "city", state: "Haryana", stateCode: "HR" },
  // Himachal Pradesh
  { id: "HP-1", name: "Shimla", type: "city", state: "Himachal Pradesh", stateCode: "HP" },
  // Jharkhand
  { id: "JH-1", name: "Ranchi", type: "city", state: "Jharkhand", stateCode: "JH" },
  // Karnataka
  { id: "KA-1", name: "Bengaluru", type: "city", state: "Karnataka", stateCode: "KA" },
  { id: "KA-2", name: "Mysuru", type: "city", state: "Karnataka", stateCode: "KA" },
  // Kerala
  { id: "KL-1", name: "Thiruvananthapuram", type: "city", state: "Kerala", stateCode: "KL" },
  { id: "KL-2", name: "Kochi", type: "city", state: "Kerala", stateCode: "KL" },
  // Madhya Pradesh
  { id: "MP-1", name: "Bhopal", type: "city", state: "Madhya Pradesh", stateCode: "MP" },
  { id: "MP-2", name: "Indore", type: "city", state: "Madhya Pradesh", stateCode: "MP" },
  // Maharashtra
  { id: "MH-1", name: "Mumbai", type: "city", state: "Maharashtra", stateCode: "MH" },
  { id: "MH-2", name: "Pune", type: "city", state: "Maharashtra", stateCode: "MH" },
  // Manipur
  { id: "MN-1", name: "Imphal", type: "city", state: "Manipur", stateCode: "MN" },
  // Meghalaya
  { id: "ML-1", name: "Shillong", type: "city", state: "Meghalaya", stateCode: "ML" },
  // Mizoram
  { id: "MZ-1", name: "Aizawl", type: "city", state: "Mizoram", stateCode: "MZ" },
  // Nagaland
  { id: "NL-1", name: "Kohima", type: "city", state: "Nagaland", stateCode: "NL" },
  // Odisha
  { id: "OR-1", name: "Bhubaneswar", type: "city", state: "Odisha", stateCode: "OR" },
  { id: "OR-2", name: "Cuttack", type: "city", state: "Odisha", stateCode: "OR" },
  // Punjab
  { id: "PB-1", name: "Chandigarh", type: "city", state: "Punjab", stateCode: "PB" },
  { id: "PB-2", name: "Amritsar", type: "city", state: "Punjab", stateCode: "PB" },
  // Rajasthan
  { id: "RJ-1", name: "Jaipur", type: "city", state: "Rajasthan", stateCode: "RJ" },
  { id: "RJ-2", name: "Udaipur", type: "city", state: "Rajasthan", stateCode: "RJ" },
  // Sikkim
  { id: "SK-1", name: "Gangtok", type: "city", state: "Sikkim", stateCode: "SK" },
  // Tamil Nadu
  { id: "TN-1", name: "Chennai", type: "city", state: "Tamil Nadu", stateCode: "TN" },
  { id: "TN-2", name: "Coimbatore", type: "city", state: "Tamil Nadu", stateCode: "TN" },
  // Telangana
  { id: "TG-1", name: "Hyderabad", type: "city", state: "Telangana", stateCode: "TG" },
  // Tripura
  { id: "TR-1", name: "Agartala", type: "city", state: "Tripura", stateCode: "TR" },
  // Uttar Pradesh
  { id: "UP-1", name: "Lucknow", type: "city", state: "Uttar Pradesh", stateCode: "UP" },
  { id: "UP-2", name: "Kanpur", type: "city", state: "Uttar Pradesh", stateCode: "UP" },
  // Uttarakhand
  { id: "UT-1", name: "Dehradun", type: "city", state: "Uttarakhand", stateCode: "UT" },
  // West Bengal
  { id: "WB-1", name: "Kolkata", type: "city", state: "West Bengal", stateCode: "WB" },
  { id: "WB-2", name: "Howrah", type: "city", state: "West Bengal", stateCode: "WB" },

  // Union Territories - a couple of cities each
  { id: "AN-1", name: "Port Blair", type: "city", state: "Andaman and Nicobar Islands", stateCode: "AN" },
  { id: "CH-1", name: "Chandigarh", type: "city", state: "Chandigarh", stateCode: "CH" },
  { id: "DN-1", name: "Daman", type: "city", state: "Dadra and Nagar Haveli and Daman and Diu", stateCode: "DN" },
  { id: "DL-1", name: "New Delhi", type: "city", state: "Delhi", stateCode: "DL" },
  { id: "JK-1", name: "Srinagar", type: "city", state: "Jammu and Kashmir", stateCode: "JK" },
  { id: "LA-1", name: "Leh", type: "city", state: "Ladakh", stateCode: "LA" },
  { id: "LD-1", name: "Kavaratti", type: "city", state: "Lakshadweep", stateCode: "LD" },
  { id: "PY-1", name: "Pondicherry", type: "city", state: "Puducherry", stateCode: "PY" },
];

/* --------------------
   Public function
   -------------------- */

/**
 * Returns combined array of states + cities sorted alphabetically by name.
 * Kept as a Promise to match previous API shape (async).
 */
export const fetchCities = async (): Promise<LocationItem[]> => {
  const combined: LocationItem[] = [...STATES, ...CITIES].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  // small delay to mimic async behaviour (optional)
  return new Promise((res) => setTimeout(() => res(combined), 0));
};

/* Optional: export raw arrays if you want to use them separately */
export const bundledStates = STATES;
export const bundledCities = CITIES;
