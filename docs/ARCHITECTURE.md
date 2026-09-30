<div align="center">

# 🏛️ System Architecture

### **DayFlow** — Academic-Grade HR Productivity Platform

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the **DayFlow HRMS** application.

</div>

---

## 1. 🌐 High-Level Architecture

DayFlow follows a **full-stack architecture** using Next.js and PostgreSQL.

```
┌──────────┐      HTTPS      ┌─────────────────┐          ┌──────────────────┐          ┌───────────────┐
│   User   │◄───────────────►│  Next.js        │          │  Next.js         │          │   Prisma      │
│ (Web     │   JWT Session   │  Frontend       │◄────────►│  Backend         │◄────────►│  + PostgreSQL │
│ Browser) │    Cookie       │  (React / Client)│   Fetch  │ (API Routes /    │  ORM     │ (Database +   │
└──────────┘                 └─────────────────┘          │  Route Handlers) │          │  Auth Store)  │                                                          └──────────────────┘          └───────────────┘
```

- **User** interacts with the frontend in a web browser.
- **Frontend** (React components under `app/`) renders dashboards and forms.
- **Backend** (route handlers under `app/api/**`) handles business logic, validation, and authorization.
- **Database** (PostgreSQL via Prisma ORM) persists all HR data.

---

## 2. 🧰 Technology Stack

Technologies used in the project and their purpose:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16 (App Router) | UI framework |
| Language | JavaScript (JSX) | Type-safe-ready, better developer experience |
| Styling | Tailwind CSS | Modern and responsive UI |
| State / Forms | React Hook Form + Zod | Form state & schema validation |
| Backend | Next.js Route Handlers (`app/api/**/route.js`) | REST API endpoints |
| Auth | NextAuth v4 (Credentials + JWT) | Email/employeeId + password login, 30-day sessions |
| ORM | Prisma | Type-safe database access |
| Database | PostgreSQL | Relational HR data |
| Password Hashing | bcryptjs (12 salt rounds) | Secure credential storage |
| Validation | Zod | Request body validation at API boundary |
| Charts | Recharts | Analytics dashboards |
| Files | Local `public/uploads` + fs/promises | Logo / profile uploads |
| Reports | exceljs, pdf-lib | Report & payslip generation |
| Email | SendGrid / Nodemailer | Notification delivery |
| Testing | Jest + React Testing Library | Unit tests |
| Version Control | Git + GitHub | Source code management |

---

## 3. 📁 Folder Structure

The project follows a **route-based folder structure** to keep the code organized and scalable:

```
dayflow-hr-platform/
├── app/                        # Next.js App Router
│   ├── api/                    # 🔌 Backend API routes
│   │   ├── auth/
│   │   │   ├── signup/         #   POST   — HR + company registration
│   │   │   ├── [...nextauth]/  #   GET/POST — NextAuth (login/session)
│   │   │   └── verify-email/   #   GET    — email verification
│   │   ├── admin/
│   │   │   ├── dashboard/      #   GET    — admin stats
│   │   │   └── employees/
│   │   │       ├── [id]/       #   GET/PUT/DELETE — single employee
│   │   │       │   └── salary/ #   PUT    — salary structure upsert
│   │   │       └── route.js    #   GET/POST — employees list / create
│   │   ├── attendance/         #   GET/POST — check-in/out + records
│   │   ├── leaves/             #   GET/POST/PATCH — leave requests
│   │   ├── payroll/            #   GET/POST — payslip generation
│   │   ├── salary-structure/   #   GET/PATCH — salary view/update
│   │   ├── notifications/      #   GET/POST/PATCH — notification center
│   │   ├── profile/[userId]/   #   GET/PUT — profile view/update
│   │   ├── performance/        #   GET/POST/PATCH — reviews
│   │   ├── training/           #   GET/POST/PATCH — training & enrollments
│   │   ├── recruitment/        #   GET/POST/PATCH/DELETE — hiring pipeline
│   │   ├── analytics/          #   GET — dashboard/attendance/payroll/... analytics
│   │   ├── reports/            #   GET/POST/DELETE — report generation
│   │   ├── upload/             #   POST — file upload (logo/profile)
│   │   └── test/prisma/        #   GET — DB health check
│   ├── admin/                  # 👑 Admin dashboard pages
│   ├── dashboard/              # 👤 Employee dashboard pages
│   ├── auth/                   # 🔐 login / register / verify-email pages
│   ├── profile/                # 👤 profile pages
│   ├── layout.jsx              # Root layout (Inter font, providers)
│   └── globals.css             # Tailwind + design tokens
├── components/                 # ♻️ Reusable UI components
├── lib/                        # 🧠 Business logic & utilities
│   ├── db.js                   #   Prisma client singleton
│   ├── auth-utils.js           #   hash/verify password, tokens
│   ├── employee-utils.js       #   employeeId generation
│   ├── notifications.js        #   Notification service
│   ├── reports.js              #   Report service
│   ├── analytics.js            #   Analytics service
│   ├── security.js             #   Security helpers / audit log
│   └── validations/            #   Zod schemas (auth, employee)
├── prisma/
│   └── schema.prisma           # 🗄️ Database models
├── docs/                       # 📚 Project documentation
├── postman/                    # 🧪 Postman collection (API testing)
└── public/                     # 🖼️ Static assets & uploads
```

