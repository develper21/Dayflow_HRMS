<div align="center">

# 📚 DayFlow — Project Documentation

Complete documentation for the **DayFlow HRMS** (Human Resource Management System).

</div>

---

## 📁 Documentation Files

| File | Purpose | What's Inside |
|---|---|---|
| 📋 [PRD.md](./PRD.md) | **Product Requirements Document** | Product overview, problem statement, goals, target users, core features, user stories, functional & non-functional requirements, success metrics, release plan |
| 🏛️ [ARCHITECTURE.md](./ARCHITECTURE.md) | **System Architecture** | High-level architecture diagram, technology stack, folder structure, database schema overview, data flow, auth flow, access matrix, design decisions, deployment |
| 📄 [RULES.md](./RULES.md) | **Development Rules** | General principles, coding standards, project structure rules, API development rules, database rules, git workflow, security rules, testing rules, AI assistant rules |
| 🎨 [DESIGN.md](./DESIGN.md) | **Design System** | Design principles, color palette (Tailwind tokens), typography, UI components (buttons, cards, forms, badges, stat cards), layout & spacing, animations, accessibility |
| ✅ [TASKS.md](./TASKS.md) | **Project Tasks** | 8 phases, 38 tasks with priority & status tracking, phase summary, next-up priorities |
| 🧠 [MEMORY.md](./MEMORY.md) | **Project Memory** | Current status, completed/in-progress tasks, architecture snapshot, important decisions, known issues, next session checklist |

---

## 🧪 API Testing

The complete Postman collection lives at **[postman/postman.json](../postman/postman.json)** — covering all **20 API routes** (server-side admin APIs + frontend-side employee APIs), with:

- 🔐 Ready-to-run NextAuth login flow (CSRF → login → session cookie)
- 📝 Sample bodies matching the real Zod validation rules
- 🔗 Auto-chained variables (`{{employeeUserId}}`, `{{leaveRequestId}}`, ...)
- 📖 Per-request documentation

### Quick Start

1. Import `postman/postman.json` into Postman.
2. Set `baseUrl`, `adminEmail`, `adminPassword` collection variables.
3. Run **Auth → Get CSRF Token**, then **Auth → Login (Admin)**.
4. Fire any request — cookies handle authentication.

---

## 🧭 Reading Order (New Contributors)

1. **PRD.md** — understand *what* we're building and *why*
2. **ARCHITECTURE.md** — understand *how* it's structured
3. **DESIGN.md** — understand *how it should look & feel*
4. **RULES.md** — understand *the rules of the road*
5. **TASKS.md** — see *what's done and what's next*
6. **MEMORY.md** — get the *current state & key decisions* in 5 minutes

---

*Maintained by Team DayFlow · Keep docs updated with every milestone* 🚀
