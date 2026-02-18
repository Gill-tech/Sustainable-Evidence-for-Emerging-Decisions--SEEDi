export interface Innovation {
  id: string;
  name: string;
  description: string;
  category: string;
  challenges: string[];
  readinessLevel: number;
  adoptionLevel: number;
  sdgAlignment: number[];
  region: string;
  cropTypes: string[];
  impactScore: number;
  feasibilityScore: number;
  sustainabilityScore: number;
  source: string;
}

export interface DecisionProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  currentStage: number;
  stageName: string;
  innovationCount: number;
  context?: UserContext;
  selectedInnovations: string[];
  status: "active" | "completed" | "archived";
}

export interface UserContext {
  role: string;
  primaryObjective: string;
  region: string;
  subRegion: string;
  agroEcologicalZone: string;
  primaryCrop: string;
  budgetLevel: string;
  farmSize: string;
  climateRiskLevel: string;
}

export interface Alert {
  id: string;
  message: string;
  type: "warning" | "info" | "success";
  timeAgo: string;
}

export const ROLES = ["Farmer", "Policymaker", "SME", "Researcher", "Investor"];

export const OBJECTIVES = [
  "Increase Production",
  "Reduce Losses",
  "Improve Sustainability",
  "Increase Income",
  "Add Value",
  "Improve Water Use",
  "Improve Soil Health",
];

export const REGIONS = [
  "East Africa",
  "West Africa",
  "Southern Africa",
  "South Asia",
  "Southeast Asia",
  "Latin America",
  "Central Asia",
  "Middle East & North Africa",
];

export const AGRO_ZONES = [
  "Tropical Humid",
  "Tropical Sub-Humid",
  "Semi-Arid",
  "Arid",
  "Highland",
  "Mediterranean",
  "Temperate",
];

export const BUDGET_LEVELS = ["Low", "Medium", "High"];
export const FARM_SIZES = ["Small (<2 ha)", "Medium (2-10 ha)", "Large (>10 ha)"];
export const CLIMATE_RISK_LEVELS = ["Low", "Medium", "High", "Very High"];

export const CATEGORIES = [
  "Crop Production",
  "Soil Health & Fertility",
  "Water Management",
  "Pest & Disease Management",
  "Post-Harvest Management",
  "Climate-Smart Agriculture",
  "Agroecological Practices",
  "Livestock & Integrated Farming",
];

