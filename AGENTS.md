# Repository Guidelines

## Project Structure & Module Organization
Source modules live in `js/`, grouped by function (`core.js`, `segments.js`, `projections.js`, etc.) and loaded through `js/main.js`. Static assets (`index.html`, `styles.css`, `dev.html`) sit at the repo root for quick prototyping, while production builds land in `dist/` after Vite compiles the app. Test assets reside under `tests/`, with dedicated folders for `unit/`, `integration/`, and Playwright `e2e/` suites plus shared fixtures. Use `test-results/` and `tests/playwright-report/` for generated artifacts; keep them out of commits unless specifically reviewing failures.

## Build, Test, and Development Commands
Use `npm run dev` for a hot-reload Vite server, and `npm run build` to ship an optimized bundle into `dist/`. `npm run preview` serves the built output locally for release checks. Primary regression coverage comes from `npm test` (Jest multi-project config). Run focused suites with `npm run test:unit`, `npm run test:integration`, or `npm run test:e2e`. Browser automation is also available via `npm run test:playwright` and project-specific variants such as `npm run test:playwright:edge`.

## Coding Style & Naming Conventions
Follow the existing ES module style: four-space indentation, single quotes for strings, and explicit semicolons. Prefer `const` and `let` over `var`, and organize exports so shared helpers stay in their domain file (`core`, `projections`, etc.) rather than `main`. Keep filenames lowercase with hyphen-free camelCase (`demographics.js`) to match current patterns. Document complex flows with concise JSDoc blocks as seen in `js/main.js`.

## Testing Guidelines
Jest drives unit and integration tests; structure specs to mirror source filenames (`core.test.js`, etc.) inside the corresponding test directory. End-to-end flows live in `tests/e2e/` and Playwright scenarios under `tests/playwright/`. Aim for meaningful coverage and validate locally with `npm run test:coverage`, reviewing the HTML report in `tests/coverage-report.html`. Capture new fixtures or screenshots inside the provided `tests/fixtures/` and `tests/screenshots/` folders.

## Commit & Pull Request Guidelines
Commits in this repo favor descriptive, sentence-style messages. Continue that pattern but tighten to present-tense summaries of the change’s intent (e.g., `Improve demographics default seeding`). For pull requests, include the problem statement, test commands executed, and any relevant artifacts (coverage diffs, screenshots). Link Jira or GitHub issues when available and confirm cross-browser checks when UI changes are involved.
