# Log Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the instance log modal with a wide drawer. The drawer has replica, container and line-count
pickers, a filter, level chips and level colours, pause and resume, wrap, copy, download, and states that
explain themselves.

**Architecture:**

- A pure module (`log-lines.ts`) handles line splitting, level classification, the line cap, filtering
  and removing overlap after a reconnect. It is tested with Jest.
- A `fetch`-based reader (`log-stream.ts`) streams the endpoint.
- A hook (`use-log-stream.ts`) owns the connection: connecting, live, waiting, reconnecting and error.
- A presentational `LogDrawer` sits on top of the hook.
- `ComponentsTable` holds which log is open, so the drawer survives its row disappearing.

**Tech Stack:** React 18 + TypeScript, `@dhis2/ui`, CSS modules, Jest (ts-jest, `testEnvironment: 'node'`),
and the mock API at `~/Documents/github/im-mock-api`.

**Spec:** `docs/superpowers/specs/2026-11-03-log-drawer-design.md`

## Global Constraints

- No backend (im-manager) changes and no new npm dependencies.
- **Cautious first.** Joe: "we really don't want to crash the browser … if unsure, go cautious." Where a
  task leaves a number or approach open, pick the one that holds and draws less.
- The endpoint is `GET /instances/:id/logs?selector=&replica=&container=&tail=`. `tail` is 100 | 1000 | 5000,
  and the default is 1000. **Never send `tail=0`**, and never omit `tail` either.
- What is held is capped by `MAX_LINES = 10000`, `MAX_HELD_CHARS = 4_000_000` and `MAX_LINE_CHARS = 5000`,
  dropping the oldest first.
- What is drawn is capped by `RENDER_LINES = 2000`, with "Show 2,000 earlier lines". Updates are applied at
  most every `FLUSH_MS = 100` (a timer, not rAF). The filter is debounced by 200ms with
  `useDebouncedState`.
- Type is 13px monospace on a 20px line, wrapped by default.
- Scrolling more than 32px up from the bottom pauses following.
- The retry waits are: a 409 waits 4s, 8s, 16s, then 30s; a stream that ends reconnects after 2s, then
  backs off the same way; three other failures in a row give Not connected; and after 10 minutes with no new
  line, retrying stops ("Stopped trying after 10 minutes" plus Try again).
