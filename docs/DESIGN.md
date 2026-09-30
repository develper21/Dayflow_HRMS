<div align="center">

# 🎨 Design System

### **DayFlow** — Clean. Simple. Productive.

This document defines the visual design system, UI components, and user experience guidelines for DayFlow HRMS. The goal is to create a modern, minimal, and professional interface with a consistent identity across all pages.

</div>

---

## 1. 🧭 Design Principles

| | | |
|:---:|:---:|:---:|
| **👥 User-Centered** | **🍃 Minimal & Clean** | **🧱 Consistent** |
| Simple and intuitive for HR teams and employees. | Reduce clutter and focus on content. | Follow a unified design system. |

---

## 2. 🌈 Color Palette

Primary colors used across the application (Tailwind config):

### Brand Colors

| Swatch | Name | Hex | Usage |
|---|---|---|---|
| 🟦 | **Primary (Sky)** | `#0ea5e9` — `#0284c7` | Main brand color — buttons, links, active states |
| 🟪 | **Secondary (Purple)** | `#a855f7` — `#9333ea` | Secondary actions, badges, highlights |
| 🟩 | **Success** | `#22c55e` — `#16a34a` | Success messages, approved states |
| 🟨 | **Warning** | `#f59e0b` | Warnings, caution states |
| 🟥 | **Error** | `#ef4444` | Error messages, destructive actions |
| ⬛ | **Ink / Text** | `#0f172a` / `#334155` / `#64748b` | Headings / body / muted text |

### CSS Variables (from `globals.css`)

```css
--primary-50:  #eff6ff    /* lightest tint — hover backgrounds */
--primary-500: #3b82f6    /* base — focus rings, accents */
--primary-600: #2563eb    /* buttons, links */
--primary-700: #1d4ed8    /* hover state */

--secondary-500: #22c55e  /* success */
--secondary-600: #16a34a  /* success hover */
```

### Full Primary Scale (Tailwind)

| 50 | 100 | 200 | 300 | 400 | **500** | **600** | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|
| `#f0f9ff` | `#e0f2fe` | `#bae6fd` | `#7dd3fc` | `#38bdf8` | `#0ea5e9` | `#0284c7` | `#0369a1` | `#075985` | `#0c4a6e` |

### Status Colors

| Status | Color | Example |
|---|---|---|
| ✅ Approved / Present / Paid | `bg-green-100 text-green-800` | Leave approved badge |
| ⏳ Pending / Processing | `bg-yellow-100 text-yellow-800` | Leave pending badge |
| ❌ Rejected / Absent / Failed | `bg-red-100 text-red-800` | Leave rejected badge |
| ℹ️ Info / Draft | `bg-blue-100 text-blue-800` | Draft review badge |

---

## 3. ✍️ Typography

We use **Inter** as the primary font for a clean, modern, highly readable interface.

> **Aa** — Inter · Primary Font · Loaded via Google Fonts in `app/layout.jsx` (weights 300–700)

| Style | Class | Size / Weight |
|---|---|---|
| H1 | `text-3xl font-bold` | 30px / 700 |
| H2 | `text-2xl font-semibold` | 24px / 600 |
| H3 | `text-xl font-semibold` | 20px / 600 |
| H4 | `text-lg font-medium` | 18px / 500 |
| Body | `text-base` | 16px / 400 |
| Small | `text-sm` | 14px / 400 |
| Caption | `text-xs text-slate-500` | 12px / 400 |
| Gradient Heading | `.gradient-text` | Blue gradient fill (custom utility) |

---

## 4. 🧱 UI Components

Standard components to be used throughout the app:

### 🔘 Buttons

| Variant | Classes | Usage |
|---|---|---|
| **Primary** | `bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2` | Main actions (Save, Check In) |
| **Secondary** | `bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2` | Secondary actions (Cancel, Filter) |
| **Danger** | `bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2` | Destructive (Delete employee) |
| **Ghost** | `text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-2` | Low-emphasis actions |
| **Disabled** | `opacity-50 cursor-not-allowed` | While submitting / loading |

### 🃏 Cards

```jsx
<div className="card-hover bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
  {/* icon + title + value */}
</div>
```

- Rounded corners: `rounded-xl`
- Border: `border-slate-200`, shadow: `shadow-sm`
- Hover: lift animation via `.card-hover` (translateY −4px + deeper shadow)

### 🦶 Forms

