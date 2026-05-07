# 🦸‍♂️ DPKid (Dialysis Pediatric Kid)

> A bilingual health management and comprehensive educational platform for pediatric dialysis patients, their healthcare providers, and administrators.

## � Overview

DPKid is a specialized portal built to digitize, monitor, and improve the dialysis journey for children (HD/PD). It transforms intimidating medical routines into an engaging experience by utilizing friendly mascots, floating bubble animations, and interactive educational games. 

Simultaneously, the platform equips doctors with powerful dashboards to monitor daily health check-ins, record dialysis sessions, and communicate directly with their young patients. Administrators possess a high-top view of system analytics, login flows, and unified user management.

## ✨ Features

The application securely segments features across three distinct user roles:

### 🍤 Patient Portal
- **Interactive Educational Games**: Includes the *Water Balance Game, Body Explorer, Breathing Buddy, Medicine Match, Memory Match,* and *Health Quizzes*.
- **Daily Health Tracking**: Child-friendly reporting featuring emoji-based visual scales for mood and pain assessment.
- **Direct Doctor Chat**: Secure messaging interface tailored for easy communication with assigned healthcare providers.
- **Education Hub**: Curated, kid-friendly videos and illustrations explaining kidney health and dialysis.

### 👩猍 Doctor Dashboard
- **Patient Roster**: Visual dashboard of assigned patients featuring Google Avatar integration and active statuses.
- **Dialysis Session Management**: Maintain medical records (blood pressure, weight before/after, session duration, and complications).
- **Form Monitoring**: Review longitudinal daily health reports submitted by patients.
- **Bilateral Messaging**: Active chat functionalities ensuring continuous patient care.

### �! Admin Features
- **System Analytics**: Real-time metric charts (powered by Recharts) logging active sessions and role distributions.
- **User Management**: Centralized CRUD interface to manage, invite, and audit doctors and patients.
- **System Monitoring**: Live monitoring dashboards for platform-wide metrics.

## 🌐 Global
- **Bilingual Support**: Fluent toggling between French (FR) and Arabic (AR) powered by custom Contexts.
- **Modern Authentication**: Secure access via Supabase Auth (Email + Google OAuth).
- **Interactive UI**: Fully responsive, accessible, and heavily animated layouts targeting childhood comfort.

## 🛠️ Tech Stack

**Frontend Environment:**
* **Framework:** React 18
* **Language:** TypeScript
* **Build Tool:** Vite (+ SWC compiler)
* **Styling:** Tailwind CSS, `class-variance-authority`, `tailwindcss-animate`
* **Components:** shadcn/ui (Radix UI primitives)
* **Icons / Visuals:** Lucide React, Embla Carousel

**State & Data Management:**
* **Server State:** @tanstack/react-query
* **Routing:** React Router DOM (v6)
* **Form Validation:** React Hook Form + Zod

**Backend Infrastructure:**
* **BaaS:** Supabase
* **Database:** PostgreSQL
* **Auth:** Supabase Authentication

**Dev Tools:**
* **Dependency Manager:** Bun / NPM
* **Testing:** Vitest, React Testing Library, JSDOM
* **Code Quality:** ESLint

## 🏗️ Architecture

1. **Frontend Isolation**: OLA (Single Page Apps) are strictly segmented by route (/patient/*, /doctor/*, /admin/*). Global wrappers like `AuthContext` and `LanguageContext` provide application-wide state.
2. **Data Layer**: `React Query` acts alongside direct `Supabase Base Client` initializations to fetch data efficiently, providing high-speed caching and optimistic UI updates.
3. **Database Paradigms**: Serverless interactions driven entirely by PostgreSQL Row Level Security (RLS). Logic, enums, and data relationships are strictly enforced on the DB side through complex foreign keys (e.g., cascading patient forms).

## 🚀 Installation & Setup

*:1. Clone the repository**
``bash
git clone https://github.com/your-username/dpkid.git
cd dpkid
```

**2. Install dependencies**
*(Bun is highly recommended according to the lockfile)*
```bash
bun install
```

**3. Configure Environment Variables**
Create a `.env` file at the root.
```bash
cp .env.example .env
```

**4. Start the Development Server**
```bash
bun run dev
```


## 🔐 Environment Variables

- one **VITE_SUPABASE_URL**:  Points the front end to your specific Supabase Project

- two **VITE_SUPABASE_ANON_KEY**: Public access key for API routing (protected by RLS)


## 🆬 Usage & Workflows

1. **Access**: Users land on `/` and authenticate.
2. **Role Distribution**: The system accesses `public.user_roles` and redirects the user to their respective root (e.g., `/doctor` for physicians).
3. **Daily Patient Loop**: Children log in to complete their Daily Health Form, participate in an educational mini-game, and check messages.
2. **Clinical Supervision**: Doctors open their console to evaluate submitted forms and input clinical data from the day's dialysis sessions.


## 🗄️ Database Architecture (Supabase)

- **`profiles`**: Tied to `auth.users`; maintains global metadata (Avatar URLs from Google, Bilingual Names).
- **`user_roles`**: Enum logic defining system privileges (`admin`, `doctor`, `patient`).
- **`patients`** & **`doctors`**: Extended profiles holding clinical parameters. Patients link selectively via `assigned_doctor_id`.
- **`health_forms`** & **`dialysis_sessions`**: Action logs capturing periodic patient metrics cascading on parent deletion.
- **`chat_messages`**: Safe relational table driving cross-account communications.


## 🤗 Deployment

This project includes a `vercel.json` optimized for **Vercel** serverless environments, specifically configured to rewrite SPA paths to `index.html`.

```bash
# Production Build
bun run build 

# Output directory: /dist
```

## 💓 Scripts

* `bun run dev` - Spins up Vite local development.
* `bun run build` - Full TypeScript compilation and Vite build.
* `bun run lint` - Codebase analysis via ESLint.
* `bun run test` - Execute Vitest testing suite.

## � Security
* **Row Level Security (RLS)**: Core data fetching is fenced at the database level ensuring patients and doctors only access associated foreign-key records.
* **Component-level Guards**: Route definitions and components render strictly off authenticated session attributes.
* **Strict Modeling**: Extensively relies on Zod parsing against uncontrolled input parameters.

## ⚡(z Performance Optimizations
* Utilizes **Vite React SWC** for blazing-fast localized transforms.
* Implements **React Query** for request deduplication and memory caching.

## 🤞 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under standard applicable copyright unless specified.

## 👏 Credits
- UI Components powered by [shadcn/ui](https://ui.shadcn.com)
- Backend services driven by [Supabase](https://supabase.com)

