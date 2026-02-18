# SEEDi - Sustainable Evidence for Emerging Decisions

## Overview
SEEDi is a mobile agricultural decision-support platform that helps farmers, policymakers, and investors find the right agricultural innovations for their unique situation. It transforms structured agricultural knowledge into clear, comparable, context-aware insights through a guided 4-step workflow.

## Architecture
- **Frontend**: Expo React Native (Router-based) with tab navigation
- **Backend**: Express server on port 5000 (landing page + API)
- **State Management**: AsyncStorage for local persistence, React Context for shared state
- **Fonts**: DM Sans via @expo-google-fonts/dm-sans
- **Theme**: Green/earth agricultural palette defined in constants/colors.ts

## Project Structure
```
app/
  _layout.tsx           - Root layout with providers (fonts, context, query)
  (tabs)/
    _layout.tsx         - Tab layout (Home, Saved, Reports, Settings)
    index.tsx           - Dashboard screen
    saved.tsx           - Saved decision projects
    reports.tsx         - Reports & exports
    settings.tsx        - App settings
  workflow/
    define-context.tsx  - Step 1: Define user context
    explore-compare.tsx - Step 2: Browse & select innovations
    analyze-simulate.tsx- Step 3: Analyze impact & simulate
    generate-action.tsx - Step 4: Generate action brief

constants/
  colors.ts             - Theme colors
  data.ts               - Data types, mock data, constants

contexts/
  SeedContext.tsx        - Main app state (projects, innovations)
```

## Key Features
1. Dashboard with stats, alerts, sustainability metrics
2. 4-step decision workflow (Define Context → Explore → Analyze → Generate)
3. Innovation cards with scoring (Impact, Feasibility, Sustainability)
4. Before/After simulation comparison
5. Action brief generation with export
6. Saved decisions management
7. Reports with templates

## Recent Changes
- 2026-02-18: Initial build with full 4-step workflow, dashboard, and all screens
