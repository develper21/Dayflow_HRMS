<div align="center">

# 🧠 Project Memory

### **DayFlow** — Context, Progress & Important Notes

This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions and helps new contributors (or AI assistants) get up to speed quickly.

</div>

<div align="center">

| 📅 Last Updated | 🚩 Current Phase | 📈 Progress |
|:---:|:---:|:---:|
| **Sep 30, 2026** | **Phase 7** | ████████░░ 82% |
| 10:30 AM | Training & Recruitment APIs done; UIs pending | 31 / 38 tasks |

</div>

---

## 🎯 Current Status

- ✅ Project setup completed (Next.js App Router, Tailwind, Prisma, Jest)
- ✅ Git repository initialized and pushed to GitHub
- ✅ PostgreSQL database connected via Prisma
- ✅ Authentication (HR signup, email/employeeId login, JWT sessions) completed
- ✅ Employee management (create with auto ID, list, edit, delete) completed
- ✅ Attendance (check-in/out + records with overtime) completed
- ✅ Leave management (apply, approve/reject, notifications) completed
- ✅ Payroll & salary structures (auto-calculated payslips) completed
- 🔄 Working on payslip download UI + profile documents tab
- ⬜ Performance / Training / Recruitment UIs not started

---

## ✅ Completed Tasks

| # | Task | Completed On |
|---|---|---|
| 1.1 | Initialize Next.js project | Sep 2, 2026 |
| 1.2 | Configure Tailwind CSS | Sep 2, 2026 |
| 1.3 | Set up Git repository | Sep 2, 2026 |
| 1.4 | Configure ESLint + Jest | Sep 3, 2026 |
| 1.5 | Configure Prisma + PostgreSQL | Sep 3, 2026 |
| 2.1 | Company + HR signup API | Sep 5, 2026 |
| 2.2 | Zod auth validation schemas | Sep 5, 2026 |
| 2.3 | NextAuth credentials login | Sep 6, 2026 |
| 2.4 | Email verification flow | Sep 6, 2026 |
| 2.5 | JWT session callbacks | Sep 6, 2026 |
| 3.1 | Create employee API (auto ID) | Sep 8, 2026 |
| 3.2 | Employees list API | Sep 8, 2026 |
| 3.3 | Employee GET/PUT/DELETE | Sep 9, 2026 |
| 3.4 | Employee ID generator | Sep 9, 2026 |
| 3.5 | Admin employees UI | Sep 10, 2026 |
| 3.6 | Admin dashboard stats API | Sep 10, 2026 |
| 4.1 | Check-in / check-out API | Sep 12, 2026 |
| 4.2 | Attendance records API | Sep 12, 2026 |
| 4.3 | Leave apply API | Sep 13, 2026 |
| 4.4 | Leave approve/reject API | Sep 13, 2026 |
| 4.5 | Attendance & leave UI (employee) | Sep 14, 2026 |
| 4.6 | Admin leave management UI | Sep 14, 2026 |
| 5.1 | Salary structure upsert API | Sep 16, 2026 |
| 5.3 | Payroll generation API | Sep 17, 2026 |
| 5.4 | Payroll history API | Sep 17, 2026 |
| 5.5 | Admin salary UI | Sep 18, 2026 |
| 6.1 | Notification service | Sep 20, 2026 |
| 6.2 | Notifications API | Sep 20, 2026 |
| 6.3 | Notification center UI | Sep 21, 2026 |
| 6.4 | Profile GET/PUT API | Sep 22, 2026 |
| 6.5 | File upload API | Sep 23, 2026 |
| 7.1 | Performance reviews API | Sep 25, 2026 |
| 7.2 | Training + enrollment API | Sep 26, 2026 |
| 7.3 | Recruitment pipeline API | Sep 27, 2026 |
| 8.1 | Analytics service + API | Sep 27, 2026 |
| 8.2 | Reports service + API | Sep 27, 2026 |
| 8.4 | Postman collection (all routes) | Sep 30, 2026 |

---

## 🔄 In Progress

| # | Task | Started | Notes |
|---|---|---|---|
| 5.6 | Payslip download UI | Sep 28, 2026 | pdf-lib integration pending |
| 6.6 | Profile documents tab | Sep 29, 2026 | Upload API done, UI pending |

---

## ⬜ Not Started

| # | Task | Phase |
|---|---|---|
| 7.4 | Performance UI | 7 |
| 7.5 | Training UI | 7 |
| 7.6 | Recruitment UI | 7 |
| 8.5 | Analytics & reports UI | 8 |
| 8.6 | Production deploy | 8 |

---

## 🏗️ Architecture Snapshot (Quick Recall)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router (JS/JSX) |
| Backend | Route handlers in `app/api/**/route.js` |
| Auth | NextAuth v4, Credentials, JWT 30-day cookie |
| DB | PostgreSQL + Prisma (`lib/db.js` singleton) |
| Validation | Zod in `lib/validations/` |
| Styling | Tailwind (primary sky-blue palette, Inter font) |

**20 API routes** live under `app/api/` — full request/response documentation in [postman/postman.json](../postman/postman.json).

---

## 🔑 Important Notes & Decisions

1. **Login accepts both email and employeeId** — NextAuth authorize queries `OR [email, employeeId(uppercase)]`.
2. **HR signup auto-verifies email** (`emailVerified: true`); in development the signup response includes `verificationUrl` (used by Postman).
3. **Employee IDs** are auto-generated per company per year via `CompanySettings` counters — format like `RAV0001`; temp password returned **once** in create response.
4. **Payroll is a snapshot** — amounts computed from salary structure at generation time; unique per (user, month, year).
5. **Overtime rule** — attendance `workHours > 8` → `extraHours` shown in attendance API.
6. **Company scoping everywhere** — admin endpoints must filter by `session.user.companyId`.
7. **Notifications are double-channel** — in-app record + email/push/SMS flags for the delivery service.
8. **Cascade deletes** — removing a user wipes profile, job, salary, attendance, leaves, payroll, docs.
9. **`POST /api/training` and `/api/recruitment` are action-based** — body `{ action: 'enroll' | 'create' | ... }` routes to behavior.
10. **Docs live in `/docs`**, API testing in `/postman` — keep both updated when routes change.

---

## 🧯 Known Issues / Tech Debt

| Issue | Impact | Priority |
|---|---|---|
| Employee PUT (`/api/admin/employees/[id]`) accepts raw body without Zod validation | Possible unwanted field updates | Medium |
| Upload endpoint has no file-type/size restriction | Any file can be stored | Medium |
| No rate limiting on auth endpoints | Brute-force risk in production | High (pre-launch) |
| Verification email not actually sent (dev returns URL) | Manual verification in prod | High (pre-launch) |

---

## 🗺️ Next Session Checklist

- [ ] Build payslip download UI (pdf-lib)
- [ ] Add Zod schema to employee PUT route
- [ ] Add file-type/size validation to `/api/upload`
- [ ] Start performance/training UI pages
- [ ] Update MEMORY.md after each milestone
