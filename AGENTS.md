# Instance Manager web client: agent guide

The web client for the DHIS2 Instance Manager, which deploys and manages DHIS2 instances, their databases and presets. The backend is `im-manager`; this repo only talks to its API.

Stack: React 19, TypeScript, Vite, `@dhis2/ui` for components, `react-final-form` for forms, `axios-hooks` for API calls, `react-router-dom` v6, Jest for unit tests and Playwright for end-to-end tests. Yarn 4.

## Commands

| What                                                  | Command               |
| ----------------------------------------------------- | --------------------- |
| Install                                               | `yarn`                |
| Dev server (port 3000)                                | `yarn start`          |
| Type-check and build                                  | `yarn build`          |
| Unit tests                                            | `yarn test`           |
| Lint (oxlint, then eslint, then the Prettier check)   | `yarn lint`           |
| Fix what can be fixed automatically                   | `yarn format`         |
| Regenerate API types from the backend's swagger       | `yarn generate-types` |
| End-to-end tests (needs `USER_EMAIL`/`USER_PASSWORD`) | `yarn e2e`            |

The dev server needs `VITE_API_URL`. Copy `.env.example` to `.env` and set `CLASSIFICATION=dev`; `.envrc` (direnv) turns that into the dev API URL.

**Before you say a change is done, run `yarn format`, `yarn lint`, `yarn build` and `yarn test`, and make sure all four pass.** The husky pre-commit hook runs format and lint too.

## Code style

Prettier and the linters enforce most of this. Follow it while writing so the fixers have little to do.

- No semicolons, single quotes, 4-space indent, 180-character lines.
- Arrow functions only: `export const thing = () => …`, never `function thing()`. Components are `export const Name: FC<Props> = ({ … }) => …`.
- At most 3 parameters. Pass an object beyond that.
- Always use braces on `if` and loops.
- Import paths include the file extension (`'./thing.ts'`, `'./thing.tsx'`). Use `import type` for type-only imports.
- Imports are sorted alphabetically by path, with no blank lines between them: packages first, then `../` paths, then `./` paths. **Get this right by hand**: eslint's `import/order` rule crashes under ESLint 10 instead of reporting a misordered import, so the error you get is a stack trace from `import/order`, not a lint message.
- File and folder names are kebab-case (enforced by ls-lint): `deployment-row.tsx`, `deployment-row.module.css`, `build-edit-payload.test.ts`.
- Comments explain why, not what, in full sentences. Match the comment density of the file you're in.

## React

- Prefer `@dhis2/ui` components (`Button`, `DataTable`, `Modal`, `NoticeBox`, `InputField`, …) over hand-built ones, and the `…FieldFF` variants inside `react-final-form` forms.
- Call hooks at the top level only, and list every dependency in hook dependency arrays.
- Give list items a stable `key` from the data, not the array index.
- Don't define components inside other components.
- Use real interactive elements: a `<button>` or `<Link>`, not a `<div onClick>`. Don't nest interactive elements (a button inside a clickable row, a link inside a button). The list pages break this today (see the oxlint warnings); don't add more.
- Talk to the API through `useAuthAxios` (`src/hooks/use-auth-axios.ts`), which adds auth and token refresh. Don't create axios instances.
- Types for API payloads come from `src/types/generated`. Never edit that folder; run `yarn generate-types`.

## Styling

- Each component's styles go in a CSS module next to it (`thing.module.css`), imported as `styles`. Class names are camelCase.
- Every selector in a module must start with one of its own classes. A bare element selector (`td { … }`) in a module is global and leaks into the whole app.
- Use the design tokens, not raw values: `var(--colors-*)`, `var(--spacers-dp*)` and `var(--elevations-*)` from `@dhis2/ui`, and `var(--text-*)` and `var(--layers-*)` from `src/tokens.css`. No hex colours.
- Avoid `!important`. If the `@dhis2/ui` styles win, scope your selector more tightly first.
- Only reference classes that exist in the module you import, and delete classes when you remove their last use.

## TypeScript and general code

These are adapted from [Ultracite](https://www.ultracite.ai/)'s rules, keeping the ones that fit this codebase.

- Prefer `unknown` over `any`. Narrow types instead of asserting them, and avoid non-null assertions (`!`).
- Use early returns instead of nesting. Don't nest ternaries; extract a variable or a small function.
- Use `?.` and `??` for optional values, and `const` unless the value is reassigned.
- `await` promises, or handle them with `.catch`. Don't leave a promise floating.
- Throw `Error` objects with a message, never strings. Don't catch an error only to rethrow it.
- No `console.log`, `debugger` or `alert` in committed code. `console.warn` and `console.error` are fine.
- Avoid import cycles. Move shared code into a module both sides import.
- Links with `target="_blank"` need `rel="noopener noreferrer"`. Don't use `dangerouslySetInnerHTML`.

## Tests

- Unit tests live next to the code they test as `*.test.ts` and run with Jest (`yarn test`). Pure logic, such as payload builders, validators and preset values, should have them.
- Playwright specs live in `e2e/` and run against a real backend.
- Don't commit `.only` or `.skip`.

## Git

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `build:`, `chore:`…). commitlint checks them.
- Keep changes to what the task needs. List unrelated problems you notice instead of fixing them in the same change.