- Every button has a text label (Close keeps the shared drawer's icon button with its `aria-label`).
- The "Logs in Grafana" item stays in the row menu, and the same link also appears in the drawer header.
- The filter is a case-insensitive plain substring, not a regex.
- The code style matches the surrounding code: `FC` components, CSS modules, block comments that explain
  why, and DHIS2 UI components.

## Review Focus

0. **Too much data** (Joe's main worry):
    - a fast flood of lines,
    - one huge line, or one with no newline,
    - a drawer left open for an hour,
    - a drawer open in a background tab.

    Memory and DOM size must stay flat. Covered by the Task 2 cap tests, the buffer cap and timer in
    Task 4, the render cap in Task 6, and the flood check in Task 7.

1. **A chunk that ends mid-line, or splits a multi-byte character.** The line must come out whole and
   undamaged. Covered by the Task 2 splitter tests and by `TextDecoder` with `stream: true` in Task 3.
2. **CRLF line endings** (`\r\n`), which some containers emit. No `\r` should end up in the line text.
   Covered by a Task 2 test.
3. **A stream that ends without a trailing newline.** The last line still shows. Covered by the Task 2
   `flush()` test, and Task 4 calls `flush()` on end.
4. **A filter with regex characters** (`a.b`, `(`, `[`). It matches literally and never throws. Covered by
   a Task 2 test.
5. **Closing the drawer or switching source while streaming.** No updates come from the old stream and no
   request is left open. Covered by the generation and abort steps in Task 4, checked in the network
   panel in Task 7.

---

### Task 0: Branch

Prerequisite: Joe has committed the modal-review work on `phase-6-modals`. It touches
`component-operations-menu.tsx` and `components-table.tsx`, which this plan changes too.

- [ ] **Step 1:** From the main checkout, run
      `git worktree add .claude/worktrees/phase-7-logs -b phase-7-logs phase-6-modals`.
- [ ] **Step 2:** Copy `docs/superpowers/specs/2026-11-03-log-drawer-design.md` and this plan into the new
      worktree if they aren't committed on `phase-6-modals`. Commit them as
      `docs: add log drawer design and plan`.
- [ ] **Step 3:** Add a launch config named `im-web-client-phase7-mock` to the main checkout's
      `.claude/launch.json`. Use the same shape as `im-web-client-phase2-mock`, with the path
      `.claude/worktrees/phase-7-logs`, port `3009`, and `VITE_API_URL=http://localhost:4010`.
- [ ] **Step 4:** Run `yarn install` in the worktree if `node_modules` is missing, then run `yarn test`.
      Expected: all suites pass.

### Task 1: Mock API can show every state

**Files:**

- Modify: `~/Documents/github/im-mock-api/server.js:493-511` (`LOG_LINES` and the `/instances/:id/logs`
  route).

- [ ] **Step 1: Honour `tail`.** Read `tail` from the query, with a default of 1000. Send that many history
      lines instead of the fixed 300.
- [ ] **Step 2: Add a stack trace.** Add a multi-line entry to `LOG_LINES` after the ERROR line: an
      exception line and three `\tat org.hisp…` frames, written as one entry that contains `\n`. Also add a
      Postgres-style `ERROR:  relation "x" does not exist` line and a `WARNING:` line.
- [ ] **Step 3: End streams for one component.** When `selector === 'database'`:
    - End the response after 20 live lines.
    - Then answer that instance's log requests with 409 `instance is still starting up, logs not available yet`
      for 10 seconds.
    - Keep that state in a `Map` keyed by instance id.
- [ ] **Step 3b: Add a flood mode.** When `selector === 'minio'` and the server was started with `MOCK_FLOOD=1`:
    - Write 500 lines every 50ms.
    - Every 5 seconds, write one 1,000,000-character line with no newline. Send it as several writes, so the
      browser gets it across several chunks.
- [ ] **Step 4: Verify.** Run `curl -sN 'http://localhost:4010/instances/<id>/logs?selector=database&tail=5'`
      against a deployed instance id from `GET /deployments`. Expected: 5 history lines, then 20 live lines, then
      curl exits. Run it again straight away. Expected: `409`.
- [ ] **Step 5: Commit in im-mock-api:** `Make the log stream honour tail, end, and back off`.

### Task 2: Pure line handling

**Files:**

- Create: `src/views/instances/details/logs/log-lines.ts`
- Test: `src/views/instances/details/logs/log-lines.test.ts`

**Interfaces (Produces):**

```ts
export const MAX_LINES = 10000
export const MAX_HELD_CHARS = 4_000_000
export const MAX_LINE_CHARS = 5000
export const RENDER_LINES = 2000
export type LogLevel = 'error' | 'warn' | undefined
// id: a running number, stable while the cap drops older entries; used as the React key
export type LogEntry = { id: number; kind: 'line'; text: string; level: LogLevel } | { id: number; kind: 'divider'; text: string }
export type LevelFilter = 'all' | 'warn' | 'error'
export const levelOf: (text: string, previous: LogLevel) => LogLevel
export const toEntries: (lines: string[], previous: LogLevel, firstId: number) => LogEntry[] // classifies in order, carrying level
export const createLineSplitter: (maxLineChars?: number) => { push: (chunk: string) => string[]; flush: () => string[] }
export const appendCapped: (entries: LogEntry[], added: LogEntry[], caps?: { lines?: number; chars?: number }) => { entries: LogEntry[]; dropped: number }
export const dropOverlap: (held: LogEntry[], incoming: string[]) => { lines: string[]; found: boolean }
export const visibleEntries: (entries: LogEntry[], query: string, level: LevelFilter) => LogEntry[]
export const reconnectDivider: (before: { replica: string; restarts: number }, after: { replica: string; restarts: number }, at: Date) => string | undefined
```

- [ ] **Step 1: Write the failing tests.** Use these names and assertions.
    - `levelOf`
        - `'levelOf finds DHIS2, logback and Postgres levels'`:
            - `' * ERROR 2026-11-03T10:14:26,774 boom'` → `'error'`
            - `'WARN  org.hibernate.X - y'` → `'warn'`
            - `'ERROR:  relation "x" does not exist'` → `'error'`
            - `'WARNING:  y'` → `'warn'`
            - `'2026-11-03T10:14:26Z FATAL x'` → `'error'`
            - `'SEVERE: x'` → `'error'`
            - `' * INFO  x'` → `undefined`
        - `'levelOf ignores a level word deep in the message'`: `' * INFO  user typed ERROR in a field'` →
          `undefined`. Only the first 40 characters are searched, and INFO or DEBUG found first wins.
        - `'levelOf carries the level onto continuation lines'`, with previous `'error'`:
            - `'\tat org.x.Y(Y.java:1)'` → `'error'`
            - `'    at x'` → `'error'`
            - `'Caused by: java.io.IOException: x'` → `'error'`
            - `'org.postgresql.util.PSQLException: ERROR: x'` → `'error'`
            - `' * INFO  next'` → `undefined`
            - `''` → `'error'`. A blank line inside a trace keeps the trace's level.
    - `createLineSplitter`
        - `'splitter holds a partial line until the rest arrives'`: `push('a\nb')` → `['a']`, then
          `push('c\nd\n')` → `['bc', 'd']`.
        - `'splitter strips CR'`: `push('a\r\nb\r\n')` → `['a', 'b']`.
        - `'splitter flushes a last line with no newline'`: `push('a\nb')`, then `flush()` → `['b']`, then
          `flush()` → `[]`.
        - `'splitter cuts a long line'`, with `createLineSplitter(10)`: `push('x'.repeat(25) + '\n')` →
          `['xxxxxxxxxx… [15 more characters]']`.
        - `'splitter never holds more than the limit of an unfinished line'`, with `createLineSplitter(10)`:
            1. `push('y'.repeat(8))` → `[]`.
            2. `push('y'.repeat(1_000_000))` → `[]`.
            3. `push('tail\nnext\n')` → `['yyyyyyyyyy… [1000002 more characters]', 'next']`.

            The unfinished piece it holds never goes over 10 characters; it counts the rest without keeping
            it.

    - `appendCapped`
        - `'appendCapped drops the oldest beyond the line cap'`: 3 entries plus 2 with `{ lines: 4 }` → length 4,
          the first text is the original second, and `dropped === 1`.
        - `'appendCapped drops the oldest beyond the character cap'`: 3 entries of 10 characters plus 1 with
          `{ chars: 25 }` → 2 entries remain and `dropped === 2`.
        - `'appendCapped caps what is added alone'`: `[]` plus 15,000 entries with the defaults → length 10,000.
    - `dropOverlap`
        - `'dropOverlap skips lines already held'`: held texts `['a','b','c']`, incoming `['b','c','d','e']`
          → `{ lines: ['d','e'], found: true }`.
        - `'dropOverlap matches the last three held lines, not one repeated line'`: held `['x','ok','ok']`,
          incoming `['ok','ok','x','ok','ok','n']` → `['n']`. Match the run of the last up to 3 held line texts
          and use its last occurrence.
        - `'dropOverlap reports no match'`: held `['a']`, incoming `['z']` → `{ lines: ['z'], found: false }`.
    - `visibleEntries`
        - `'visibleEntries filters literally and case-insensitively'`: query `'A.B'` matches `'xa.bx'` and not
          `'aXb'`, and query `'('` doesn't throw.
        - `'visibleEntries applies the level chip'`: `'warn'` keeps warn and error lines, and `'error'` keeps only
          error lines. Dividers are kept only when the query is `''` and the level is `'all'`.
    - `reconnectDivider`
        - `'reconnectDivider names a restart'`: same replica, restarts 3 → 4, at 10:52 local →
          `'Container restarted at 10:52'`.
        - `'reconnectDivider names a replaced replica'`: `'a'` → `'b'` → `'a was replaced · now showing b'`.
        - `'reconnectDivider is quiet when nothing changed'` → `undefined`.

- [ ] **Step 2:** Run `yarn test log-lines`. Expected: FAIL, because the module isn't found.
- [ ] **Step 3:** Implement the exports with the signatures above. Use `HH:MM` from `toTimeString().slice(0, 5)`.
      `appendCapped` must not copy the whole array on every call. Use one `concat` and one `slice`, and keep a
      running character count so it isn't recomputed over every entry. If the count is carried, return it too and
      update the interface here.
- [ ] **Step 4:** Run `yarn test log-lines`. Expected: all pass.
- [ ] **Step 5:** Commit: `feat: add log line parsing, levels and filtering`.

### Task 3: Streaming reader

**Files:**

- Create: `src/views/instances/details/logs/log-stream.ts`
- Modify: `src/hooks/use-auth-axios.ts`. Export `dispatchUnauthorizedEvent`, and leave the rest unchanged.

**Interfaces (Produces):**

```ts
export class LogStreamError extends Error { constructor(public status: number, message: string) }
export type LogSource = { instanceId: number; selector: string; replica: string; container?: string; tail: number }
export const streamLog: (source: LogSource, onChunk: (text: string) => void, signal: AbortSignal) => Promise<void>
// resolves when the server ends the stream; rejects with LogStreamError (non-2xx, body text as message) or AbortError
```

- [ ] **Step 1:** Implement `streamLog`:
    1. Call `fetch(`${baseURL}/instances/${id}/logs?${URLSearchParams}`, { credentials: 'include', signal })`.
       Omit `container` when it is empty.
    2. On a 401, `await refreshTokens()` and try once more. If the refresh throws or the second answer is also a
       401, call `dispatchUnauthorizedEvent()` and throw `LogStreamError(401, …)`.
    3. On any other non-OK status, throw `LogStreamError(status, await res.text() || res.statusText)`.
    4. Read `res.body.getReader()` with one `TextDecoder` (`decode(value, { stream: true })`) and pass each
       decoded string to `onChunk`.
- [ ] **Step 2:** Run `yarn tsc -b`. Expected: no errors. There is no unit test, because the module reads
      `window` through `baseURL`. Task 7 covers it.
- [ ] **Step 3:** Commit: `feat: stream instance logs with fetch`.

### Task 4: Connection hook

**Files:**

- Create: `src/views/instances/details/logs/use-log-stream.ts`

**Interfaces:**

- Consumes: `streamLog`, `LogStreamError`, `LogSource` (Task 3), and `createLineSplitter`, `toEntries`,
  `appendCapped`, `dropOverlap`, `reconnectDivider`, `LogEntry` (Task 2).
- Produces:

```ts
export type StreamStatus = 'connecting' | 'live' | 'waiting' | 'reconnecting' | 'error'
export const useLogStream: (
    source: LogSource,
    restarts: number,
    resetKey: string
) => {
    entries: LogEntry[]
    total: number
    dropped: number
    status: StreamStatus
    error?: string
    retry: () => void
}
```

`total` counts every line ever appended. The drawer uses it to count new lines while paused, because
`entries` is capped.

- [ ] **Step 1:** Implement it with these exact behaviours:
    - **A `resetKey` change** clears entries, `total` and `dropped`, aborts the old request and connects
      again. The drawer changes `resetKey` whenever the user picks a replica, container or line count.
    - **A `source.replica` change with the same `resetKey`** keeps the entries and is handled like a
      reconnect. This is the drawer switching away from a replaced pod, so the reconnect rule below adds
      the "was replaced" divider. Use an `AbortController` and a generation counter in a ref, so callbacks from an
      old generation are ignored.
    - **The first chunk** after connecting sets `status: 'live'`.
    - **Chunks are batched.** Run them through the splitter and `toEntries`, carrying the last level. Buffer
      them in a ref; the buffer itself goes through `appendCapped`, so it can't grow past the caps. Flush the
      buffer into state with a `setTimeout(FLUSH_MS)` that is started when the first item arrives in an empty
      buffer. This means at most 10 renders a second, and it still runs in a background tab.
    - **A 409** sets `status: 'waiting'` and retries after 4s, 8s, 16s, then every 30s. It doesn't count as a
      failure, and entries are kept.
    - **The stream ends** (`streamLog` resolves): `flush()` the splitter. Set `status: 'reconnecting'` and
      reconnect after 2s. If it ends again without a new line, back off as for a 409. A new line resets the
      back-off.
    - **Give up after 10 minutes without a new line.** Stop retrying, then set `status: 'error'` and
      `error: 'Stopped trying after 10 minutes'`. `retry()` starts again. Remember the `{ replica, restarts }` the stream started with.
    - **On reconnect:**
        - If `reconnectDivider(start, now)` returns text, add that divider and append the new lines.
        - Otherwise, run the new response's first batch of lines through `dropOverlap` against the held entries.
          If `found` is false, add the divider `'Reconnected'`.
    - **Other errors** each count as a failure. The third failure in a row sets
      `status: 'error', error: err.message` and stops. A successful first chunk resets the count.
      `retry()` resets it and connects again, keeping the entries.
    - **On unmount**, abort and clear all timers and animation frames. An `AbortError` is never reported.
- [ ] **Step 2:** Run `yarn tsc -b`. Expected: no errors. Behaviour is checked in Task 7.
- [ ] **Step 3:** Commit: `feat: follow a log through restarts and back-off`.

### Task 5: Wide drawer option

**Files:**

- Modify: `src/components/drawer/drawer.tsx`. Add the prop `size?: 'default' | 'wide'`, which adds
  `styles.wide`.
- Modify: `src/components/drawer/drawer.module.css`. Add `.wide { width: min(1200px, calc(100vw - 64px)); }`,
  and on narrow windows (`max-width: 640px`) use `100vw`.

- [ ] **Step 1:** Implement it. Existing callers stay unchanged.
- [ ] **Step 2:** Run `yarn tsc -b && yarn lint`. Expected: clean.
- [ ] **Step 3:** Commit: `feat: let the drawer open wide`.

### Task 6: Log drawer UI and wiring

**Files:**

- Create: `src/views/instances/details/logs/log-drawer.tsx` and `log-drawer.module.css`
- Modify: `component-operations-menu.tsx`. Remove `LogModal` and its `showLog` state, and add the prop
  `onShowLogs?: (replica: InstanceComponentReplica) => void`. The Logs item calls
  `onShowLogs(replica)`. The Grafana item is unchanged.
- Modify: `components-table.tsx`. Add the state `logs?: { component: string; replica: string }`, pass
  `onShowLogs` to every menu, and render `<LogDrawer>` with the live `component` found by name.
- Delete: `log-modal.tsx` and `log-modal.module.css`.

**Interfaces:**

- Consumes: `useLogStream`, `StreamStatus` (Task 4), `visibleEntries`, `LevelFilter`, `LogEntry` (Task 2),
  `Drawer` with `size="wide"` (Task 5), `grafanaLogsUrl`, `StatusDot`, `componentStatus`, `MomentFromNow`.
- Produces:

```ts
export const LogDrawer: FC<{
    instanceId: number
    component: InstanceComponent
    initialReplica: string
    namespace?: string
    instanceName?: string
    groupId?: number
    onClose: () => void
}>
```

- [ ] **Step 1: Build the drawer.** Follow the spec's sections and the mockup:
    - **Title** `Logs: {component.name}` with `<StatusDot>`. **Description**: "started <MomentFromNow> ·
      N restarts" for the selected replica. **Header**: `Open in Grafana ↗` (a small secondary button that
      opens in a new tab) when `grafanaLogsUrl(...)` gives a URL.
    - **Source row:**
        - `Replica` select only when `component.replicas.length > 1`.
        - `Container` select only when the selected replica has more than one container.
        - `Lines` select with the options 100, 1,000 and 5,000. The default is 1,000. There is no All.
    - **Replaced replica:** keep two values in state.
        - `picked`: the replica the user chose, starting as `initialReplica`.
        - `replica`: the one actually streamed.
          When `replica` is no longer in `component.replicas` and the list isn't empty, set `replica` to
          `component.replicas[0].name`. Pass `resetKey = `${picked}|${container}|${tail}``, so the automatic
          switch keeps the lines and the hook adds the "was replaced" divider. Choosing in the Replica select sets
          both values.
    - **Tools row:**
        - An `InputField` "Filter lines", debounced 200ms with `useDebouncedState` (from
          `src/hooks/use-debounce-state.ts`), with a "N of M lines" count when a query is set.
        - A `SegmentedControl` for All / Warnings / Errors.
        - A status label: Live (green dot), Paused (amber), Waiting, Reconnecting… or Not connected (grey).
        - The buttons `Pause` / `Resume`, a `Wrap` toggle button (pressed by default), `Copy` and `Download`.
    - **The log:**
        - A scroll box using `visibleEntries`, memoised on `entries`, the debounced query and the level. Draw
          only the last `shown` entries of that list. `shown` starts at `RENDER_LINES` and goes up by
          `RENDER_LINES` with each "Show 2,000 earlier lines" button press (shown when there are more). It
          goes back to `RENDER_LINES` when the source, query or level changes, and when following resumes.
        - Keep the scroll position when the button adds lines above.
        - Rows have no per-row event handlers, carry `data-log-row`, and use `entry.id` as the key. The hook
          passes `total` as `firstId` to `toEntries`, and dividers take the next id too.
        - Line rows: `.err` / `.warn` give the tint, the 3px left bar and a bold level word.
        - Divider rows are centred grey text on a hairline.
        - The `.wrap` class switches `white-space: pre-wrap` (on) or `pre` (off, scrolling sideways in the box).
        - The box keeps its own scroll; the drawer body must not scroll as well.
    - **Pause:**
        - Scrolling up more than 32px, or pressing Pause, sets `pausedAt = total`.
        - While paused, render only the entries that existed then (`entries.slice(0, entries.length - (total - pausedAt))`, floored at 0) and show the floating `↓ {total - pausedAt} new lines` button.
        - That button and Resume clear the pause and scroll to the end.
    - **States in the box:**
        - Connecting with no entries: "Connecting…".
        - Waiting with no entries: "**{component} is still starting up** Logs will appear here as soon as the
          container starts. You don't need to reopen this."
        - Waiting with entries: the same sentence as a bar under the lines.
        - Error: "**Couldn't load the log** {error}" plus `Try again` (which calls `retry`), under any lines
          already loaded.
        - Nothing matching: "No lines match" with `Clear filter`.
        - When `dropped > 0`: a note at the top: "Showing the most recent lines only. Older lines are in
          Grafana", linked when `grafanaLogsUrl` gives a URL.
    - **Copy:** `navigator.clipboard.writeText` of the visible lines' text joined with `\n`. The label shows
      "Copied" for 2s.
    - **Download:** a `Blob` of every held line (unfiltered), downloaded as `{replica}.log`, or
      `{replica}-{container}.log` when a container was picked.
- [ ] **Step 2: Wire it in.** Make the menu and table changes listed above, and delete the modal files.
- [ ] **Step 3:** Run `yarn tsc -b && yarn lint && yarn test`. Expected: clean, all pass.
- [ ] **Step 4:** Commit: `feat: show logs in a drawer with filtering, levels and pause`.

### Task 7: Verify in the browser

- [ ] **Step 1:** `preview_start` `im-mock-api` and `im-web-client-phase7-mock`. Open a deployed DHIS2
      instance's details page.
- [ ] **Step 2:** For each check below, use the browser tools and confirm in the DOM or the network panel:
    1. "…" → Logs on dhis2 opens a wide drawer, and 1,000 lines stream in, going Live.
    2. Stack-trace lines under an ERROR are tinted red too.
    3. Filtering `analytics` shows "N of M lines". Errors shows only error rows.
    4. Scrolling up gives Paused and "↓ N new lines". Clicking it follows again.
    5. Changing Lines to 100 restarts with 100 lines. No request ever has `tail=0` or no `tail`.
    6. On database: after 20 live lines, the status shows Reconnecting… and then Waiting while the old lines
       stay. Once the back-off ends, it reconnects with a divider and streams again.
    7. A pending instance shows the "still starting up" state.
    8. Closing the drawer during a stream leaves no open `/logs` request.
    9. Copy and Download work.
    10. The "Logs in Grafana" item is still in the menu when `GRAFANA_LOGS_URL` is set (set
        `window._env_.GRAFANA_LOGS_URL` in the console and reopen).
- [ ] **Step 3: Flood check** (restart the mock with `MOCK_FLOOD=1`) on minio.
    1. Let it run for 2 minutes. `document.querySelectorAll('[data-log-row]').length` stays at 2,000 or
       fewer.
    2. `performance.memory.usedJSHeapSize` (Chromium) levels off instead of climbing. Compare readings at
       30s, 60s and 120s.
    3. Typing in the filter paints within about 100ms in the Performance panel.
    4. The 1 MB line shows cut, with `… [N more characters]`.
    5. Switch to another tab for 1 minute and come back. The page responds, and memory has not jumped.

    If any check fails, lower `MAX_LINES`, `MAX_HELD_CHARS` or `RENDER_LINES`, in that order, until it passes.
    Commit as `perf: lower the log limits`.

- [ ] **Step 4:** Take screenshots of Live, Filtered, Paused and the Waiting divider for Joe.
