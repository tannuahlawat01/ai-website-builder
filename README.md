# SiteBuilder AI — Full Stack AI Website Builder

A production-ready AI SaaS application that generates complete, beautiful websites from natural language descriptions. Built with the PERN stack (PostgreSQL, Express, React, Node.js) and powered by LLaMA 3.3 70B via Groq API.

## Live Demo

**[https://ai-website-builder-gamma-bice.vercel.app](https://ai-website-builder-gamma-bice.vercel.app)**

---

## Features

- **AI Website Generation** — Describe any website in plain English and get complete HTML/CSS/JS in under 10 seconds
- **Chat-Style Refinement** — Iteratively improve generated websites through natural language instructions (original feature)
- **Live Preview** — See generated websites rendered in real-time with device toggle (Desktop/Tablet/Mobile)
- **Download & Export** — Download complete HTML files you fully own, copy to clipboard, or open in new tab
- **Credit System** — Usage-based credit system with 5 free credits on signup
- **Stripe Payments** — Purchase credit packages via Stripe Checkout with webhook-verified processing
- **Authentication** — Secure auth with Clerk (Email + Google OAuth)
- **Project Management** — Save, view, delete and refine all generated projects from a dashboard

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI framework with fast HMR |
| Styling | Tailwind CSS v4 | Utility-first styling |
| Backend | Node.js + Express | REST API server |
| Database | PostgreSQL via Neon | Serverless relational database |
| ORM | Prisma | Type-safe database queries |
| Auth | Clerk | Authentication and user management |
| AI Model | LLaMA 3.3 70B via Groq | Website generation and refinement |
| Payments | Stripe | Credit purchase processing |
| Frontend Deploy | Vercel | CDN-optimized static hosting |
| Backend Deploy | Railway | Persistent Node.js server hosting |

---

## Architecture

```
User Browser
    └── React Frontend (Vercel CDN)
            └── Express REST API (Railway)
                    ├── Clerk SDK (JWT verification)
                    ├── Prisma ORM → PostgreSQL (Neon)
                    ├── Groq SDK → LLaMA 3.3 70B
                    └── Stripe SDK (payments + webhooks)
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- npm v10+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/tannuahlawat01/ai-website-builder.git
cd ai-website-builder
```

### 2. Install dependencies

```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install && cd ..

# Server dependencies
cd server && npm install && cd ..
```

### 3. Set up environment variables

Create `server/.env`:

```env
DATABASE_URL=your_neon_postgresql_connection_string
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
GROQ_API_KEY=gsk_your_groq_api_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Set up the database

```bash
cd server
npx prisma@6.19.3 generate
npx prisma db push
```

### 5. Run both servers

```bash
cd ..
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Project Structure

```
ai-website-builder/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx         # Sticky navigation with credits badge
│   │   ├── context/
│   │   │   └── AppContext.jsx     # Global state (user, credits, projects)
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance with Clerk token interceptor
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Marketing page
│   │   │   ├── DashboardPage.jsx  # Project management dashboard
│   │   │   ├── BuilderPage.jsx    # AI generation interface
│   │   │   ├── ProjectPage.jsx    # Project view with chat refinement
│   │   │   └── PricingPage.jsx    # Credit packages with Stripe checkout
│   │   ├── App.jsx                # React Router setup with protected routes
│   │   ├── main.jsx               # ClerkProvider + AppProvider setup
│   │   └── index.css              # Global styles + Tailwind v4
│   └── vercel.json                # SPA routing rewrite rules
│
└── server/                        # Node.js + Express backend
    ├── controllers/
    │   ├── generate.controller.js # AI generation + credit deduction
    │   ├── project.controller.js  # CRUD + refine + regenerate
    │   └── payment.controller.js  # Stripe checkout + webhook handler
    ├── middleware/
    │   └── auth.js                # Clerk JWT verification + find-or-create user
    ├── routes/
    │   ├── user.routes.js
    │   ├── generate.routes.js
    │   ├── project.routes.js
    │   └── payment.routes.js
    ├── lib/
    │   ├── prisma.js              # PrismaClient singleton
    │   └── gemini.js              # Groq/LLaMA integration (generateWebsite + refineWebsite)
    ├── prisma/
    │   └── schema.prisma          # User, Project, CreditTransaction models
    ├── index.js                   # Express server entry point
    └── railway.json               # Railway deployment configuration
```

---

## Database Schema

```prisma
model User {
  id               String              @id @default(uuid())
  clerkId          String              @unique
  email            String              @unique
  name             String?
  credits          Int                 @default(5)
  plan             String              @default("free")
  stripeCustomerId String?
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
  projects         Project[]
  transactions     CreditTransaction[]
}

model Project {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(onDelete: Cascade)
  title         String
  prompt        String
  generatedCode String   @db.Text
  status        String   @default("active")
  promptHistory String[] @default([])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model CreditTransaction {
  id              String   @id @default(uuid())
  userId          String
  amount          Int
  type            String
  description     String?
  stripePaymentId String?
  createdAt       DateTime @default(now())
}
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Server health check |
| GET | /api/v1/user/profile | Yes | Get current user profile |
| GET | /api/v1/user/credits | Yes | Get credit balance |
| PATCH | /api/v1/user/profile | Yes | Update user name |
| POST | /api/v1/generate | Yes | Generate a website from prompt |
| GET | /api/v1/projects | Yes | List all user projects |
| GET | /api/v1/projects/:id | Yes | Get single project with HTML |
| PATCH | /api/v1/projects/:id | Yes | Update project title/status |
| DELETE | /api/v1/projects/:id | Yes | Delete project |
| POST | /api/v1/projects/:id/regenerate | Yes | Regenerate with new prompt |
| POST | /api/v1/projects/:id/refine | Yes | Refine with chat instruction |
| POST | /api/v1/payment/checkout | Yes | Create Stripe checkout session |
| POST | /api/v1/payment/webhook | No | Stripe webhook (add credits) |

---

## Key Engineering Decisions

### PostgreSQL over MongoDB
Data relationships (User → Projects → CreditTransactions) are fixed and well-defined. PostgreSQL enforces referential integrity at the database level with cascade deletes — deleting a user automatically removes all their data.

### Prisma ORM
Generates a type-safe database client from the schema. Editor autocomplete catches field name errors before runtime. Schema-as-code means database structure is version-controlled alongside application code.

### Clerk for Authentication
Handles JWT creation/verification, OAuth (Google), email verification, and session management. Implementing this from scratch would take 2+ weeks and introduce security risks. Engineering effort was focused on the AI pipeline instead.

### Find-or-Create Pattern in Middleware
User records are created on first API call rather than a dedicated signup endpoint. Self-healing — if the frontend crashes mid-signup, the user is created on their next request automatically. Prevents orphan states between Clerk and our database.

### Groq/LLaMA over OpenAI
Free tier with no regional restrictions (important for India-based development). LLaMA 3.3 70B has a 1M token context window which supports the iterative refinement feature — sending existing HTML back for modification.

### Stripe Webhooks for Payment Confirmation
Payment confirmation happens server-to-server via Stripe webhooks, not frontend callbacks. The frontend cannot be trusted to confirm payment — it can be manipulated. Webhook signature verification ensures requests genuinely come from Stripe.

### Chat-Style Iterative Refinement (Original Feature)
Users can refine generated websites through natural language chat instructions. The existing HTML is sent back to LLaMA with the instruction. HTML is truncated to 8000 characters before sending to stay within context limits while preserving meaningful context — a deliberate trade-off between context completeness and API cost/latency.

### Singleton PrismaClient
A single PrismaClient instance is shared across the entire application via Node.js global object. Prevents connection pool exhaustion — especially important in development where nodemon restarts files on every save, which would create new connections without this pattern.

---

## Deployment

### Frontend (Vercel)
- Auto-detected Vite project
- `vercel.json` rewrites all routes to `index.html` for React Router SPA support
- Environment variables: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`

### Backend (Railway)
- Nixpacks builder auto-detects Node.js
- `railway.json` specifies `node index.js` as start command
- Environment variables set in Railway dashboard
- Port auto-assigned by Railway via `process.env.PORT`

### Database (Neon)
- Serverless PostgreSQL — scales to zero when unused
- Singapore region (closest available to India)
- Connection pooling enabled for production

---

## Credit Packages

| Package | Credits | Price |
|---------|---------|-------|
| Starter | 10 | $4.99 |
| Popular | 50 | $14.99 |
| Pro | 150 | $34.99 |

Credits never expire. Every new account receives 5 free credits on signup.

---

## Author

**Tannu Ahlawat**
B.Tech AI & ML — IGDTUW Delhi

---

## License

MIT — feel free to use this project as a reference or starting point.