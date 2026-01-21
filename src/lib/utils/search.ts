/**
 * Search Utilities
 * 
 * Contains helper functions for natural language query processing,
 * including city extraction and query normalization.
 */

// Common Indian cities for detection
// Extend this list based on your target regions
const KNOWN_CITIES = [
  'mumbai',
  'delhi',
  'bangalore',
  'bengaluru',
  'chennai',
  'kolkata',
  'hyderabad',
  'pune',
  'ahmedabad',
  'jaipur',
  'lucknow',
  'kanpur',
  'nagpur',
  'indore',
  'thane',
  'bhopal',
  'visakhapatnam',
  'patna',
  'vadodara',
  'ghaziabad',
  'ludhiana',
  'agra',
  'nashik',
  'faridabad',
  'meerut',
  'rajkot',
  'varanasi',
  'srinagar',
  'aurangabad',
  'dhanbad',
  'amritsar',
  'allahabad',
  'ranchi',
  'howrah',
  'coimbatore',
  'jabalpur',
  'gwalior',
  'vijayawada',
  'jodhpur',
  'madurai',
  'raipur',
  'kota',
  'guwahati',
  'chandigarh',
  'solapur',
  'hubli',
  'mysore',
  'mysuru',
  'tiruchirappalli',
  'bareilly',
  'aligarh',
  'tiruppur',
  'gurgaon',
  'gurugram',
  'moradabad',
  'jalandhar',
  'bhubaneswar',
  'salem',
  'warangal',
  'guntur',
  'bhiwandi',
  'saharanpur',
  'gorakhpur',
  'bikaner',
  'amravati',
  'noida',
  'jamshedpur',
  'bhilai',
  'cuttack',
  'firozabad',
  'kochi',
  'cochin',
  'nellore',
  'bhavnagar',
  'dehradun',
  'durgapur',
  'asansol',
  'rourkela',
  'nanded',
  'kolhapur',
  'ajmer',
  'akola',
  'gulbarga',
  'jamnagar',
  'ujjain',
  'loni',
  'siliguri',
  'jhansi',
  'ulhasnagar',
  'jammu',
  'sangli',
  'mangalore',
  'erode',
  'belgaum',
  'ambattur',
  'tirunelveli',
  'malegaon',
  'gaya',
  'udaipur',
  'maheshtala',
  'davanagere',
  'kozhikode',
  'calicut',
  'kurnool',
  'rajpur',
  'rajahmundry',
  'bokaro',
  'south dumdum',
  'bellary',
  'patiala',
  'gopalpur',
  'agartala',
  'bhagalpur',
  'muzaffarnagar',
  'bhatpara',
  'panihati',
  'latur',
  'dhule',
  'tirupati',
  'rohtak',
  'korba',
  'bhilwara',
  'berhampur',
  'muzaffarpur',
  'ahmednagar',
  'mathura',
  'kollam',
  'avadi',
  'kadapa',
  'kamarhati',
  'sambalpur',
  'bilaspur',
  'shahjahanpur',
  'satara',
  'bijapur',
  'rampur',
  'shimoga',
  'chandrapur',
  'junagadh',
  'thrissur',
  'alwar',
  'bardhaman',
  'kulti',
  'kakinada',
  'nizamabad',
  'parbhani',
  'tumkur',
  'khammam',
  'ozhukarai',
  'bihar sharif',
  'panipat',
  'darbhanga',
  'bally',
  'aizawl',
  'dewas',
  'ichalkaranji',
  'karnal',
  'bathinda',
  'jalna',
  'eluru',
  'barasat',
  'kirari suleman nagar',
  'purnia',
  'satna',
  'mau',
  'sonipat',
  'farrukhabad',
  'sagar',
  'rourkela',
  'durg',
  'imphal',
  'ratlam',
  'hapur',
  'arrah',
  'karimnagar',
  'anantapur',
  'etawah',
  'ambernath',
  'north dumdum',
  'bharatpur',
  'begusarai',
  'new delhi',
  'pondicherry',
  'puducherry',
  'gangtok',
  'shillong',
  'shimla',
  'thiruvananthapuram',
  'trivandrum',
  'panaji',
  'goa',
  // Add more cities as needed
];

// City name variations/aliases mapping
const CITY_ALIASES: Record<string, string> = {
  'bombay': 'mumbai',
  'bengaluru': 'bangalore',
  'calcutta': 'kolkata',
  'madras': 'chennai',
  'cochin': 'kochi',
  'calicut': 'kozhikode',
  'trivandrum': 'thiruvananthapuram',
  'mysuru': 'mysore',
  'gurugram': 'gurgaon',
  'puducherry': 'pondicherry',
};

// Location indicator words that often precede city names
const LOCATION_INDICATORS = ['in', 'at', 'near', 'around', 'from'];

// Virtual/online keywords
const VIRTUAL_KEYWORDS = ['online', 'virtual', 'remote', 'digital', 'web'];

