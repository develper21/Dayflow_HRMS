<div align="center">

# 📄 Development Rules

### **DayFlow** — Project Guidelines for AI & Human Collaboration

This document defines the development rules, coding standards, and best practices for the DayFlow HRMS application. These rules ensure consistency, maintainability, security, and quality.

**Both AI assistants and human contributors must follow these guidelines.**

</div>

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.

---

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style:

| Area | Rule |
|---|---|
| 🟦 **Language** | JavaScript (JSX) as used in the codebase. Avoid TypeScript/any mixed syntax unless the project migrates. |
| 🏗️ **Framework** | Follow Next.js (App Router) best practices. Route handlers in `app/api/**/route.js`. |
| 🎨 **Styling** | Use Tailwind CSS and follow the design system in [DESIGN.md](./DESIGN.md). No inline style objects for static styling. |
| 🧪 **Validation** | Use Zod schemas from `lib/validations/` at every API boundary. Never trust request bodies. |
| 🧹 **Linting** | Follow ESLint (`eslint-config-next`). Run `npm run lint` before committing. |
| 💅 **Formatting** | 4-space indentation (existing codebase convention), double quotes, semicolons. |
| 📦 **Dependencies** | Use stable, well-maintained packages. Do not add a dependency without checking `package.json` first. |
| 📝 **File Naming** | Use clear, lowercase names. Route handlers must be `route.js`; pages `page.jsx`; components PascalCase. |
| 🔐 **Secrets** | Only in `.env.local` / environment variables. Never commit secrets. Never hardcode URLs or keys. |

---

## 3️⃣ Project Structure

Follow the defined folder structure in [ARCHITECTURE.md](./ARCHITECTURE.md):

- ✅ Reusable UI components go in `/components`.
- ✅ Business logic (services, utils) belongs in `/lib` — not inside route handlers.
- ✅ Database access only via the Prisma singleton from `lib/db.js`.
- ✅ Zod schemas live in `/lib/validations`.
- ✅ API route handlers only orchestrate: validate → authorize → call service/Prisma → respond.
- ✅ Do not create new folders without a clear structural reason.

---

## 4️⃣ API Development Rules

| Rule | Detail |
|---|---|
| 🔑 **Auth first** | Every protected handler starts with `getServerSession(authOptions)` → `401` if missing. |
| 👑 **Role checks** | Admin-only endpoints check `session.user.role !== 'ADMIN'` → `401`. |
| 🏢 **Company scoping** | Admin queries MUST scope by `companyId` — never return cross-company data. |
| ✍️ **Validate input** | Parse bodies with Zod schemas; return `400` with a clear message on failure. |
| 📤 **Response shape** | Success: relevant data key (`{ employees }`, `{ leaves }`). Error: `{ error: 'message' }`. |
| 🚦 **Status codes** | `200` OK · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `500` Server Error. |
| 🧾 **Errors** | Always `console.error` with a context prefix (e.g. `'Create employee error:'`) and return a generic message — never leak stack traces. |
| 🚫 **No secrets in responses** | Temp passwords are returned only once at employee creation. Never expose password hashes. |

---

## 5️⃣ Database Rules

- ✅ Schema changes go in `prisma/schema.prisma` followed by a migration (`npx prisma migrate dev`).
- ✅ Every model uses `cuid()` IDs and `createdAt` / `updatedAt` timestamps.
- ✅ Use `onDelete: Cascade` for user-owned records (profile, attendance, leaves, payroll...).
- ✅ Use compound unique constraints where needed — e.g. payroll `@@unique([userId, month, year])`.
- ✅ Prefer `upsert` for idempotent creates (salary structure, payroll).
- ✅ Wrap multi-step writes in `prisma.$transaction` (e.g. employee + profile + jobDetails + salary).
- ✅ Never run destructive migrations on production without a backup.

---

## 6️⃣ Git Workflow

| Rule | Detail |
|---|---|
| 🌿 **Branches** | `main` is protected; work on `feature/<name>` or `fix/<name>` branches. |
| ✅ **Commits** | Small, atomic commits. Message style: `feat: add leave approval notification` (conventional commits). |
| 🚫 **Never commit** | `.env*`, `node_modules`, generated uploads, `prisma/dev.db`. |
| 🔍 **Before PR** | `npm run lint` + `npm test` must pass locally. |
| 📝 **PRs** | Describe what & why; link related issues; include screenshots for UI changes. |

---

## 7️⃣ Security Rules

- 🔐 Passwords hashed with bcrypt (12 salt rounds) — plain passwords never stored or logged.
- 🍪 Sessions via httpOnly JWT cookies (NextAuth), 30-day max age.
- 🛡️ Every API route independently verifies the session — never trust the client.
- 🏢 Multi-tenant isolation: all queries scoped by `companyId` for admin operations.
- 🕵️ Security-sensitive actions are recorded in `AuditLog` (login, payroll, deletions).
- 🧯 Error responses are generic — detailed errors only in server logs.
- ⏳ Verification tokens expire after 24 hours.

---

## 8️⃣ Testing Rules

- ✅ Write Jest tests for utilities in `lib/` (password hashing, employee ID generation, payroll math).
- ✅ Test API handlers with `node-mocks-http` for request/response simulation.
- ✅ Component tests with React Testing Library; run with `npm test`.
- ✅ Test both success and failure paths (401/400/404/500).
- ✅ Do not merge PRs that break existing tests.

---

## 9️⃣ AI Assistant Rules

- 🤖 Read [PRD.md](./PRD.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DESIGN.md](./DESIGN.md) and [MEMORY.md](./MEMORY.md) before generating code.
- 🤖 Match existing code style — JS (JSX), 4-space indent, existing import patterns (`@/` alias).
- 🤖 Reuse existing services in `lib/` instead of reinventing logic.
- 🤖 Ask/confirm before destructive operations (deleting files, dropping columns, changing auth flow).
- 🤖 After changes, update [MEMORY.md](./MEMORY.md) and [TASKS.md](./TASKS.md) statuses.
