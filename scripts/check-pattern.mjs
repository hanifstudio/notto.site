#!/usr/bin/env node
// Route-shape checker for app/api/**/route.ts — enforces the shape documented
// in PATTERN.md: auth guard, one service call, try/catch, zod on bodies that
// are actually read, and a consistent { success, ... } envelope.
//
// Usage: node scripts/check-pattern.mjs

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { globSync } from "node:fs";

const ROOT = process.cwd();
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

// EXEMPT: routes (or specific rules on them) that cannot satisfy a rule for a
// documented reason. Prefer "rule:METHOD" over a bare rule name so an
// exemption only silences the handler it actually applies to.
const EXEMPT = {
  "app/api/auth/[...nextauth]/route.ts": { rules: "*", reason: "Three-line re-export of NextAuth handlers; no handler body to inspect." },
  "app/api/auth/register/route.ts": { rules: ["auth"], reason: "Public endpoint: registration creates the user, so there is no caller to authenticate." },
  "app/api/auth/forgot-password/route.ts": { rules: ["auth"], reason: "Public endpoint: must work for a signed-out visitor who forgot their password." },
  "app/api/auth/reset-password/route.ts": { rules: ["auth"], reason: "Public endpoint: authenticated by the single-use reset token, not a session." },
  "app/api/templates/[slug]/copy/route.ts": { rules: ["auth", "zod"], reason: "Public endpoint: free templates are copyable without an account; TemplateService enforces the premium gate. No request body is read." },
  "app/api/templates/route.ts": { rules: ["auth", "zod"], reason: "Public endpoint: the catalog is browsable by anyone, entitlement is only enforced at copy time. Query params, not a request body." },
  "app/api/webhooks/gumroad/route.ts": { rules: ["auth", "zod"], reason: "Public endpoint: Gumroad callbacks carry no signature, so auth comes from a shared token query param instead of a user session. Body parsing/validation happens inside CheckoutService." },
};

const KNOWN_RULES = ["auth", "service", "try-catch", "error-handling", "zod", "response-shape", "envelope", "no-manual-status"];

function isExempt(relPath, rule, method) {
  const entry = EXEMPT[relPath];
  if (!entry) return false;
  if (entry.rules === "*") return true;
  return entry.rules.includes(rule) || (method && entry.rules.includes(`${rule}:${method}`));
}

function validateExemptSpelling() {
  for (const [file, entry] of Object.entries(EXEMPT)) {
    if (entry.rules === "*") continue;
    for (const rule of entry.rules) {
      const [name, method] = rule.split(":");
      if (!KNOWN_RULES.includes(name)) {
        console.error(`[check-pattern] EXEMPT entry for ${file} has unknown rule "${rule}" — typo?`);
      }
      if (method && !METHODS.includes(method)) {
        console.error(`[check-pattern] EXEMPT entry for ${file} has unknown method "${method}" in "${rule}" — typo?`);
      }
    }
  }
}

function findHandlers(content) {
  const starts = [];
  const re = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
  let match;
  while ((match = re.exec(content))) {
    starts.push({ method: match[1], index: match.index });
  }
  return starts.map((entry, i) => ({
    method: entry.method,
    body: content.slice(entry.index, starts[i + 1]?.index ?? content.length),
  }));
}

