# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The actual application lives in `BIU_s29743/`, not the repo root. The repo root also has a leftover empty `src/` directory and a stray `node_modules`/`package-lock.json` from an earlier setup — ignore those and do all work inside `BIU_s29743/`.

```
BIU_s29743/        Next.js app (run all commands from here)
src/               empty, unused
```

## Commands

Run from `BIU_s29743/`:

```
npm run dev      # start dev server (Next.js, default port 3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite/framework configured in this project.

## Architecture

This is a Next.js **App Router** todo app (course project — "BIU/PJATK") using JSX files (not TSX) despite TypeScript being configured for tooling (`tsconfig.json`, `next-env.d.ts`). Tailwind/PostCSS is wired up in `postcss.config.mjs` but not actually used anywhere in app code — styling is done entirely through Sass. UI strings are in English; Polish only shows up in the page `<meta description>` ("Zaawansowane todo") and in seed/demo data (e.g. the "Rumia" group).

### Data layer: in-memory, no database

Every API route under `app/api/*` is backed by a plain JS array exported from a sibling `data.js` file. There is **no persistence** — all data resets when the dev server restarts. There is no auth/session layer at the API level at all — any route can be called directly with no token/cookie check, regardless of what the UI shows.

- `app/api/tasks/route.js` + `data.js` — GET/POST tasks; `data.js` also owns `makeSchedule()`, which builds the `schedule` sub-object (`mode: "now"|"scheduled"`, `startDate`, `dueDate`, `repeat: { days, hours, intervalMs, next }`).
- `app/api/tasks/[id]/route.js` — GET/PATCH/DELETE a single task by id. PATCH merges the body onto the existing record (id is never overwritable) and, if `schedule` is included, re-runs it through `makeSchedule()` just like POST — notably, switching/staying in `"now"` mode always re-stamps `startDate` to the current server time, not whatever it was before.
- `app/api/groups/route.js` + `data.js` (`groupsDB`, `nextGroupId()`) — GET/POST groups, rejects duplicate names (case-insensitive).
- `app/api/users/route.js` + `data.js` (`usersDB`) — single POST endpoint multiplexed by an `action` field in the body (`"register"` or `"login"`); GET strips `password` before returning. Passwords are stored and compared in plaintext.
- `app/api/users/[id]/route.js` — PATCH a single user. Destructures `email`/`id`/`password` out of the body separately so email/id can never be overwritten by a stray field; `password` only updates if the new value is truthy (so omitting it, e.g. from the profile-edit form, keeps the existing one). Used both by profile self-edit and by the admin dashboard's group-membership toggles.
- `app/api/tags/route.js` exists but is an empty stub (not implemented).

### Client state: Context + useReducer per domain

There are three independent domains, each following the same pattern — a Context provider that owns a `useReducer`, fetches its own data via `fetch("/api/...")` in a `useEffect` on mount, and exposes `{ state, dispatch }`:

- `app/contexts/UsersContext.js` + `app/reducers/UserReducer.js`
- `app/contexts/TasksContext.js` + `app/reducers/TaskReducer.js`
- `app/contexts/GroupsContext.js` + `app/reducers/GroupsReducer.js`

Each reducer handles `FETCH_START`/`FETCH_SUCCESS`/`FETCH_ERROR` plus domain-specific actions, and **throws on an unknown action type** — any new action must be added to the matching reducer's switch statement. `UserReducer` additionally handles `LOGIN_USER`, `LOGOUT_USER` (sets `loggedIn: null`), and `UPDATE_USER` (updates the matching entry in `users` **and** `loggedIn` by id, if it's the currently-logged-in user). Components call `useTasks()` / `useUsers()` / `useGroups()` hooks (defined alongside each context) rather than `useContext` directly; each throws if used outside its provider.

Provider nesting matters for data availability:
- `app/layout.jsx` (root) wraps everything in `UsersProvider`.
- `app/(LoggedIn)/layout.jsx` additionally wraps its subtree in `GroupsProvider` > `TasksProvider`, renders `Navbar`, and — via a `useEffect` — calls `router.replace("/")` whenever `users.loggedIn` is falsy (rendering `null` in the meantime). Pages under `add_task`, `tasks`, `task/[id]`, `profile`, `admin`, `dashboard` rely on this layout.
- `app/(NotLoggedIn)` (login, signup) only has access to `UsersContext`.

This redirect is **client-side only** (a `useEffect`, not middleware/SSR) and is the only access control in the app — there is no real session/cookie, and the API routes themselves enforce nothing. "Login" just dispatches `LOGIN_USER` into `UsersContext` (in-memory, lost on refresh) and navigates to `/profile`. "Logout" (in `Navbar`) dispatches `LOGOUT_USER` then follows a `<Link href="/">`.

"Admin" is not a special flag on the user — it's just a group. Every admin-gated UI check (the `Navbar` "admin" link, the `/admin` page itself) is `users.loggedIn?.groups?.includes("admin")`, evaluated independently client-side wherever it's needed.

### Tasks: virtual folders, filtering, and sorting

Tasks don't live in real folders — each task has a plain `group` string field (validated against existing group names in the add/edit forms), and `app/(LoggedIn)/tasks/page.jsx` derives a folder view from it at render time. Until a folder is opened, the page shows one `Folder` card per group the logged-in user belongs to, plus a synthetic first folder ("All tasks", sentinel `ALL_TASKS_FOLDER`) showing the union of tasks across all of the user's groups.

Inside an opened folder there's a filter bar — search (title substring), status, priority ("importance"), and an assignee `<select>` — plus a sort `<select>` (priority high/low-first, due-date soonest/latest; tasks with no due date always sort last regardless of direction). The assignee dropdown's options are scope-dependent: members of the open group, or — in "All tasks" — the union of members across every group the logged-in user is in; switching folders resets the assignee filter since the valid options change. All filters AND-combine before sorting is applied. `Folder.jsx` and `Task.jsx` (under `app/(LoggedIn)/components/`) are the presentational pieces this page composes.

### Admin dashboard

`app/(LoggedIn)/admin/page.jsx` is gated by the same `groups.includes("admin")` check (with an inline "no access" fallback render, not a redirect). It has two responsibilities: creating new groups (POSTs `/api/groups`, dispatches `ADD_GROUP`) and, per-user, checkboxes for every existing group to toggle that user's membership (PATCHes `/api/users/[id]` with the new `groups` array, dispatches `UPDATE_USER`). Group-membership editing was deliberately removed from the profile page in favor of being centralized here.

### Group/personal dashboard

`app/(LoggedIn)/dashboard/page.jsx` has a scope `<select>` — "all my groups" (union across every group the user belongs to), a specific single group, or "assigned to me" (`task.assignee === user.email`) — and renders stat cards (total + per-status counts), a priority breakdown, and a clickable list of matching tasks linking to `/task/[id]`.

### Forms

Forms (`login`, `signup`, `add_task`, the `task/[id]` edit form, the `profile` edit form) use `formik` + `yup`, paired with a local `SubmitButton` component that reads `useFormStatus()` from `react-dom` for the pending state, and a `<form action={() => formik.submitForm()}>` wrapper. `add_task/page.jsx` and the `task/[id]` `EditTaskForm` share the same field shape and conditional Yup validation (`.when(...)` for scheduled-start dates and repeat intervals) — editing a task reuses almost the same form as creating one. Both also filter their Group `<select>` to groups the logged-in user belongs to, and their Assignee `<select>` to users who belong to the currently-selected group (resetting assignee whenever group changes). The profile edit form is simpler — `firstName`/`lastName`/optional `password` (min 8 chars) only; email is never editable and group membership is admin-only (see above).

### Styling

Sass partials live in `app/scss/` (`_Nav`, `_LoginPage`, `_TasksPage`, `_AddTask`, `_TaskDetail`, `_Profile`, `_Admin`, `_Dashboard`) and are `@import`ed into `app/scss/styles.scss` in that order. Shared variables/mixins (`$base-color`, `@mixin center`, etc.) are declared at the top of `styles.scss` before the partial imports, so partials can use them.

**Important:** `app/layout.jsx` imports the *compiled* `./scss/styles.css`, not the `.scss` source directly. There is no active `sass --watch`, so after editing any `.scss` file you must manually recompile from `BIU_s29743/`:
```
node_modules/.bin/sass app/scss/styles.scss:app/scss/styles.css
```
Both `styles.css` and `styles.css.map` are checked into git — forgetting this step means edits silently don't appear.

Two layout gotchas worth knowing before touching CSS here:
- `.App` (the wrapper `(LoggedIn)/layout.jsx` renders) is a flex column with `nav { flex: none }` and every other direct child `{ flex: 1; min-height: 0 }`. CSS class names are case-sensitive — a stray `.app` is a silent no-op, not an error.
- Grid-based card layouts (`.folders-container`, `.tasks-container`) need explicit `align-content: start; align-items: start;` — a single-row grid with no `grid-auto-rows` otherwise defaults to stretch-like behavior and cards balloon to fill the container's height.
