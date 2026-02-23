# ARMP — Frontend

React + TypeScript frontend for the **Access Request Management Portal**.

## Tech Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** — utility-first CSS
- **ShadCN UI** — component library (manually configured)
- **React Hook Form** + **Zod** — form handling & validation
- **Axios** — HTTP client with JWT interceptors
- **React Router v7** — client-side routing
- **Lucide React** — icon library

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env and adjust if needed
cp .env.example .env

# 3. Start the dev server (default: http://localhost:5173)
npm run dev
```

Make sure the backend is running on the URL specified in `VITE_API_URL`.

## Folder Structure

```
src/
├── components/       # Shared components & layout
│   └── ui/           # ShadCN UI primitives
├── context/          # React Context (AuthContext)
├── lib/              # Axios instance, Zod schemas, utils
├── pages/            # Route-level page components
├── services/         # API service modules
└── types/            # TypeScript interfaces
```

## Environment Variables

| Variable       | Description               | Default                       |
| -------------- | ------------------------- | ----------------------------- |
| `VITE_API_URL` | Backend API base URL      | `http://localhost:5000/api`   |

## Scripts

| Command           | Description            |
| ----------------- | ---------------------- |
| `npm run dev`     | Start dev server       |
| `npm run build`   | Production build       |
| `npm run preview` | Preview production build |

## Roles

| Role        | Dashboard            | Capabilities                                  |
| ----------- | -------------------- | --------------------------------------------- |
| `REQUESTER` | `/requester`         | Create & track own access requests            |
| `APPROVER`  | `/approver`          | View all requests, approve/reject with reason |

## Deployment (Vercel)

1. Push to GitHub (`ARMP_Frontend` repo).
2. Import the repo in [vercel.com](https://vercel.com).
3. Set **Framework Preset** → Vite.
4. Add environment variable `VITE_API_URL` pointing to your deployed backend URL (e.g. `https://armp-backend.onrender.com/api`).
5. Deploy.