export const MOCK_INNOVATIONS: Innovation[] = [
  {
    id: "inn-1",
    name: "Solar-Powered Drip Irrigation",
    description: "Automated drip irrigation system powered by solar panels, reducing water use by up to 60% while maintaining crop yields.",
    category: "Water Management",
    challenges: ["Water scarcity", "Energy costs", "Labor shortage"],
    readinessLevel: 8,
    adoptionLevel: 5,
    sdgAlignment: [2, 6, 7, 13],
    region: "East Africa",
    cropTypes: ["Vegetables", "Fruits", "Maize"],
    impactScore: 85,
    feasibilityScore: 72,
    sustainabilityScore: 90,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-2",
    name: "Hermetic Storage Bags",
    description: "Triple-layer bags that create an airtight environment, reducing post-harvest grain losses from 30% to under 2%.",
    category: "Post-Harvest Management",
    challenges: ["Post-harvest loss", "Storage pest damage", "Food waste"],
    readinessLevel: 9,
    adoptionLevel: 7,
    sdgAlignment: [2, 12],
    region: "East Africa",
    cropTypes: ["Maize", "Rice", "Wheat", "Beans"],
    impactScore: 92,
    feasibilityScore: 95,
    sustainabilityScore: 78,
    source: "FAOSTAT Data",
  },
  {
    id: "inn-3",
    name: "Bio-Fortified Crop Varieties",
    description: "Nutrient-enhanced crop varieties bred for higher vitamin A, iron, and zinc content while maintaining agronomic performance.",
    category: "Crop Production",
    challenges: ["Malnutrition", "Low crop diversity", "Climate adaptation"],
    readinessLevel: 7,
    adoptionLevel: 4,
    sdgAlignment: [2, 3],
    region: "South Asia",
    cropTypes: ["Sweet Potato", "Maize", "Beans", "Rice"],
    impactScore: 88,
    feasibilityScore: 80,
    sustainabilityScore: 85,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-4",
    name: "Integrated Pest Management (IPM) Toolkit",
    description: "Comprehensive pest management approach combining biological controls, botanical pesticides, and monitoring tools.",
    category: "Pest & Disease Management",
    challenges: ["Pest resistance", "Chemical overuse", "Yield loss"],
    readinessLevel: 8,
    adoptionLevel: 6,
    sdgAlignment: [2, 15],
    region: "Southeast Asia",
    cropTypes: ["Rice", "Vegetables", "Fruits"],
    impactScore: 78,
    feasibilityScore: 85,
    sustainabilityScore: 92,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-5",
    name: "Cover Crop Rotation System",
    description: "Strategic planting of nitrogen-fixing cover crops between main crop seasons to restore soil fertility and suppress weeds.",
    category: "Soil Health & Fertility",
    challenges: ["Soil degradation", "Fertility loss", "Weed management"],
    readinessLevel: 9,
    adoptionLevel: 5,
    sdgAlignment: [2, 13, 15],
    region: "Latin America",
    cropTypes: ["Maize", "Soybeans", "Wheat"],
    impactScore: 82,
    feasibilityScore: 88,
    sustainabilityScore: 95,
    source: "FAOSTAT Data",
  },
  {
    id: "inn-6",
    name: "Mobile Soil Testing Kit",
    description: "Portable smartphone-connected soil analysis device providing real-time NPK levels, pH, and moisture content readings.",
    category: "Soil Health & Fertility",
    challenges: ["Soil testing access", "Fertilizer optimization", "Cost reduction"],
    readinessLevel: 7,
    adoptionLevel: 3,
    sdgAlignment: [2, 9],
    region: "West Africa",
    cropTypes: ["All crops"],
    impactScore: 75,
    feasibilityScore: 70,
    sustainabilityScore: 80,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-7",
    name: "Rainwater Harvesting Ponds",
    description: "Lined community-level water harvesting structures with simple filtration for supplemental irrigation during dry spells.",
    category: "Water Management",
    challenges: ["Drought", "Water access", "Community coordination"],
    readinessLevel: 9,
    adoptionLevel: 6,
    sdgAlignment: [2, 6, 13],
    region: "East Africa",
    cropTypes: ["Vegetables", "Fruits", "Fodder"],
    impactScore: 80,
    feasibilityScore: 75,
    sustainabilityScore: 88,
    source: "FAOSTAT Data",
  },
  {
    id: "inn-8",
    name: "Drought-Tolerant Maize Varieties",
    description: "Maize varieties bred for improved performance under water stress, maintaining 80% yield even with 40% less rainfall.",
    category: "Climate-Smart Agriculture",
    challenges: ["Drought", "Climate change", "Food security"],
    readinessLevel: 8,
    adoptionLevel: 7,
    sdgAlignment: [2, 13],
    region: "Southern Africa",
    cropTypes: ["Maize"],
    impactScore: 90,
    feasibilityScore: 85,
    sustainabilityScore: 82,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-9",
    name: "Agroforestry Boundary Planting",
    description: "Strategic tree planting along farm boundaries for windbreaks, fruit production, and carbon sequestration.",
    category: "Agroecological Practices",
    challenges: ["Wind erosion", "Biodiversity loss", "Income diversification"],
    readinessLevel: 8,
    adoptionLevel: 5,
    sdgAlignment: [2, 13, 15],
    region: "West Africa",
    cropTypes: ["Multi-crop systems"],
    impactScore: 76,
    feasibilityScore: 78,
    sustainabilityScore: 94,
    source: "FAOSTAT Data",
  },
  {
    id: "inn-10",
    name: "Solar Grain Dryer",
    description: "Low-cost solar-powered grain drying system reducing moisture content to safe storage levels, preventing aflatoxin contamination.",
    category: "Post-Harvest Management",
    challenges: ["Grain quality", "Aflatoxin risk", "Post-harvest loss"],
    readinessLevel: 7,
    adoptionLevel: 4,
    sdgAlignment: [2, 7, 12],
    region: "East Africa",
    cropTypes: ["Maize", "Rice", "Groundnuts"],
    impactScore: 84,
    feasibilityScore: 76,
    sustainabilityScore: 86,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-11",
    name: "Push-Pull Pest Control",
    description: "Companion planting strategy using Napier grass and Desmodium to simultaneously attract and repel stem borers in maize.",
    category: "Pest & Disease Management",
    challenges: ["Stem borer damage", "Chemical dependency", "Soil nitrogen"],
    readinessLevel: 9,
    adoptionLevel: 6,
    sdgAlignment: [2, 15],
    region: "East Africa",
    cropTypes: ["Maize", "Sorghum"],
    impactScore: 86,
    feasibilityScore: 90,
    sustainabilityScore: 96,
    source: "ATIO Knowledge Base",
  },
  {
    id: "inn-12",
    name: "Crop-Livestock Integration Model",
    description: "Systematic integration of crop residues for animal feed and manure for soil fertility in mixed farming systems.",
    category: "Livestock & Integrated Farming",
    challenges: ["Resource cycling", "Income stability", "Soil fertility"],
    readinessLevel: 8,
    adoptionLevel: 5,
    sdgAlignment: [2, 12, 15],
    region: "South Asia",
    cropTypes: ["Multi-crop systems", "Fodder"],
    impactScore: 79,
    feasibilityScore: 82,
    sustainabilityScore: 91,
    source: "FAOSTAT Data",
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-1",
    message: "High climate risk alert for East Africa this season",
    type: "warning",
    timeAgo: "2 days ago",
  },
  {
    id: "alert-2",
    message: "New drought-tolerant varieties available for your region",
    type: "info",
    timeAgo: "5 days ago",
  },
  {
    id: "alert-3",
    message: "Soil health improvement program launching in South Asia",
    type: "success",
    timeAgo: "1 week ago",
  },
];

export const STAGE_NAMES = [
  "Define Context",
  "Explore & Compare",
  "Analyze & Simulate",
  "Generate Action",
];
