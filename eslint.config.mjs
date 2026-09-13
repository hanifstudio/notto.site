import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const dbMessage = (where) =>
  `${where} must not touch the database directly. Call a service in @/lib/services instead — see CLAUDE.md.`;
const integrationsMessage = (where) =>
  `${where} must not import vendor clients directly. Call a service in @/lib/services instead — see CLAUDE.md.`;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "design/html/**", "out/**", "build/**", "next-env.d.ts"]),

  // Honour the underscore convention for deliberately-unused bindings
  // (e.g. scaffolded integration params pending real implementation).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },

  // Server .ts files under app/ (sitemap.ts, robots.ts, manifest.ts) may call
  // services for SSR data but must not touch the DB or vendor clients directly.
  {
    files: ["app/**/*.ts"],
    ignores: ["app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/db", "@/lib/db/**"], message: dbMessage("Server .ts files") },
            { group: ["drizzle-orm", "drizzle-orm/**"], message: dbMessage("Server .ts files") },
            { group: ["postgres"], message: dbMessage("Server .ts files") },
            { group: ["@/lib/integrations/**"], message: integrationsMessage("Server .ts files") },
          ],
        },
      ],
    },
  },

  // API routes: auth + validation only, delegate everything to a service.
  {
    files: ["app/api/**/route.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/db", "@/lib/db/**"], message: dbMessage("API routes") },
            { group: ["drizzle-orm", "drizzle-orm/**"], message: dbMessage("API routes") },
            { group: ["postgres"], message: dbMessage("API routes") },
            { group: ["@/lib/integrations/**"], message: integrationsMessage("API routes") },
          ],
        },
      ],
    },
  },

  // Services: business logic. Call DB + integrations, never another service.
  {
    files: ["lib/services/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/services/**", "./*.service", "../services/**"],
              message: "Services must not call other services (keep dependencies flat). Move shared logic into @/lib/db or @/lib/shared.",
            },
            { group: ["next/server"], message: "Services must be framework-agnostic. Handle NextResponse in the API route layer." },
            { group: ["@/lib/hooks/**", "hooks/**"], message: "Services must not call hooks. Hooks are for React components, not business logic." },
            { group: ["@/lib/auth/**"], message: "Services must not import the auth adapter. Pass the current user in from the route instead." },
            { group: ["drizzle-orm", "drizzle-orm/**"], message: "Services must not access the database directly. Call functions from @/lib/db instead." },
            { group: ["postgres"], message: "Services must not access the database directly. Call functions from @/lib/db instead." },
          ],
          paths: [
            { name: "@/lib/db", message: "Services must not build queries. Import a named function from @/lib/db/<module> instead." },
            { name: "@/lib/db/schema", message: "Services must not build queries. Import a named function from @/lib/db/<module> instead." },
          ],
        },
      ],
    },
  },

  // Database layer: Drizzle queries only, no business logic, no service imports.
  {
    files: ["lib/db/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Database files contain Drizzle queries only — no business logic, no service imports." },
            { group: ["@/lib/integrations/**"], message: "Database files contain Drizzle queries only — no vendor clients." },
            { group: ["next/server"], message: "Database files contain Drizzle queries only — no Next.js imports." },
          ],
        },
      ],
    },
  },

  // Integration layer: vendor clients (Brevo, Gumroad). Pure, no DB, no services.
  {
    files: ["lib/integrations/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Integration layer contains vendor clients only — no business logic, no service calls." },
            { group: ["next/server"], message: "Integration layer contains vendor clients only — no Next.js imports." },
            { group: ["@/lib/db", "@/lib/db/**"], message: "Integration layer contains vendor clients only — no database access. Data access belongs in @/lib/db, called from a service." },
          ],
        },
      ],
    },
  },

  // Auth adapter: NextAuth config + session loading. Independent of business logic.
  {
    files: ["lib/auth/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Auth adapter must not import services. Keep the auth layer independent from business logic." },
            { group: ["@/lib/integrations/**"], message: "Auth adapter must not import integrations. Keep the auth layer independent from vendor clients." },
          ],
        },
      ],
    },
  },

  // lib/hooks: TanStack Query wrappers only. Call the API route via fetch, never a service or the DB.
  {
    files: ["lib/hooks/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Hooks are TanStack Query wrappers. Call the API route via fetch, never a service or the DB directly." },
            { group: ["@/lib/db", "@/lib/db/**"], message: "Hooks are TanStack Query wrappers. Call the API route via fetch, never a service or the DB directly." },
          ],
        },
      ],
    },
  },

  // Top-level hooks/: general client-side React hooks (state, clipboard, timers).
  // May call lib/client utilities; must never reach past the API boundary.
  {
    files: ["hooks/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Client hooks must go through @/lib/client or @/lib/hooks — never a service directly." },
            { group: ["@/lib/db", "@/lib/db/**"], message: "Client hooks must go through @/lib/client or @/lib/hooks — never the database directly." },
            { group: ["@/lib/integrations/**"], message: "Client hooks must not import vendor clients. These run on the server only." },
          ],
        },
      ],
    },
  },

  // lib/client: browser-only utilities (DOM, clipboard, api-fetch). Never backend layers.
  {
    files: ["lib/client/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/db", "@/lib/db/**"], message: "Client utilities must not import from the database layer. These files run in the browser." },
            { group: ["@/lib/services/**"], message: "Client utilities must not import from services. Call the API route via a hook instead." },
            { group: ["@/lib/integrations/**"], message: "Client utilities must not import from integrations. These run on the server only." },
          ],
        },
      ],
    },
  },

  // Components and features: UI composition. Must go through a hook or receive data as props from a server component.
  {
    files: ["components/**", "features/**", "app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/services/**"], message: "Components must go through a hook. Never import a service or the database directly." },
            { group: ["@/lib/db", "@/lib/db/**"], message: "Components must go through a hook. Never import a service or the database directly." },
            { group: ["@/lib/integrations/**"], message: "Components must not import vendor clients. Call the API route through a hook instead — see CLAUDE.md." },
          ],
        },
      ],
    },
  },

  // Server components render on the server, so page.tsx and layout.tsx may call
  // the Service layer directly for SSR/SEO data. Still never touch the DB or
  // vendor clients directly. Declared last so it overrides the stricter
  // components zone above for these two filenames only.
  {
    files: ["app/**/page.tsx", "app/**/layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/lib/db", "@/lib/db/**"], message: "Server components must not query the database directly. Call a service in @/lib/services instead." },
            { group: ["@/lib/integrations/**"], message: "Server components must not import vendor clients directly. Call a service in @/lib/services instead — see CLAUDE.md." },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
