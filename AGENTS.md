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

`yarn oxlint` fails if the warning count goes above the `--max-warnings` cap in `package.json`. The remaining warnings are mostly clickable rows on the list pages and import cycles, in files the UI redesign is rewriting, so they get fixed as each screen is rebuilt rather than patched first and rewritten later. Don't add warnings, and when your change removes some, lower the cap to the new count.

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

## Product UI design principles

Design serious, functional software interfaces. Prioritise clarity, coherence, efficiency, and restraint over visual novelty.

The standard is a well-designed professional tool, not a Dribbble concept, marketing website, or generic SaaS dashboard.

### 1. Restraint and economy

- Every visible element must earn its place.
- Avoid unnecessary secondary labels, descriptions, subtitles, introductory paragraphs, and instructional text. Let the layout, grouping, labels, and controls do the explaining.
- Do not add explanatory text merely to make an interface feel complete.
- Prefer removing an element to introducing another element to explain it.
- Do not add badges, icons, dividers, cards, or containers without a specific communicative or functional purpose.
- Avoid redundant headings when the surrounding navigation or context already establishes where the user is.
- Use progressive disclosure for genuine complexity, not to conceal poor information architecture.

### 2. Clarity through structure

- Make relationships apparent through proximity, alignment, spacing, and hierarchy before introducing borders or containers.
- Use the fewest levels of visual hierarchy necessary.
- Avoid nested cards and excessive panelisation.
- Do not treat every concept as a separate card. Use lists, tables, sections, and direct layouts when more appropriate.
- Prefer familiar, established interaction patterns over novel ones.
- Make the primary action apparent without artificially enlarging or decorating it.
- Preserve useful information density. Do not spread a simple task across an unnecessarily large interface.

### 3. Interaction design

- Design around what the user is trying to accomplish, not around the available UI components.
- Prefer direct manipulation over secondary configuration interfaces where practical.
- Avoid introducing additional modes, steps, dialogs, or confirmation screens unless they solve a genuine problem.
- Keep relevant actions close to the objects they affect.
- Make system state and the consequences of actions clear.
- Avoid hiding frequently used actions behind menus merely to achieve visual minimalism.
- Use sensible defaults to reduce required decisions.
- Support keyboard navigation, predictable focus, and appropriate feedback.
- Prefer established browser and platform conventions.

### 4. Language and microcopy

- Use short, precise, concrete language.
- Prefer nouns and verbs familiar to the user over abstract product terminology.
- Buttons should describe the action they perform.
- Do not repeat the heading in the supporting description.
- Avoid welcoming messages, promotional language, encouragement, and conversational filler in functional interfaces.
- Avoid phrases such as "Seamlessly manage", "Get started by", "Everything you need", and "Easily configure".
- Do not invent helper text for every form field.
- Add guidance when it prevents a likely mistake, resolves genuine ambiguity, or explains a non-obvious consequence.
- Preserve necessary visible form labels and accessible names. Concision must not compromise accessibility.

### 5. Visual design

- Prefer a restrained, coherent visual system over fashionable styling.
- Typography, spacing, alignment, and proportion should carry the visual hierarchy.
- Use colour purposefully: status, meaning, interaction, and emphasis.
- Avoid decorative gradients, oversized radii, gratuitous shadows, floating cards, and excessive whitespace.
- Do not use large hero headings in operational interfaces.
- Avoid decorative icons when text is equally clear.
- Motion should communicate state, continuity, or causality. Do not add animation for decoration.
- Use existing components, design tokens, and established patterns before inventing new ones.
- Aim for quiet precision rather than conspicuous polish.

### 6. Design decision discipline

Before introducing a new UI element, consider:

- What user need does this serve?
- Is the information or function already available?
- Could existing structure communicate this without another element?
- Is this a familiar pattern in comparable professional software?
- Would removing it make the interface less understandable or less usable?

Do not automatically add elements simply because they commonly appear in generated interfaces.

When several solutions are viable, prefer the simpler one with fewer concepts, fewer steps, and less visual machinery.

### 7. Review the result

After implementing an interface, review the actual rendered UI, not just the code.

Look specifically for:

- Redundant descriptions and labels
- Unnecessary containers, cards, and dividers
- Competing visual hierarchy
- Excessive whitespace or poor information density
- Unnecessary interaction steps
- Inconsistent component patterns
- Missing states or ambiguous actions

Perform a simplification pass: identify elements that can be removed or consolidated without sacrificing usability.

Do not equate more interface with more completeness.

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