function checkFile(absPath) {
  const relPath = relative(ROOT, absPath).split("\\").join("/");
  const content = readFileSync(absPath, "utf8");
  const errors = [];

  if (isExempt(relPath, "*")) return errors;

  const serviceImports = [...content.matchAll(/from\s+["']@\/lib\/services\/([^"']+)["']/g)].map((m) => m[1]);
  if (!isExempt(relPath, "service") && serviceImports.length !== 1) {
    errors.push(`expected exactly one @/lib/services import, found ${serviceImports.length}`);
  }
  const serviceClassMatch = content.match(/import\s*{\s*(\w+)\s*}\s*from\s+["']@\/lib\/services\//);
  const serviceClass = serviceClassMatch?.[1];

  const handlers = findHandlers(content);
  if (handlers.length === 0) errors.push("no exported HTTP method handlers found");

  for (const handler of handlers) {
    const { method, body } = handler;
    const prefix = `${method}`;

    // auth: calls getCurrentUser() and the guard actually returns.
    if (!isExempt(relPath, "auth", method)) {
      const hasCall = /getCurrentUser\s*\(/.test(body);
      const guardReturns = /if\s*\(![\w.]+\)\s*{?\s*\n?\s*return\b/.test(body) || /if\s*\(![\w.]+\)\s*return\b/.test(body);
      if (!hasCall || !guardReturns) {
        errors.push(`${prefix}: missing an auth guard that calls getCurrentUser() and returns when absent (rule: auth)`);
      }
    }

    // service: the imported service class is actually called in this handler.
    if (!isExempt(relPath, "service", method) && serviceClass) {
      if (!new RegExp(`\\b${serviceClass}\\.`).test(body)) {
        errors.push(`${prefix}: imports ${serviceClass} but never calls it (rule: service)`);
      }
    }

    // try-catch
    const hasTry = /\btry\s*{/.test(body);
    const hasCatch = /\bcatch\s*\(/.test(body);
    if (!isExempt(relPath, "try-catch", method) && !(hasTry && hasCatch)) {
      errors.push(`${prefix}: handler is not wrapped in try/catch (rule: try-catch)`);
    }

    // error-handling: catch block logs or delegates to handleApiError
    if (!isExempt(relPath, "error-handling", method) && hasCatch) {
      const catchBody = body.slice(body.indexOf("catch"));
      if (!/console\.error\(/.test(catchBody) && !/handleApiError\(/.test(catchBody)) {
        errors.push(`${prefix}: catch block does not call console.error() or handleApiError() (rule: error-handling)`);
      }
    }

    // zod: a body that is genuinely read must be validated.
    const readsBody = /\brequest\.json\s*\(\s*\)/.test(body);
    if (!isExempt(relPath, "zod", method) && readsBody && !/\.safeParse\(/.test(body)) {
      errors.push(`${prefix}: reads the request body but never calls .safeParse() (rule: zod)`);
    }

    const isRedirect = /NextResponse\.redirect\(/.test(body);

    // no-manual-status: no hand-built NextResponse.json({ ... }, { status })
    if (!isExempt(relPath, "no-manual-status", method)) {
      if (/NextResponse\.json\([^)]*,\s*{\s*status/.test(body)) {
        errors.push(`${prefix}: hand-builds a NextResponse.json(..., { status }) instead of ok()/fail() (rule: no-manual-status)`);
      }
    }

    // response-shape + envelope: routed through ok()/fail()/handleApiError()
    if (!isRedirect) {
      if (!isExempt(relPath, "response-shape", method) && !/\bfail\(/.test(body) && !/handleApiError\(/.test(body)) {
        errors.push(`${prefix}: no failure path returns fail() or handleApiError() (rule: response-shape)`);
      }
      if (!isExempt(relPath, "envelope", method) && !/\bok\(/.test(body) && !/handleApiError\(/.test(body)) {
        errors.push(`${prefix}: does not return through ok() or handleApiError() (rule: envelope)`);
      }
    }
  }

  return errors;
}

function main() {
  validateExemptSpelling();

  const files = globSync("app/api/**/route.ts", { cwd: ROOT }).map((f) => join(ROOT, f));
  let totalErrors = 0;
  let compliant = 0;
  let exempt = 0;

  for (const file of files) {
    const relPath = relative(ROOT, file).split("\\").join("/");
    if (isExempt(relPath, "*")) {
      exempt += 1;
      continue;
    }
    const errors = checkFile(file);
    if (errors.length === 0) {
      compliant += 1;
    } else {
      totalErrors += errors.length;
      console.error(`\n${relPath}`);
      for (const error of errors) console.error(`  ✗ ${error}`);
    }
  }

  console.log(`\n[check-pattern] ${files.length} routes — ${compliant} compliant, ${exempt} exempt, ${files.length - compliant - exempt} violating.`);

  if (totalErrors > 0) {
    console.error(`\n[check-pattern] ${totalErrors} violation(s). See PATTERN.md for the rules and how to exempt a route with a reason.`);
    process.exit(1);
  }
}

main();
