<div align="center">

# 📋 Product Requirements Document (PRD)

### **DayFlow** — Your Complete HR Management Companion

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | Sep 29, 2026 |
| **Author** | Team DayFlow |
| **Status** | Draft |
| **Target Launch** | MVP (v1.0) |

</div>

---

## 1. 📌 Product Overview

**DayFlow** is a web application designed to help HR teams and employees manage the complete employee lifecycle — onboarding, attendance, leave, payroll, performance and recruitment — all in one place.

- **For HR/Admins:** a command center to manage employees, salaries, approvals and analytics.
- **For Employees:** a self-service dashboard for attendance, leave, payslips, profile and training.

---

## 2. 🧩 Problem Statement

Small and mid-size companies manage HR operations through scattered tools — spreadsheets for payroll, WhatsApp for leave approvals, paper files for employee documents. This causes:

- ❌ Lost or delayed leave approvals
- ❌ Manual, error-prone payroll calculation
- ❌ No single source of truth for employee data
- ❌ Zero visibility into attendance and performance trends

---

## 3. 🎯 Goals

| # | Goal |
|---|---|
| 1 | Provide a simple, intuitive platform for complete HR management |
| 2 | Automate payroll calculation from configurable salary structures |
| 3 | Give employees self-service access to their data (profile, payslips, leave) |
| 4 | Offer real-time dashboards and analytics for HR decision making |
| 5 | Deliver a clean, modern, distraction-free user experience |

---

## 4. 👥 Target Users

- **HR Managers / Admins** — manage the entire organization
- **Employees** — manage their own attendance, leave, payroll and profile
- **Company Size** — startups & SMBs (5–500 employees)
- **Tech Comfort** — users on laptops and smartphones

---

## 5. ⭐ Core Features (MVP)

| # | Feature | Description |
|---|---|---|
| 1 | 🔐 **Authentication** | HR signup (creates company), email/employeeId login, email verification |
| 2 | 🧑‍💼 **Employee Management** | Add employees (auto Employee ID + temp password), view, edit, delete |
| 3 | 💰 **Salary Structure** | Configurable components — basic, HRA, bonus, LTA, fuel, PF, professional tax |
| 4 | ⏰ **Attendance** | Daily check-in / check-out, work hours + overtime calculation, admin view |
| 5 | 🌴 **Leave Management** | Apply (PAID/SICK/UNPAID), admin approve/reject, auto notifications |
| 6 | 🧾 **Payroll** | Auto-calculated payslips per month from salary structure |
| 7 | 🔔 **Notifications** | In-app notification center with unread count, mark-as-read |
| 8 | 👤 **Profile Management** | Personal info, bank details, job details, document uploads |
| 9 | 📊 **Dashboards & Analytics** | Admin stats, attendance/payroll/leave trends |
| 10 | 📤 **File Uploads** | Company logos, profile pictures, documents |

### 🚀 Phase 2 (Post-MVP)

| # | Feature |
|---|---|
| 1 | 🎯 Performance reviews (quarterly / annual with ratings) |
| 2 | 🎓 Training management (catalog, enrollment, progress) |
| 3 | 📢 Recruitment (job postings, candidate pipeline) |
| 4 | 📑 Report generation (PDF / Excel / CSV) |
| 5 | 📧 Email / push / SMS notification delivery |

---

## 6. 🧭 User Stories

### HR / Admin
- As an **HR**, I want to sign up and create my company workspace, so I can start onboarding my team.
- As an **HR**, I want to add employees and get auto-generated login IDs, so I don't manage credentials manually.
- As an **HR**, I want to approve or reject leave requests with one click, so approvals are instant.
- As an **HR**, I want to configure salary components per employee, so payroll is calculated automatically.
- As an **HR**, I want a live dashboard (present today / on leave / pending approvals), so I can plan the day.

### Employee
- As an **employee**, I want to check in and check out, so my attendance is tracked accurately.
- As an **employee**, I want to apply for leave and see its status, so I don't chase HR on WhatsApp.
- As an **employee**, I want to download my monthly payslip, so I have proof of income.
- As an **employee**, I want to update my profile and bank details, so my records stay current.

---

## 7. ⚙️ Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | HR signup creates Company + ADMIN user atomically | High |
| FR-2 | Login accepts email **or** employeeId | High |
| FR-3 | Employee ID auto-generated as `{NAME}{SEQ}` per company per year | High |
| FR-4 | New employees get a random temp password shown once to admin | High |
| FR-5 | Attendance: one check-in + one check-out per day, overtime > 8h | High |
| FR-6 | Leave: days auto-calculated; admins notified; status change notifies employee | High |
| FR-7 | Payroll: `net = basic + (HRA + standard + fuel) − (PF + prof. tax)` | High |
| FR-8 | Role-based access: EMPLOYEE sees only own data; ADMIN sees company data | High |
| FR-9 | Notifications with priority, category, action URL | Medium |
| FR-10 | Profile upsert with Zod validation (10-digit phone, valid emails) | Medium |

---

## 8. 🚫 Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API responses < 500ms for list endpoints; dashboard loads < 2s |
| **Security** | bcrypt password hashing (12 rounds), JWT sessions (30 days), Zod input validation, audit logs |
| **Scalability** | PostgreSQL via Prisma; stateless JWT sessions for horizontal scaling |
| **Availability** | 99% uptime target for MVP |
| **Browser Support** | Latest Chrome, Firefox, Safari, Edge + responsive mobile web |
| **Accessibility** | Keyboard navigation, visible focus states, semantic HTML |

---

## 9. 📏 Success Metrics

| Metric | Target |
|---|---|
| Onboarding time (signup → first employee added) | < 10 minutes |
| Leave approval turnaround | < 1 hour average |
| Payroll generation time (per employee) | < 1 minute |
| Employee self-service adoption | > 80% monthly active |
| Support tickets per 50 employees | < 5 / month |

---

## 10. 🗺️ Release Plan

| Milestone | Scope |
|---|---|
| **MVP (v1.0)** | Auth, Employees, Salary, Attendance, Leave, Payroll, Notifications, Profile, Dashboard |
| **v1.1** | Performance reviews, Training, File documents gallery |
| **v1.2** | Recruitment portal, Report generation (PDF/Excel), Email delivery |
| **v2.0** | Mobile app, Multi-company super admin, Integrations (Slack, calendars) |