| Element | Classes |
|---|---|
| Label | `block text-sm font-medium text-slate-700 mb-1` |
| Input | `w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500` |
| Error text | `text-sm text-red-600 mt-1` |
| Help text | `text-xs text-slate-500 mt-1` |

Focus states use the global rule: `outline: 2px solid var(--primary-500)` with 2px offset.

### 🏷️ Badges

```jsx
<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">APPROVED</span>
<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDING</span>
<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">REJECTED</span>
```

### 📊 Stat Cards (Dashboard)

```
┌─────────────────────┐  ┌─────────────────────┐
│ 👥 Total Employees  │  │ ✅ Present Today    │
│        24           │  │        18           │
│ ▲ +2 this month     │  │ ▲ 75% attendance    │
└─────────────────────┘  └─────────────────────┘
```

Icon in a colored soft container (`bg-primary-100 text-primary-600 rounded-lg p-3`), big number (`text-3xl font-bold`), trend line (`text-xs text-slate-500`).

### 🔔 Notifications

- Unread: bold title + `bg-primary-50` background + blue dot
- Read: normal weight, `bg-white`
- Priority colors: URGENT red · HIGH orange · NORMAL slate · LOW slate-400

---

## 5. 📐 Layout & Spacing

| Token | Value | Usage |
|---|---|---|
| Base unit | 4px | All spacing is a multiple of 4 |
| Page padding | `p-6` (24px) | Main content areas |
| Card padding | `p-5` (20px) | Inside cards |
| Gap (grids) | `gap-4` / `gap-6` | Stat grids, form rows |
| Section spacing | `space-y-6` | Between page sections |
| Border radius | `rounded-lg` (8px) inputs/buttons · `rounded-xl` (12px) cards | |
| Sidebar width | 256px (collapsible) | Admin & employee dashboards |

### Responsive Breakpoints (Tailwind)

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | ≥ 640px | Single column forms |
| `md` | ≥ 768px | 2-col stat grids |
| `lg` | ≥ 1024px | Full sidebar + 3-4 col grids |
| `xl` | ≥ 1280px | Max-width containers (1280px) |

**Mobile-first:** dashboards collapse the sidebar into a hamburger menu; tables become stacked cards below `md`.

---

## 6. 🎬 Motion & Animations

Custom utilities defined in `globals.css`:

| Class | Animation | Usage |
|---|---|---|
| `.animate-fadeIn` | Fade + translateY(−10px), 0.3s | Page sections on mount |
| `.animate-slideIn` | Slide from left, 0.4s | Sidebar / list items |
| `.animate-scaleIn` | Scale 0.95 → 1, 0.3s | Modals, popovers |
| `.spinner` | Rotating border loader | Button / page loading states |
| `.animate-pulse` | Opacity 1 → 0.7 loop | Live status dots |

**Rules:** transitions ≤ 300ms · easing `cubic-bezier(0.4, 0, 0.2, 1)` · respect `prefers-reduced-motion`.

---

## 7. ♿ Accessibility

- ✅ Visible focus rings on all interactive elements (global `:focus-visible` rule).
- ✅ Every icon-only button has an `aria-label`.
- ✅ Form fields have associated `<label>` elements.
- ✅ Color contrast ≥ 4.5:1 for text (slate-700 on white = 10:1).
- ✅ Status is never conveyed by color alone — badges include text.
- ✅ Full keyboard navigation: Tab order follows visual order.

---

## 8. 🖼️ Iconography

- Library: **Lucide React** (`lucide-react`).
- Default size: 20px (`w-5 h-5`); stat-card icons 24px; inline icons 16px.
- Stroke width 2; use color contextually (slate-500 muted, primary-600 active).

---

## 9. 📄 Page Design Guidelines

| Page | Design Notes |
|---|---|
| **Login** | Centered card, logo on top, gradient background accent, error banner on failure |
| **Signup** | 2-step feel: Company info → HR info; inline Zod validation messages |
| **Employee Dashboard** | Greeting header + check-in widget + stat cards + upcoming leaves + notifications |
| **Admin Dashboard** | Stats row (Total / Present / On Leave / Pending) + recent employees table |
| **Profile** | Tabbed sections: Personal · Job · Bank & Statutory; edit mode toggles |
| **Tables** | Sticky header, zebra rows (`odd:bg-slate-50`), status badges, row actions right-aligned |

---

*This design system is the single source of truth for UI decisions. Update it when adding new components or colors.*
