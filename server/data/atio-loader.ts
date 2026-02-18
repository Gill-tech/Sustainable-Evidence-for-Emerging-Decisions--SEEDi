import * as fs from "fs";
import * as path from "path";

interface Innovation {
  counter: string;
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  type: string;
  type_id: string;
  use_cases: string;
  use_cases_id: string;
  readiness_level: string;
  readiness_level_id: string;
  adoption_level: string;
  adoption_level_id: string;
  countries_adoption: string;
  countries_adoption_id: string;
  country_origin: string;
  country_origin_od: string;
  region: string;
  region_id: string;
  if_grassroots: string;
  impact_sdgs: string;
  impact_sdgs_id: string;
  actual_users: string;
  actual_users_id: string;
  prospective_users: string;
  prospective_users_id: string;
  owner: string;
  owner_id: string;
  owner_text: string;
  partner_text: string;
  data_source: string;
  data_source_id: string;
}

interface TaxonomyTerm {
  counter: string;
  id: string;
  vocabulary: string;
  name: string;
  value: string;
  description: string;
  description_ai: string;
  depth: string;
  weight: string;
}

interface DataSource {
  nid: string;
  title: string;
  body: string;
  field_use_cases_description: string;
}

interface InnovationFilters {
  search?: string;
  type?: string;
  use_case?: string;
  readiness_level?: string;
  adoption_level?: string;
  region?: string;
  country?: string;
  sdg?: string;
}

const innovationFiles = [
  "atiokb_innovations-4-1_1771446076038.json",
  "atiokb_innovations-4-2_1771446076039.json",
  "atiokb_innovations-12-1_1771446076040.json",
  "atiokb_innovations-12-2_1771446076040.json",
  "atiokb_innovations-12-3_1771446076041.json",
  "atiokb_innovations-19987-1_1771446076041.json",
  "atiokb_innovations-20007-1_1771446076042.json",
  "atiokb_innovations-20007-2_1771446076043.json",
  "atiokb_innovations-20007-3_1771446076043.json",
  "atiokb_innovations-38817-1_1771446076044.json",
];

let innovations: Innovation[] = [];
let taxonomy: TaxonomyTerm[] = [];
let dataSources: DataSource[] = [];

function loadData() {
  const assetsDir = path.join(process.cwd(), "attached_assets");

  const allInnovations: Innovation[] = [];
  for (const file of innovationFiles) {
    const filePath = path.join(assetsDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed: Innovation[] = JSON.parse(raw);
    allInnovations.push(...parsed);
  }

  const seen = new Map<string, Innovation>();
  for (const inn of allInnovations) {
    if (!seen.has(inn.id)) {
      seen.set(inn.id, inn);
    }
  }
  innovations = Array.from(seen.values());

  const taxonomyPath = path.join(assetsDir, "atiokb_taxonomy_terms_1771446076044.json");
  taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf-8"));

  const dataSourcesPath = path.join(assetsDir, "atiokb_data_sources_1771446076037.json");
  dataSources = JSON.parse(fs.readFileSync(dataSourcesPath, "utf-8"));

  console.log(`Loaded ${innovations.length} unique innovations, ${taxonomy.length} taxonomy terms, ${dataSources.length} data sources`);
}

loadData();

export function getInnovations(page: number = 1, limit: number = 20, filters: InnovationFilters = {}) {
  let filtered = [...innovations];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(search) ||
        i.short_description.toLowerCase().includes(search) ||
        i.long_description.toLowerCase().includes(search)
    );
  }

  if (filters.type) {
    const typeFilter = filters.type.toLowerCase();
    filtered = filtered.filter((i) => i.type.toLowerCase().includes(typeFilter));
  }

  if (filters.use_case) {
    const ucFilter = filters.use_case.toLowerCase();
    filtered = filtered.filter((i) => i.use_cases.toLowerCase().includes(ucFilter));
  }

  if (filters.readiness_level) {
    const rlFilter = filters.readiness_level.toLowerCase();
    filtered = filtered.filter((i) => i.readiness_level.toLowerCase().includes(rlFilter));
  }

  if (filters.adoption_level) {
    const alFilter = filters.adoption_level.toLowerCase();
    filtered = filtered.filter((i) => i.adoption_level.toLowerCase().includes(alFilter));
  }

  if (filters.region) {
    const regionFilter = filters.region.toLowerCase();
    filtered = filtered.filter((i) => i.region.toLowerCase().includes(regionFilter));
  }

  if (filters.country) {
    const countryFilter = filters.country.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.countries_adoption.toLowerCase().includes(countryFilter) ||
        i.country_origin.toLowerCase().includes(countryFilter)
    );
  }

  if (filters.sdg) {
    const sdgFilter = filters.sdg.toLowerCase();
    filtered = filtered.filter((i) => i.impact_sdgs.toLowerCase().includes(sdgFilter));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function getInnovationById(id: string): Innovation | undefined {
  return innovations.find((i) => i.id === id);
}

export function getTaxonomy(vocabulary?: string): TaxonomyTerm[] {
  if (vocabulary) {
    return taxonomy.filter((t) => t.vocabulary === vocabulary);
  }
  return taxonomy;
}

export function getDataSources(): DataSource[] {
  return dataSources;
}

export function getStats() {
  const types = new Set<string>();
  const useCases = new Set<string>();
  const countries = new Set<string>();
  const regions = new Set<string>();
  const sdgs = new Set<string>();

  for (const inn of innovations) {
    if (inn.type) {
      inn.type.split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) types.add(trimmed);
      });
    }
    if (inn.use_cases) {
      inn.use_cases.split(",").forEach((u) => {
        const trimmed = u.trim();
        if (trimmed) useCases.add(trimmed);
      });
    }
    if (inn.countries_adoption) {
      inn.countries_adoption.split(",").forEach((c) => {
        const trimmed = c.trim();
        if (trimmed) countries.add(trimmed);
      });
    }
    if (inn.region) {
      inn.region.split(",").forEach((r) => {
        const trimmed = r.trim();
        if (trimmed) regions.add(trimmed);
      });
    }
    if (inn.impact_sdgs) {
      inn.impact_sdgs.split(",").forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) sdgs.add(trimmed);
      });
    }
  }

  return {
    totalInnovations: innovations.length,
    totalTypes: types.size,
    totalUseCases: useCases.size,
    totalCountries: countries.size,
    totalRegions: regions.size,
    totalSdgs: sdgs.size,
  };
}
