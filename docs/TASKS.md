<div align="center">

# ✅ Project Tasks

### **DayFlow** — Task Breakdown & Development Plan

This document contains the complete list of tasks for building the DayFlow HRMS application. Tasks are divided into phases with clear deliverables, priorities and status tracking.

</div>

<div align="center">

| 📋 Total Tasks | ✅ Completed | 🔄 In Progress | ⬜ Not Started |
|:---:|:---:|:---:|:---:|
| **38** | **31** | **2** | **5** |
| 82% | ███████████████░░░ | | |

</div>

---

## ✅ Phase 1: Project Setup
Set up the development environment, repository and core configuration.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 1.1 | Initialize Next.js project (App Router) | High | ✅ Completed | `app/` router structure |
| 1.2 | Configure Tailwind CSS | High | ✅ Completed | Primary/secondary palettes |
| 1.3 | Set up Git repository | High | ✅ Completed | GitHub remote connected |
| 1.4 | Configure ESLint + Prettier + Jest | Medium | ✅ Completed | `npm run lint` / `npm test` |
| 1.5 | Configure Prisma + PostgreSQL | High | ✅ Completed | `lib/db.js` singleton |
| 1.6 | Environment variables setup | High | ✅ Completed | `.env.local`, `.env.example` |

## ✅ Phase 2: Authentication
Implement user authentication and protected routes.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 2.1 | Company + HR signup API | High | ✅ Completed | Transactional, auto-verified |
| 2.2 | Zod validation schemas (auth) | High | ✅ Completed | `lib/validations/auth.js` |
| 2.3 | NextAuth credentials login | High | ✅ Completed | Email **or** employeeId |
| 2.4 | Email verification flow | Medium | ✅ Completed | Token, 24h expiry |
| 2.5 | JWT session callbacks (role, company) | High | ✅ Completed | id/role/companyId in token |
| 2.6 | Protected route middleware | High | ✅ Completed | Dashboard redirects |

## ✅ Phase 3: Employee Management (Core)
Allow admins to manage the employee lifecycle.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 3.1 | Create employee API (auto ID + temp password) | High | ✅ Completed | `RAV0001` style IDs |
| 3.2 | Employees list API (company scoped) | High | ✅ Completed | Includes profile + job + salary |
| 3.3 | Single employee GET / PUT / DELETE | High | ✅ Completed | Cascade deletes |
| 3.4 | Employee ID generator service | High | ✅ Completed | `lib/employee-utils.js` |
| 3.5 | Admin employees UI pages | High | ✅ Completed | List + add + detail |
| 3.6 | Admin dashboard stats API | High | ✅ Completed | present/on-leave/pending |

## ✅ Phase 4: Attendance & Leave
Track daily attendance and manage leave workflow.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 4.1 | Check-in / check-out API | High | ✅ Completed | One per day, status PRESENT |
| 4.2 | Attendance records API (+ workHours/extraHours) | High | ✅ Completed | Overtime > 8h |
| 4.3 | Leave apply API (+ auto days calc) | High | ✅ Completed | PAID/SICK/UNPAID |
| 4.4 | Leave approve/reject API (admin) | High | ✅ Completed | + employee notification |
| 4.5 | Attendance & leave UI (employee) | High | ✅ Completed | Check-in widget |
| 4.6 | Admin leave management UI | High | ✅ Completed | Approve/reject actions |

## ✅ Phase 5: Payroll & Salary
Salary structures and automatic payroll calculation.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 5.1 | Salary structure model + upsert API | High | ✅ Completed | All components |
| 5.2 | Salary structure view API (employee) | Medium | ✅ Completed | Own only |
| 5.3 | Payroll generation API (auto-calc) | High | ✅ Completed | net = basic + allow − ded |
| 5.4 | Payroll history API | High | ✅ Completed | Month-desc sorted |
| 5.5 | Admin salary UI (configurator) | High | ✅ Completed | Percent-based components |
| 5.6 | Employee payslip UI | High | 🔄 In Progress | Slip download pending |

## 🔄 Phase 6: Notifications & Profile
Keep users informed and profiles current.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 6.1 | Notification service (`lib/notifications.js`) | High | ✅ Completed | Email/push/SMS flags |
| 6.2 | Notifications API (list/send/mark read) | High | ✅ Completed | Paginated + unreadCount |
| 6.3 | Notification center UI | High | ✅ Completed | Bell + unread badge |
| 6.4 | Profile GET/PUT API (upsert + Zod) | High | ✅ Completed | Self or admin |
| 6.5 | File upload API (logo/profile) | Medium | ✅ Completed | `public/uploads/` |
| 6.6 | Profile UI (tabs) | Medium | 🔄 In Progress | Documents tab pending |

## ⬜ Phase 7: Performance, Training & Recruitment
Post-MVP HR modules.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 7.1 | Performance reviews API (CRUD + filters) | Medium | ✅ Completed | Auto overall rating |
| 7.2 | Training + enrollment API | Medium | ✅ Completed | Progress tracking |
| 7.3 | Recruitment pipeline API | Medium | ✅ Completed | Postings + applications |
| 7.4 | Performance UI | Medium | ⬜ Not Started | — |
| 7.5 | Training UI | Medium | ⬜ Not Started | — |
| 7.6 | Recruitment UI | Medium | ⬜ Not Started | — |

## ⬜ Phase 8: Analytics, Reports & Launch
Insights, exports and release readiness.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 8.1 | Analytics service + API (9 types) | Medium | ✅ Completed | `lib/analytics.js` |
| 8.2 | Reports service + API (PDF/Excel/CSV) | Medium | ✅ Completed | `lib/reports.js` |
| 8.3 | Audit log integration | Medium | ✅ Completed | `lib/security.js` |
| 8.4 | Postman collection (all routes) | Medium | ✅ Completed | `postman/postman.json` |
| 8.5 | Analytics & reports UI | Medium | ⬜ Not Started | Recharts dashboards |
| 8.6 | Production deploy (Vercel + DB) | High | ⬜ Not Started | Env setup pending |

---

## 📊 Phase Summary

| Phase | Name | Total | Done | Status |
|---|---|:---:|:---:|---|
| 1 | Project Setup | 6 | 6 | ✅ Completed |
| 2 | Authentication | 6 | 6 | ✅ Completed |
| 3 | Employee Management | 6 | 6 | ✅ Completed |
| 4 | Attendance & Leave | 6 | 6 | ✅ Completed |
| 5 | Payroll & Salary | 6 | 5 | 🔄 1 in progress |
| 6 | Notifications & Profile | 6 | 4 | 🔄 2 in progress |
| 7 | Performance, Training & Recruitment | 6 | 3 | ⬜ UI pending |
| 8 | Analytics, Reports & Launch | 6 | 4 | ⬜ 2 not started |
| | **Total** | **38** | **31** | **82%** |

---

## 🎯 Next Up (Priority Order)

1. 🧾 Finish **payslip download** UI (task 5.6)
2. 👤 Complete **profile documents tab** (task 6.6)
3. 📊 Build **analytics dashboards** with Recharts (task 8.5)
4. 🚀 **Production deployment** — Vercel + PostgreSQL (task 8.6)