export interface ParsedQuery {
  /** The search text with city removed */
  searchText: string;
  /** Detected city name (normalized) */
  city: string | null;
  /** Original city text as typed by user */
  originalCityText: string | null;
  /** Whether the query indicates a virtual/online event */
  isVirtual: boolean;
}

/**
 * Extracts city name from a natural language search query.
 * 
 * Examples:
 * - "art workshop in mumbai" → { searchText: "art workshop", city: "mumbai" }
 * - "tree plantation near pune" → { searchText: "tree plantation", city: "pune" }
 * - "online teaching volunteer" → { searchText: "teaching volunteer", city: null, isVirtual: true }
 * 
 * @param query - The user's search query
 * @returns Parsed query object with search text and extracted city
 */
export function extractCityFromQuery(query: string): ParsedQuery {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  let detectedCity: string | null = null;
  let originalCityText: string | null = null;
  let cityStartIndex = -1;
  let cityEndIndex = -1;
  
  // Check for virtual/online keywords
  const isVirtual = VIRTUAL_KEYWORDS.some(keyword => 
    normalizedQuery.includes(keyword)
  );
  
  // Strategy 1: Look for "in/at/near [city]" patterns
  for (let i = 0; i < words.length - 1; i++) {
    if (LOCATION_INDICATORS.includes(words[i])) {
      // Check if next word(s) form a city name
      // Handle multi-word cities like "new delhi"
      const potentialCity = words[i + 1];
      const potentialTwoWordCity = `${words[i + 1]} ${words[i + 2] || ''}`.trim();
      
      // Check two-word city first
      if (words[i + 2] && KNOWN_CITIES.includes(potentialTwoWordCity)) {
        detectedCity = CITY_ALIASES[potentialTwoWordCity] || potentialTwoWordCity;
        originalCityText = potentialTwoWordCity;
        cityStartIndex = i;
        cityEndIndex = i + 3;
        break;
      }
      
      // Check single-word city
      if (KNOWN_CITIES.includes(potentialCity)) {
        detectedCity = CITY_ALIASES[potentialCity] || potentialCity;
        originalCityText = potentialCity;
        cityStartIndex = i;
        cityEndIndex = i + 2;
        break;
      }
      
      // Check aliases
      if (CITY_ALIASES[potentialCity]) {
        detectedCity = CITY_ALIASES[potentialCity];
        originalCityText = potentialCity;
        cityStartIndex = i;
        cityEndIndex = i + 2;
        break;
      }
    }
  }
  
  // Strategy 2: Direct city mention without location indicator
  if (!detectedCity) {
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const twoWordPhrase = `${words[i]} ${words[i + 1] || ''}`.trim();
      
      // Check two-word city first
      if (words[i + 1] && KNOWN_CITIES.includes(twoWordPhrase)) {
        detectedCity = CITY_ALIASES[twoWordPhrase] || twoWordPhrase;
        originalCityText = twoWordPhrase;
        cityStartIndex = i;
        cityEndIndex = i + 2;
        break;
      }
      
      // Check single-word city
      if (KNOWN_CITIES.includes(word)) {
        detectedCity = CITY_ALIASES[word] || word;
        originalCityText = word;
        cityStartIndex = i;
        cityEndIndex = i + 1;
        break;
      }
      
      // Check aliases
      if (CITY_ALIASES[word]) {
        detectedCity = CITY_ALIASES[word];
        originalCityText = word;
        cityStartIndex = i;
        cityEndIndex = i + 1;
        break;
      }
    }
  }
  
  // Build search text without city and location indicator
  let searchText = normalizedQuery;
  if (detectedCity && cityStartIndex >= 0) {
    const beforeCity = words.slice(0, cityStartIndex).join(' ');
    const afterCity = words.slice(cityEndIndex).join(' ');
    searchText = `${beforeCity} ${afterCity}`.trim();
  }
  
  // Remove virtual keywords from search text for cleaner results
  if (isVirtual) {
    VIRTUAL_KEYWORDS.forEach(keyword => {
      searchText = searchText.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '').trim();
    });
  }
  
  // Clean up extra spaces
  searchText = searchText.replace(/\s+/g, ' ').trim();
  
  return {
    searchText,
    city: detectedCity,
    originalCityText,
    isVirtual,
  };
}

/**
 * Normalizes a city name for consistent matching.
 * Handles aliases and case normalization.
 * 
 * @param city - City name to normalize
 * @returns Normalized city name
 */
export function normalizeCity(city: string): string {
  const lowercased = city.toLowerCase().trim();
  return CITY_ALIASES[lowercased] || lowercased;
}

/**
 * Checks if a string contains a known city name.
 * 
 * @param text - Text to check
 * @returns True if a city is found
 */
export function containsCity(text: string): boolean {
  const normalized = text.toLowerCase();
  return KNOWN_CITIES.some(city => normalized.includes(city)) ||
         Object.keys(CITY_ALIASES).some(alias => normalized.includes(alias));
}

/**
 * Gets all known cities for autocomplete suggestions.
 * 
 * @returns Array of city names
 */
export function getKnownCities(): string[] {
  return [...KNOWN_CITIES];
}
