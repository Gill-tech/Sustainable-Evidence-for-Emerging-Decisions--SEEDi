# SEEDi - Sustainable Evidence for Emerging Decisions

## About

SEEDi is a mobile-first agricultural decision-support platform that helps farmers, policymakers, investors, researchers, and SMEs discover the right agricultural innovations for their unique situation. It transforms structured agricultural knowledge from the ATIO Knowledge Base (3,075+ innovations) into clear, comparable, context-aware insights through a guided 4-step decision workflow.

---

## Live Demo

**Deployed App:** [https://sustainable-evidence-decisions.replit.app](https://sustainable-evidence-decisions.replit.app)

**Try on Your Phone:** Download [Expo Go](https://expo.dev/go) from the App Store (iOS) or Google Play (Android), then scan the QR code from the Replit project URL bar to experience the native mobile version.

<img width="145" height="143" alt="image" src="https://github.com/user-attachments/assets/84aa0e8d-4873-4076-9637-b00e173fac0e" />


---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Mobile)                     │
│              Expo React Native (Router-based)            │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐ │
│  │   Home   │  │  Saved   │  │Reports │  │ Settings  │ │
│  │Dashboard │  │Decisions │  │& Export │  │  & Auth   │ │
│  └────┬─────┘  └──────────┘  └────────┘  └───────────┘ │
│       │                                                  │
│  ┌────▼──────────────────────────────────────────────┐  │
│  │            4-Step Decision Workflow                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │ Define   │→│ Explore  │→│Analyze │→│Generate│ │  │
│  │  │ Context  │ │& Compare │ │& Sim.  │ │ Action │ │  │
│  │  └──────────┘ └──────────┘ └────────┘ └────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  AI Assistant (Floating Chat - OpenAI Streaming)  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON + SSE)
┌──────────────────────▼──────────────────────────────────┐
│                   SERVER (Express)                        │
│                   Port 5000                               │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  API Routes  │  │  ATIO Data   │  │  Landing Page  │ │
│  │ /api/*       │  │  Loader      │  │  (Static HTML) │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────┘ │
│         │                │                               │
│  ┌──────▼──────┐  ┌──────▼───────┐  ┌────────────────┐ │
│  │ Auth System │  │ 3,075 Innov. │  │  AI Service    │ │
│  │ (bcrypt +   │  │ (JSON files) │  │  (GPT-4o-mini  │ │
│  │  sessions)  │  │              │  │   via SSE)     │ │
│  └──────┬──────┘  └──────────────┘  └────────────────┘ │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │         PostgreSQL (Neon) - Users & Sessions     │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Expo React Native (Router-based, file-system routing) |
| **Backend** | Express.js with TypeScript |
| **Database** | PostgreSQL (Neon-backed) |
| **Auth** | Email/password (bcrypt hashing) + session tokens |
| **AI** | OpenAI GPT-4o-mini via Replit AI Integrations (SSE streaming) |
| **Data** | ATIO Knowledge Base - 3,075 agricultural innovations (JSON) |
| **State** | React Context + AsyncStorage + React Query |
| **Fonts** | DM Sans + Playfair Display (Google Fonts) |
| **Styling** | React Native StyleSheet |

---

## Project Structure

```
seedi/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (providers, fonts, query)
│   ├── onboarding.tsx            # Sign-in: name + role selection
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigation (Home, Saved, Reports, Settings)
│   │   ├── index.tsx             # Personalized dashboard
│   │   ├── saved.tsx             # Saved decision projects
│   │   ├── reports.tsx           # Reports & exports
│   │   └── settings.tsx          # App settings + logout
│   └── workflow/
│       ├── define-context.tsx    # Step 1: Define user context
│       ├── explore-compare.tsx   # Step 2: Browse & select innovations
│       ├── analyze-simulate.tsx  # Step 3: Charts, projections, analysis
│       └── generate-action.tsx   # Step 4: Generate action brief
├── components/
│   ├── AIAssistant.tsx           # Floating AI chat with streaming
│   └── ErrorBoundary.tsx         # App crash recovery
├── constants/
│   ├── colors.ts                 # Theme palette (green/earth/sand)
│   └── data.ts                   # Innovation types, mock data, categories
├── contexts/
│   └── SeedContext.tsx           # Global state (projects, user, innovations)
├── lib/
│   └── query-client.ts          # React Query + API helpers
├── server/
│   ├── index.ts                 # Express setup, CORS, static serving
│   ├── routes.ts                # All API endpoints
│   ├── data/
│   │   └── atio-loader.ts       # Loads & deduplicates 3,075 innovations from JSON
│   └── templates/
│       ├── landing-page.html    # Public landing page
│       └── images/              # Landing page assets
├── attached_assets/             # Raw ATIO Knowledge Base JSON files
├── app.json                     # Expo configuration
└── package.json                 # Dependencies
```

---

## Setup & Run Instructions

### Option 1: Run on Replit (Easiest)

1. **Fork the project** on Replit
2. The database and environment variables are auto-provisioned
3. Click **Run** - both the backend and frontend start automatically
4. The web app opens at port 8081 in the Replit webview

### Option 2: Run Locally

#### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key

#### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd seedi

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file with:
DATABASE_URL=postgresql://user:password@host:5432/seedi
PGHOST=your-host
PGPORT=5432
PGUSER=your-user
PGPASSWORD=your-password
PGDATABASE=seedi

# 4. Start the backend server (port 5000)
npm run server:dev

# 5. In a separate terminal, start the Expo frontend (port 8081)
npm run expo:dev
```

---

## Testing on a Device

### Using Expo Go (Recommended for Mobile Testing)

1. **Download Expo Go** from the [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779) or [Google Play (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. **Start the app** on Replit or locally using `npm run expo:dev`
3. **Scan the QR code** that appears:

   <img width="137" height="178" alt="image" src="https://github.com/user-attachments/assets/ef52c9ea-27a0-4993-979d-c6f96bbe783b" />


4. 
   - **On Replit**: Click the URL bar menu and scan the QR code with your phone camera
   - **Locally**: Scan the QR code shown in the terminal
5. **Expo Go opens** and loads SEEDi natively on your device
6. The app hot-reloads as you make code changes

### Using a Web Browser

1. Start the app and open `http://localhost:8081` in your browser
2. Use Chrome DevTools mobile emulation (F12 > Toggle Device Toolbar) to simulate phone screens

### Using the Deployed Demo

Visit [https://sustainable-evidence-decisions.replit.app](https://sustainable-evidence-decisions.replit.app) to see the live production version. The landing page is at this URL, and the mobile app is accessible through the Expo Go QR code from the Replit project.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/innovations?page=&limit=&search=&type=&region=&sdg=` | Paginated, filterable innovations |
| `GET` | `/api/innovations/:id` | Single innovation detail |
| `GET` | `/api/taxonomy?vocabulary=` | Taxonomy terms (readiness, adoption, SDGs) |
| `GET` | `/api/data-sources` | Data source metadata |
| `GET` | `/api/stats` | Aggregate stats (3,075 innovations, 200 countries) |
| `POST` | `/api/auth/signup` | Create account `{name, email, password}` |
| `POST` | `/api/auth/login` | Login `{email, password}` |
| `GET` | `/api/auth/me` | Get current user (Bearer token) |
| `POST` | `/api/auth/logout` | End session |
| `POST` | `/api/ai/ask` | AI Q&A `{question, context?}` returns SSE stream |

---

## The 4-Step Decision Workflow

1. **Define Context** - Set your role (Farmer, Policymaker, SME, Researcher, Investor), region, crop types, challenges, and objectives
2. **Explore & Compare** - Browse innovations with role-specific relevance explanations, risk badges, and score visualizations. Filter by category, search, and sort by impact/readiness/adoption
3. **Analyze & Simulate** - View projected outcomes (yield increase, loss reduction, income potential, soil health), radar charts, before/after comparisons, innovation benchmarks, SDG alignment, and risk assessments
4. **Generate Action** - Get a complete action brief with recommended innovations, key indicators, risk notes, and export options

---

## User Roles

Each role sees personalized relevance explanations on innovation cards:

| Role | Focus |
|------|-------|
| **Farmer** | Practical impact on yields, costs, and labor |
| **Policymaker** | Scalability, policy alignment, national targets |
| **SME** | Business opportunities, market potential |
| **Researcher** | Data availability, research potential |
| **Investor** | ROI, market size, risk profile |
| **Extension Worker** | Training delivery, farmer adoption |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes (auto-set on Replit) |
| `PGHOST` | Database host | Yes (auto-set on Replit) |
| `PGPORT` | Database port | Yes (auto-set on Replit) |
| `PGUSER` | Database user | Yes (auto-set on Replit) |
| `PGPASSWORD` | Database password | Yes (auto-set on Replit) |
| `PGDATABASE` | Database name | Yes (auto-set on Replit) |
| `EXPO_PUBLIC_DOMAIN` | Deployment domain | Auto-set |
| `REPLIT_AI_*` | OpenAI integration keys | Auto-managed on Replit |


## The End ## 