### 🗄️ Database Schema Overview

| Model | Purpose | Key Fields |
|---|---|---|
| `Company` | Tenant root | name (unique), logo |
| `User` | Admin + Employee accounts | email, password, role (ADMIN/EMPLOYEE), employeeId (unique), companyId |
| `EmployeeProfile` | Personal + bank details | DOB, gender, PAN, UAN, bank account, IFSC |
| `JobDetails` | Job information | position, department, manager, dateOfJoining |
| `SalaryStructure` | Salary components | basic, HRA, bonus, LTA, fuel, PF, professional tax |
| `Attendance` | Daily attendance | date, checkIn, checkOut, status |
| `LeaveRequest` | Leave applications | type, start/end, days, status (PENDING/APPROVED/REJECTED) |
| `Payroll` | Monthly payslips | month, year, basic/allowances/deductions/net (unique per user+month+year) |
| `Notification` | In-app notifications | type, title, message, isRead, priority, category |
| `PerformanceReview` | Reviews | 5 ratings, overall, status (DRAFT/SUBMITTED/APPROVED/REJECTED) |
| `Training` / `TrainingEnrollment` | LMS | catalog + per-user progress/score |
| `JobPosting` / `JobApplication` | Recruitment | postings + candidate pipeline |
| `Document` | Uploaded files | fileName, fileUrl, documentType |
| `AuditLog` | Security trail | action, resource, ip, userAgent |
| `Report` | Generated reports | type, format, status, fileUrl |
| `CompanySettings` | Employee-ID counters | per-company/year lastSerialNumber |

---

## 4. 🔄 Data Flow (Example: Leave Request)

```
Employee (Dashboard UI)
   │ 1. POST /api/leaves  { type, startDate, endDate, reason }
   ▼
Route Handler (app/api/leaves/route.js)
   │ 2. getServerSession() → verifies JWT session
   │ 3. Validates required fields
   │ 4. Auto-calculates `days`
   ▼
Prisma ORM
   │ 5. leaveRequest.create(...)          → status: PENDING
   │ 6. notification.create(...) x admins → LEAVE_REQUEST alert
   ▼
PostgreSQL (persisted)
   │
Admin (Dashboard UI)
   │ 7. PATCH /api/leaves { id, status: APPROVED }
   ▼
Route Handler
   │ 8. Verifies ADMIN role → updates leave
   │ 9. notification.create(...) → LEAVE_UPDATE to employee
   ▼
Employee sees status + notification 🔔
```

---

## 5. 🔐 Authentication & Authorization Flow

```
Signup (HR)                    Login (HR or Employee)
   │                              │
   ▼                              ▼
Company + User created      NextAuth Credentials Provider
email auto-verified (HR)    → find by email OR employeeId
   │                        → check emailVerified
   │                        → bcrypt.compare password
   ▼                              │
JWT session cookie             ▼
(next-auth.session-token)   JWT signed with NEXTAUTH_SECRET
30 days, httpOnly           token: id, role, employeeId,
                            companyId, companyName, companyLogo
                                   │
                                   ▼
                            Every protected route:
                            getServerSession(authOptions)
                            → role check (ADMIN / EMPLOYEE)
                            → company scoping
```

### 🛡️ Access Matrix

| Resource | EMPLOYEE | ADMIN |
|---|---|---|
| Own profile | ✅ view/edit | ✅ view/edit any |
| Attendance records | ✅ own only | ✅ whole company (+ search) |
| Leave requests | ✅ apply/view own | ✅ approve/reject any |
| Payroll | ✅ own payslips | ✅ generate/view all |
| Salary structure | ✅ view own | ✅ create/update any |
| Notifications | ✅ own | ✅ send to anyone |
| Employees CRUD | ❌ | ✅ |
| Recruitment / Reports | ❌ | ✅ |

---

## 6. 🧩 Key Design Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | **Next.js App Router (single codebase)** | One deployable unit for UI + API → simple hosting, shared types |
| 2 | **NextAuth with JWT strategy** | Stateless sessions scale horizontally; credentials login supports email *or* employeeId |
| 3 | **Prisma + PostgreSQL** | Relational HR data with strong constraints (unique payroll per month, cascading deletes) |
| 4 | **Zod validation at API boundary** | Single source of truth for request shapes; consistent 400 errors |
| 5 | **Auto-generated Employee IDs** | `CompanySettings` keeps per-company/year counters → collision-free IDs like `RAV0001` |
| 6 | **Payroll as computed snapshot** | Payslips store calculated amounts so later salary changes don't rewrite history |
| 7 | **Notification service abstraction** | One service for in-app + email/push/SMS channels (flags on the record) |
| 8 | **Cascading deletes** | Deleting a user removes profile, attendance, leaves, payroll — no orphans |

---

## 7. 🚀 Deployment Architecture

| Environment | Tool | Notes |
|---|---|---|
| Hosting | Vercel (recommended) | Zero-config Next.js deploy |
| Database | PostgreSQL (Neon / Supabase / RDS) | `DATABASE_URL` env var |
| Secrets | `.env.local` (dev) / Vercel env (prod) | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, SendGrid keys |
| CI | GitHub Actions (lint + test) | Runs Jest suite on PR |
| Monitoring | Vercel Analytics + server logs | Track API latency & errors |

---

*Maintained by Team DayFlow — update this document when the architecture changes.*
