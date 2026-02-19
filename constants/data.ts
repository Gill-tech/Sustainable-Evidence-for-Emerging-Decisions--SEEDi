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
  riskLevel: "low" | "medium" | "high";
  scalability: "low" | "medium" | "high";
  provider: string;
  roleRelevance: Record<string, string>;
  yieldImpact: number;
  lossReduction: number;
  incomePerHa: number;
  soilHealthImpact: number;
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
    description: "An off-grid water-efficient irrigation solution that reduces water usage by 40% while increasing crop yields through precise water delivery.",
    category: "Water Management",
    challenges: ["Water scarcity", "Energy costs", "Labor shortage"],
    readinessLevel: 8,
    adoptionLevel: 6,
    sdgAlignment: [2, 6, 13],
    region: "East Africa",
    cropTypes: ["Vegetables", "Fruits", "Maize"],
    impactScore: 85,
    feasibilityScore: 72,
    sustainabilityScore: 90,
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "AgroTech Solutions",
    roleRelevance: {
      Farmer: "Cuts irrigation labor by 70% and reduces water bills, ideal for smallholders with limited water access",
      Policymaker: "Scalable climate adaptation infrastructure aligned with national water conservation targets",
      SME: "Market opportunity in solar irrigation equipment distribution and maintenance services",
      Researcher: "Field-tested technology with strong data on yield-water efficiency trade-offs",
      Investor: "Proven ROI within 2 seasons with growing demand across Sub-Saharan Africa",
    },
    yieldImpact: 35,
    lossReduction: 10,
    incomePerHa: 920,
    soilHealthImpact: 12,
  },
  {
    id: "inn-2",
    name: "Hermetic Storage Technology",
    description: "Airtight storage bags that prevent post-harvest losses from insects and moisture, reducing storage losses by up to 98%.",
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
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "GrainPro",
    roleRelevance: {
      Farmer: "Eliminates 98% storage losses with no electricity needed, directly increasing income from stored grain",
      Policymaker: "Cost-effective food security intervention deployable at national scale through existing supply chains",
      SME: "Low-barrier entry into agricultural supply chain with high repeat purchase rates",
      Researcher: "Mature technology (TRL 9) with extensive adoption data across 40+ countries",
      Investor: "Market-proven product with predictable revenue streams and low manufacturing complexity",
    },
    yieldImpact: 0,
    lossReduction: 98,
    incomePerHa: 480,
    soilHealthImpact: 0,
  },
  {
    id: "inn-3",
    name: "Climate-Smart Crop Varieties (Drought-Tolerant)",
    description: "Genetically improved seed varieties that maintain yields under water stress conditions, reducing crop failure risk by 45%.",
    category: "Crop Production",
    challenges: ["Drought", "Climate change", "Food security"],
    readinessLevel: 9,
    adoptionLevel: 6,
    sdgAlignment: [2, 13],
    region: "All",
    cropTypes: ["Maize", "Rice", "Wheat", "Sorghum"],
    impactScore: 88,
    feasibilityScore: 80,
    sustainabilityScore: 85,
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "CGIAR Research Centers",
    roleRelevance: {
      Farmer: "Maintains 80% yield even with 40% less rainfall, dramatically reducing crop failure risk",
      Policymaker: "Evidence-based climate adaptation strategy supported by international research network",
      SME: "Seed distribution opportunity with built-in demand from climate-vulnerable regions",
      Researcher: "Flagship breeding program with open-access germplasm and decades of trial data",
      Investor: "High social impact with seed multiplication delivering 3-5x annual returns",
    },
    yieldImpact: 45,
    lossReduction: 25,
    incomePerHa: 780,
    soilHealthImpact: 5,
  },
  {
    id: "inn-4",
    name: "Integrated Pest Management (IPM) Kit",
    description: "Comprehensive biological pest control system combining beneficial insects, pheromone traps, and organic sprays.",
    category: "Pest & Disease Management",
    challenges: ["Pest resistance", "Chemical overuse", "Yield loss"],
    readinessLevel: 8,
    adoptionLevel: 5,
    sdgAlignment: [2, 3, 12],
    region: "All",
    cropTypes: ["Rice", "Vegetables", "Fruits"],
    impactScore: 78,
    feasibilityScore: 85,
    sustainabilityScore: 92,
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "EcoPest Solutions",
    roleRelevance: {
      Farmer: "Reduces chemical pesticide costs by 60% while maintaining or improving yields",
      Policymaker: "Aligns with national pesticide reduction targets and public health goals",
      SME: "Growing organic agriculture market creates demand for IPM advisory services",
      Researcher: "Multi-component system offering rich data on biological control effectiveness",
      Investor: "Expanding regulatory tailwinds driving adoption in key markets",
    },
    yieldImpact: 25,
    lossReduction: 35,
    incomePerHa: 560,
    soilHealthImpact: 15,
  },
  {
    id: "inn-5",
    name: "Digital Farm Advisory Platform",
    description: "Mobile app providing personalized agronomic advice, weather forecasts, and market prices using AI and local data.",
    category: "Crop Production",
    challenges: ["Knowledge access", "Market information", "Decision support"],
    readinessLevel: 8,
    adoptionLevel: 5,
    sdgAlignment: [2, 8, 9],
    region: "All",
    cropTypes: ["All crops"],
    impactScore: 82,
    feasibilityScore: 88,
    sustainabilityScore: 80,
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "FarmWise Digital",
    roleRelevance: {
      Farmer: "Free real-time market prices and weather alerts that prevent losses and maximize selling price",
      Policymaker: "Digital extension channel reaching farmers at 10x lower cost than traditional methods",
      SME: "Platform for reaching rural customers with products, services, and financial offerings",
      Researcher: "Unprecedented farm-level data collection opportunity for research at scale",
      Investor: "SaaS model with strong network effects and data monetization potential",
    },
    yieldImpact: 20,
    lossReduction: 15,
    incomePerHa: 680,
    soilHealthImpact: 8,
  },
  {
    id: "inn-6",
    name: "Mobile Grain Milling Service",
    description: "On-demand mobile milling units that process grain at farm-gate, reducing transport costs and adding value locally.",
    category: "Post-Harvest Management",
    challenges: ["Value addition", "Transport costs", "Market access"],
    readinessLevel: 8,
    adoptionLevel: 4,
    sdgAlignment: [2, 8, 9],
    region: "West Africa",
    cropTypes: ["Maize", "Rice", "Sorghum", "Millet"],
    impactScore: 75,
    feasibilityScore: 70,
    sustainabilityScore: 80,
    source: "ATIO KB v2.1",
    riskLevel: "medium",
    scalability: "medium",
    provider: "AgriProcess Hub",
    roleRelevance: {
      Farmer: "Process grain at farm-gate, saving transport costs and earning 25-40% premium on milled products",
      Policymaker: "Rural job creation and value-chain development in underserved communities",
      SME: "Service-based business model with recurring revenue and low competition in rural areas",
      Researcher: "Case study in decentralized value addition and rural enterprise development",
      Investor: "Asset-light franchise model with proven unit economics in 3 countries",
    },
    yieldImpact: 0,
    lossReduction: 20,
    incomePerHa: 440,
    soilHealthImpact: 0,
  },
  {
    id: "inn-7",
    name: "Composting & Biogas System",
    description: "Integrated waste management system converting farm waste into compost and biogas for cooking and energy.",
    category: "Soil Health & Fertility",
    challenges: ["Waste management", "Energy access", "Soil degradation"],
    readinessLevel: 7,
    adoptionLevel: 4,
    sdgAlignment: [7, 12, 13],
    region: "East Africa",
    cropTypes: ["All crops"],
    impactScore: 80,
    feasibilityScore: 68,
    sustainabilityScore: 94,
    source: "ATIO KB v2.1",
    riskLevel: "medium",
    scalability: "medium",
    provider: "BioEnergy Solutions",
    roleRelevance: {
      Farmer: "Turns crop waste into free cooking fuel and organic fertilizer, saving $200+/year on inputs",
      Policymaker: "Addresses clean energy access and waste management simultaneously across rural areas",
      SME: "Biodigester installation and maintenance creates skilled employment opportunities",
      Researcher: "Circular economy model with measurable carbon and soil health co-benefits",
      Investor: "Carbon credit potential adds revenue stream to biogas equipment distribution",
    },
    yieldImpact: 18,
    lossReduction: 5,
    incomePerHa: 380,
    soilHealthImpact: 28,
  },
  {
    id: "inn-8",
    name: "Bio-Fertilizer with Nitrogen-Fixing Bacteria",
    description: "Organic fertilizer enriched with beneficial bacteria that enhance soil health and reduce chemical fertilizer dependency by 30%.",
    category: "Soil Health & Fertility",
    challenges: ["Soil degradation", "Fertilizer costs", "Sustainability"],
    readinessLevel: 7,
    adoptionLevel: 5,
    sdgAlignment: [2, 15],
    region: "All",
    cropTypes: ["Legumes", "Cereals", "Vegetables"],
    impactScore: 76,
    feasibilityScore: 82,
    sustainabilityScore: 91,
    source: "ATIO KB v2.1",
    riskLevel: "medium",
    scalability: "medium",
    provider: "BioSoil Innovations",
    roleRelevance: {
      Farmer: "Cuts fertilizer costs by 30% while rebuilding soil biology for long-term productivity",
      Policymaker: "Reduces fertilizer subsidy burden while improving environmental outcomes",
      SME: "Bio-input manufacturing and distribution with growing demand from organic sector",
      Researcher: "Active field of soil microbiome research with strong publication potential",
      Investor: "Growing bio-inputs market projected at 12% CAGR through 2030",
    },
    yieldImpact: 15,
    lossReduction: 0,
    incomePerHa: 320,
    soilHealthImpact: 35,
  },
  {
    id: "inn-9",
    name: "IoT Soil Moisture Sensors",
    description: "Real-time soil moisture monitoring system that optimizes irrigation scheduling and reduces water waste by 35%.",
    category: "Water Management",
    challenges: ["Water efficiency", "Precision agriculture", "Data-driven decisions"],
    readinessLevel: 7,
    adoptionLevel: 3,
    sdgAlignment: [6, 9, 13],
    region: "All",
    cropTypes: ["All crops"],
    impactScore: 76,
    feasibilityScore: 65,
    sustainabilityScore: 88,
    source: "ATIO KB v2.1",
    riskLevel: "medium",
    scalability: "high",
    provider: "FarmSense Technologies",
    roleRelevance: {
      Farmer: "Saves 35% water and prevents over/under-watering with simple phone alerts",
      Policymaker: "Precision agriculture infrastructure supporting water conservation policy",
      SME: "IoT hardware + data services business with subscription revenue model",
      Researcher: "Continuous soil data collection enables climate-smart agriculture research",
      Investor: "AgriTech IoT sector with strong growth and data-as-a-service revenue potential",
    },
    yieldImpact: 22,
    lossReduction: 8,
    incomePerHa: 520,
    soilHealthImpact: 18,
  },
  {
    id: "inn-10",
    name: "Cold Chain Solar Coolers",
    description: "Solar-powered refrigeration units for perishable crops, extending shelf life by 7-10 days and reducing losses.",
    category: "Post-Harvest Management",
    challenges: ["Cold chain gap", "Perishable losses", "Market timing"],
    readinessLevel: 6,
    adoptionLevel: 3,
    sdgAlignment: [2, 7, 12],
    region: "East Africa",
    cropTypes: ["Vegetables", "Fruits", "Dairy"],
    impactScore: 84,
    feasibilityScore: 58,
    sustainabilityScore: 86,
    source: "ATIO KB v2.1",
    riskLevel: "high",
    scalability: "medium",
    provider: "ColdSolar Inc.",
    roleRelevance: {
      Farmer: "Extends produce shelf life by 7-10 days, enabling better market timing and higher prices",
      Policymaker: "Critical cold chain infrastructure reducing food waste in last-mile logistics",
      SME: "Shared cold storage service model generating revenue from multiple farmers",
      Researcher: "Emerging technology with significant optimization potential in tropical conditions",
      Investor: "First-mover advantage in off-grid cold chain with large addressable market",
    },
    yieldImpact: 0,
    lossReduction: 65,
    incomePerHa: 860,
    soilHealthImpact: 0,
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
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "high",
    provider: "ICIPE",
    roleRelevance: {
      Farmer: "Zero-chemical pest control that also fixes nitrogen, improving yields by 2-3x in affected areas",
      Policymaker: "Proven agroecological approach with 20+ years of research backing and farmer adoption",
      SME: "Desmodium seed production and training services opportunity in push-pull regions",
      Researcher: "Flagship companion cropping system with extensive peer-reviewed evidence base",
      Investor: "Low-cost, high-impact intervention ideal for philanthropic and impact investment",
    },
    yieldImpact: 55,
    lossReduction: 40,
    incomePerHa: 720,
    soilHealthImpact: 22,
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
    source: "ATIO KB v2.1",
    riskLevel: "low",
    scalability: "medium",
    provider: "ILRI",
    roleRelevance: {
      Farmer: "Diversifies income streams and creates circular nutrient system reducing external input costs",
      Policymaker: "Supports small farm resilience and mixed farming policy with proven livelihood impacts",
      SME: "Feed processing and livestock services business with year-round demand",
      Researcher: "Systems approach to farming with rich multi-variable research opportunities",
      Investor: "Integrated model de-risks agricultural investment through income diversification",
    },
    yieldImpact: 30,
    lossReduction: 15,
    incomePerHa: 650,
    soilHealthImpact: 25,
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
