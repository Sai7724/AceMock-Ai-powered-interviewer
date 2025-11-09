# AceMock - AI-Powered Interview Practice Platform

AceMock is a web application designed to help users practice for technical interviews. It simulates a multi-stage interview process, providing AI-powered feedback at each step.

## Features

- **Multi-Stage Interview Simulation:** Guides users through a complete interview flow, including:
  - Language Selection
  - Self-Introduction
  - Aptitude Test
  - Technical Q&A
  - Coding Challenge
  - HR Round
- **AI-Powered Feedback:** Utilizes the Gemini API to provide instant, detailed feedback on user performance.
- **User Authentication:** Uses Supabase for user sign-up, sign-in, and profile management.
- **Admin Panel:** Includes an admin panel for managing the application.
- **3D Visualizations:** Incorporates `@react-three/fiber` for engaging 3D graphics.
- **Comprehensive Feedback Report:** Generates a detailed report summarizing the user's performance across all interview stages.

## Technologies Used

- **Frontend:**
  - React
  - Vite
  - TypeScript
  - Tailwind CSS
- **Backend Services:**
  - Supabase (Authentication and Database)
  - Google Gemini API (AI-powered feedback)
- **Testing:**
  - Vitest
  - React Testing Library

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Supabase account and project
- A Google Gemini API key

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/acemock_admin.git
cd acemock_admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Replace `your-supabase-project-url`, `your-supabase-anon-key`, and `your-gemini-api-key` with your actual Supabase project URL, anon key, and Gemini API key.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs the test suite.
- `npm run test:ui`: Runs the test suite with the Vitest UI.
- `npm run test:coverage`: Generates a test coverage report.

## Project Structure

```
acemock_admin/
├── public/
├── src/
│   ├── components/       # React components
│   ├── services/         # Services for external APIs (Supabase, Gemini)
│   ├── tests/            # Test files
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global CSS styles
│   ├── index.tsx         # Entry point of the application
│   └── ...
├── .env.local            # Environment variables
├── package.json
├── README.md
└── ...
```

## Authentication

By default, authentication is disabled for easier manual testing. You can enable it by changing the `AUTH_DISABLED` flag in `src/App.tsx` to `false`.

```typescript
// src/App.tsx
export const AUTH_DISABLED = false; // Set to false to enable authentication
```