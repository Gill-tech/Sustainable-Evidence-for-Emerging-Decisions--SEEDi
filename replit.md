# SEEDi - Sustainable Evidence for Emerging Decisions

## Overview
SEEDi is a mobile agricultural decision-support platform that helps farmers, policymakers, and investors find the right agricultural innovations for their unique situation. It transforms structured agricultural knowledge into clear, comparable, context-aware insights through a guided 4-step workflow.

## Architecture
- **Frontend**: Expo React Native (Router-based) with tab navigation
- **Backend**: Express server on port 5000 (landing page + API)
- **Data**: ATIO Knowledge Base - 3,075 innovations loaded from JSON files in attached_assets/
- **State Management**: AsyncStorage for local persistence, React Context for shared state
- **Fonts**: DM Sans via @expo-google-fonts/dm-sans
- **Theme**: Green/earth agricultural palette defined in constants/colors.ts

## Project Structure
```
app/
  _layout.tsx           - Root layout with providers (fonts, context, query)
  onboarding.tsx        - Sign-in: name input + role selection
  (tabs)/
    _layout.tsx         - Tab layout (Home, Saved, Reports, Settings)
    index.tsx           - Dashboard (personalized with user name, workflow stages)
    saved.tsx           - Saved decision projects
    reports.tsx         - Reports & exports
    settings.tsx        - App settings
  workflow/
    define-context.tsx  - Step 1: Define user context
    explore-compare.tsx - Step 2: Browse & select innovations
    analyze-simulate.tsx- Step 3: Analyze impact & simulate
    generate-action.tsx - Step 4: Generate action brief

server/
  index.ts              - Express setup, CORS, landing page serving
  routes.ts             - API routes (/api/innovations, /api/taxonomy, /api/stats, etc.)
  data/
    atio-loader.ts      - Loads & deduplicates ATIO JSON data, exposes query functions
  templates/
    landing-page.html   - Minimalist SEEDi landing page
    images/             - Stock images for landing page

constants/
  colors.ts             - Theme colors
  data.ts               - Data types, mock data, constants

contexts/
  SeedContext.tsx        - Main app state (projects, innovations, user profile)
```

## API Endpoints
- GET /api/innovations?page=1&limit=20&search=&type=&region=&sdg= - Paginated, filterable innovations
- GET /api/innovations/:id - Single innovation detail
- GET /api/taxonomy?vocabulary= - Taxonomy terms (readiness levels, adoption levels, SDGs, etc.)
- GET /api/data-sources - Data source information
- GET /api/stats - Aggregate counts (3,075 innovations, 200 countries, etc.)

## Key Features
1. Minimalist landing page with real agricultural images and SEEDi branding
2. Sign-in/onboarding with name + role selection (Farmer, Policymaker, SME, Researcher, Investor, Extension Worker)
3. Personalized dashboard showing user name, workflow progress, and stats
4. 4-step decision workflow (Define Context -> Explore & Compare -> Analyze & Simulate -> Generate Action)
5. Real ATIO Knowledge Base data (3,075 innovations) served via API
6. Innovation cards with readiness/adoption levels, SDG alignment
7. Saved decisions management
8. Reports with templates

## User Roles
Farmer, Policymaker, SME, Researcher, Investor, Extension Worker

## Recent Changes
- 2026-02-18: Added real ATIO data loading (3,075 innovations) with API endpoints
- 2026-02-18: Created minimalist SEEDi landing page with stock agricultural images
- 2026-02-18: Added sign-in/onboarding flow (name + role selection)
- 2026-02-18: Updated dashboard with personalized greeting, workflow progress, removed top metric icons
- 2026-02-18: Initial build with full 4-step workflow, dashboard, and all screens
