# Features

Business logic lives here, one folder per area. Pages in `src/app` stay thin and import from these folders.

Each feature folder follows the same shape (add only what the feature needs):

```
features/<name>/
├── components/   UI used only by this feature (e.g. OpportunityCard)
├── actions.ts    Server Actions that change data ("use server"); start with requireUser()
├── queries.ts    Server-side reads with Drizzle
├── schemas.ts    Zod schemas for forms and actions
├── types.ts      Feature types
└── utils.ts      Pure helpers (e.g. scoreMatch)
```

Rules:

- Database code (`@/db`) is imported on the server only.
- Shared, generic UI goes in `src/components`; feature-specific UI stays in its feature.
- Routes come from `@/config/routes`, fixed lists from `@/lib/constants`.
