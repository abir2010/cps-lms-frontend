# Explora Learning LMS - Frontend

This is the frontend repository for the Learning Management System (LMS) built for the CPS Academy Jr. Software Engineer project round.

The platform supports four distinct user roles (Admin, Content Manager, Instructor, Student) with strict role-based access control, dynamic dashboards, and real-time progress tracking.

**Author:** M. K. Abir

## 🚀 Tech Stack

- **Framework:** Next.js (React)[cite: 1]
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **State Management & Data Fetching:** Redux Toolkit (RTK Query)
- **Form Handling:** React Hook Form, Zod
- **Deployment:** Vercel[cite: 1]

## ✨ Features Completed

- **Role-Based Access Control (RBAC):** Secure Next.js route guards dynamically redirect users based on their role (Admin, Content Manager, Instructor, Student)[cite: 1].
- **Role-Specific Dashboards:** Shared, modular dashboard layouts that adapt UI elements and API fetches based on the logged-in user's permission matrix[cite: 1].
- **Real-Time Progress Tracking:** Self-healing client-side calculations that accurately track a student's completion rate and automatically synchronize with the database if curriculum changes occur[cite: 1].
- **Dynamic Learning Interface:** Students can consume mixed-media content, including automatically parsed YouTube embeds and rich text markdown[cite: 1].
- **Blog Publishing System:** A dedicated blog engine where only "Published" articles are accessible to students and the public, while "Drafts" remain hidden[cite: 1].
- **Secure Session Management:** Custom logout handlers that explicitly clear Redux state, Local Storage, and lingering browser cookies to prevent session leaks.

## 💻 How to Run Locally

To run this frontend locally, ensure that your Strapi backend is already running (typically on port `1337`).

### 1. Clone & Install dependencies

Navigate to the root of this frontend directory and install the required packages:

```bash
npm install
```

### 2. Environment Configuration

Create a .env.local file in the root directory and add the URL for your Strapi backend. If running locally, it should look like this:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### 3. Start the Development Server

Run the following command to start the Next.js app:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the application.
