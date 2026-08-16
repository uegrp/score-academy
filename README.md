# SCORE — Football Academy Platform

A mobile-first football academy web app: public marketing site, player
registration, and role-based portals for parents, coaches, and admins —
built on React + TypeScript + Vite + Tailwind + Firebase.

## What's in this scaffold

**Working now, no backend required to view:**
- Full landing page (hero, about, why-SCORE, programs, performance
  section, gallery, news, CTA) using your uploaded brand images
- Public pages: About, Programs, Teams, Matches, Gallery, News, Contact
- Signature `PlayerAttributeCard` component — a football stat-card motif
  reused for performance evaluations and program tiers
- Mobile-first responsive layout with a bottom tab bar, desktop nav,
  and role-aware navigation once signed in
- PWA: manifest, installable icons, offline app-shell service worker

**Wired to Firebase, functional once you add your project keys:**
- Email/password auth with role assignment (`parent`, `coach`, `admin`, `super_admin`)
- Player registration form → writes to `registrations` for admin review
- Real-time Firestore reads across every collection (players, teams,
  training sessions, attendance, evaluations, matches, announcements,
  gallery) — every list renders a genuine empty state when the
  collection is empty, never fabricated data
- Firestore Security Rules (`firestore.rules`) and Storage rules
  (`storage.rules`) enforcing role-based access at the database level,
  not just in the frontend route guard

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Firebase project keys
npm run dev
```

### Firebase project setup
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Email/Password**
3. Create a **Firestore** database (production mode)
4. Enable **Storage**
5. Copy your web app config into `.env.local`
6. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
7. Manually create your first `super_admin` user: sign up normally
   (creates a `parent` role by default), then edit that user's `role`
   field to `super_admin` directly in the Firestore console. From there
   they can promote other accounts through the admin panel (once built).

### Replacing placeholder images
The images in `src/assets/images/` are placeholders standing in for
your uploads (the file upload didn't persist to this build session).
Drop your real files in with these exact names and rebuild:

| Filename | Should be |
|---|---|
| `score-logo.png` | Your SCORE wordmark (used inverted on dark backgrounds) |
| `player-card-ref.jpg` | Not currently used directly — informed the PlayerAttributeCard design |
| `kids-training.jpg` | Children playing football |
| `team-huddle.jpg` | Team huddle (used in hero) |
| `cones-training.jpg` | Training/cones photo |
| `stadium.jpg` | Stadium / atmosphere shot |

## Architecture

```
src/
  components/
    layout/     Navbar, MobileBottomNav, Footer, PublicLayout, DashboardLayout, ProtectedRoute
    ui/         Button, EmptyState, LoadingScreen
    cards/      PlayerAttributeCard (signature), ProgramCard
  context/      AuthContext (Firebase auth + Firestore user/role doc)
  hooks/        useCollection (real-time Firestore subscription + empty/loading state)
  lib/          firebase.ts, collections.ts, registerServiceWorker.ts
  pages/
    public/     Home, About, Programs, Teams, Matches, Gallery, News, Contact, NotFound
    auth/       Login, Register
    parent/     ParentDashboard
    coach/      CoachDashboard
    admin/      AdminDashboard
  types/        Shared TypeScript interfaces for every Firestore collection
```

## Roadmap — what's not built yet

This scaffold covers the full public site, auth, registration, and
dashboard shells with live data. Not yet built, in suggested order:

1. **Admin CRUD screens** — players, coaches, teams, training sessions,
   matches, announcements, gallery, programs (add/edit/archive forms
   on top of the existing `collections.ts` helpers)
2. **Coach panel actions** — attendance marking UI, performance
   evaluation form (feeds the `PlayerAttributeCard` with real data)
3. **Parent-side detail pages** — full player profile, attendance
   history, performance history (routes are stubbed in the bottom nav,
   pages not yet built)
4. **Image uploads** — wiring Firebase Storage into gallery/player
   photo forms
5. **Filtering** — training schedule and match filters by team/date

Each of these follows the same pattern already established: a typed
collection in `types/`, a `useCollection` read, and `createDoc` /
`updateDocById` writes from `lib/collections.ts`.

## Security notes

- No API keys are hardcoded — everything comes from `.env.local`
- Firestore rules are the real authorization boundary; the frontend
  `ProtectedRoute` component is a UX convenience only, not security
- A parent's `role` field cannot be self-escalated (enforced in rules)
- Registration is a two-step flow: submitting the form never directly
  creates an active `Player` — it creates a `registrations` document
  an admin must approve, matching the "admin reviews every application"
  requirement in the brief
