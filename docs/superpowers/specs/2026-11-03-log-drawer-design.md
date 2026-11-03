# Log drawer

Date: 2026-11-03. Base: `phase-6-modals`, once its modal-review changes are committed.

## Why

People open an instance's logs when something is wrong and they need to see why: an instance that won't
start, or one that runs but throws errors. Today the "Logs" item in a component or replica row's "…" menu
opens `log-modal.tsx`. It is a modal over the page, holding a black-on-white `<pre>` of the last 1000 lines,
followed live. It has no wrapping, no search, no level colours, no way to pause, no choice of how much
history, and no copy or download. Its only control is Close. Its 409 "still starting up" reply shows as a
generic error.

Joe wants a "good industry standard" log viewer. The research behind it is the **Log Viewers** report
(130 viewers from 65 products): https://claude.ai/artifact/N5UE7Lqo11Sd2NMfpZkfhG, filed in iCloud
Reports as `2026-11-03 Log Viewers`. The mockup Joe approved ("wow, looks nice") is
`.superpowers/brainstorm/66653-1793704924/content/log-drawer.html` in this worktree. It is local only and
is not committed.

## Goals

- Logs open in a wide drawer over the instance details page, not a modal.
- You can switch replica, container and number of lines without closing the drawer.
- A filter box hides lines that don't match. Level chips (All / Warnings / Errors) narrow further.
- ERROR and WARN lines stand out.
- The live tail can be paused and resumed. Scrolling up also pauses it. It always says whether it is
  Live, Paused, Waiting, Ended or Not connected.
- Every state says why it is empty or stopped.
- Readable type, wrapping on by default, and copy and download.

## Non-goals

- **No backend changes.** In particular, no "previous container" option. Joe decided this.
  im-manager has no `previous` (or `since` / `timestamps`) option, and this work doesn't add one.
- No time-range picker, timestamps toggle, merged multi-replica view, dark theme or line numbers.
- No new entry points. Logs still open from the row's "…" → Logs.
- No new dependencies, including a virtualised list library.

## Anti-goals

- A viewer that freezes or crashes the tab on a big log. Joe: "we really don't want to crash the browser
  or anything because we load too much … if unsure, go cautious." Every limit below follows from this, and
  where a number is a guess, the builder picks the lower one.
- Losing the drawer, or what it shows, because the pod it was reading was replaced.
- Unlabelled icon-only buttons (Argo CD's row of eight mystery icons is the example to avoid).

## What exists to build on

- `src/components/drawer/` is the shared `Drawer`: a right-side panel 520px wide. It has a title,
  description, Escape and click-outside to close, and a focus trap. It is used by the component details
  drawer (`component-details-drawer.tsx`, `instance-components-section.tsx`).
- `src/views/instances/details/log-modal.tsx` does the following:
    - It streams through `useAuthAxios` (`manual`, `autoCatch`).
    - It reads the growing body from `XMLHttpRequest.response` in `onDownloadProgress`.
    - It cancels on cleanup and follows the tail unless the reader is within 32px of the bottom.
    - Its comments explain two traps: keep the axios config stable (url only), and ignore progress events
      from a cancelled request. Both still apply.
- `component-operations-menu.tsx` renders `LogModal` from inside the row's menu. It passes `replica.name` and
  `replica.containers`. The Grafana item is shown when `grafanaLogsUrl(...)` returns a URL, and only on
  component rows.
- `components-table.tsx` folds a single replica into its component row. With several replicas, each gets a
  row with a menu where `replicaOnly` is set. Components come from `useDeploymentDetails`, which refetches on
  deployment events, so the replica list updates while the page is open.
- `src/utils/error-message.ts` → `errorMessage(error)` gives im-manager's plain-text reason.
- The API is `GET /instances/:id/logs?selector=&replica=&container=&tail=`.
    - With no `tail`, it sends 1000 lines. `tail=0` sends the whole log.
    - It follows forever and ends only when the container stops or the request is cancelled.
    - It returns 409 with "instance is still starting up, logs not available yet" while the pod is
      being created.
- Tests use Jest (`*.test.ts` next to the code, e.g. `src/utils/error-message.test.ts`).
- The mock API (`~/Documents/github/im-mock-api`, :4010) streams 300 lines and then one every 700ms, and
  returns 409 for `pending` instances. It ignores `tail` and never ends the stream.

## The design

### Where it lives

- The row's "…" → **Logs** opens a drawer, as now. The **Logs in Grafana** menu item stays as it is, and
  the link also appears in the drawer header. _(Builder check, my call.)_ Logs needs a replica, so a
  component with none running would otherwise lose its only way to Grafana, and that is when its history
  matters most.
- The drawer is about ¾ of the window wide (`min(1200px, 100vw - 64px)` or similar), so the details page
  stays visible on the left. Add a width option (e.g. `size="wide"`) to the shared `Drawer` rather than
  making a second drawer.
- The open-drawer state moves up from the row's menu to `ComponentsTable`, which stores the component name
  and initial replica. The menu unmounts when its replica row disappears (a pod replaced after a crash),
  and the drawer must outlive that.

### Header

- Title: `Logs: <component>` with the component's status dot, as in the component details drawer.
- Description: the selected replica's age and restarts (e.g. "started 2 hours ago · 3 restarts").
- On the right: **Open in Grafana ↗** when `grafanaLogsUrl` gives a URL, then Close.
- Replica and restart details come from the live component props, so they update with the page.

### Source row

- **Replica**: a select listing the component's current replicas, shown only when there is more than one.
  It starts on the replica whose row was used. A component row (single replica) starts on that one.
- **Container**: a select, shown only when the selected replica has more than one container. Same rule as
  today.
- **Lines**: 100 / 1,000 / 5,000, sent as `tail`. The default is 1,000, matching today's behaviour.
  There is **no "All"**. `tail=0` makes the server send the whole log, however large, and the browser has
  to download and decode all of it even if it keeps only the last lines. That is too much for the
  browser and for the server. The Grafana link covers older history.
- Changing any of these restarts the stream and clears the view.
- **When the replica is replaced** _(builder check, my call)_. The drawer stores the component name and
  the chosen replica name, and every request sends that replica. When the chosen replica disappears from
  `component.replicas` (a pod replaced after a crash):
    - The drawer switches to the component's current replica (the first one, if there are several).
    - It keeps the lines on screen.
    - It adds a divider: "dhis2-7f9c4d-xk2lp was replaced · now showing dhis2-7f9c4d-q8w2m".
    - It never sends a replica name that is gone, so the server's 404 "pod not found" can't strand it.

### Tools row

- **Filter lines**: a text box, case-insensitive plain substring (not regex). It hides lines that don't
  match, highlights the matches, and shows "N of M lines". It searches only what has been loaded.
- **Level chips**: All / Warnings / Errors. "Warnings" shows WARN and ERROR, and "Errors" shows only ERROR.
  They combine with the filter.
- On the right:
    - The status: **Live** (green), **Paused** (amber), **Waiting**, **Ended** or **Not connected** (grey).
    - **Pause / Resume**.
    - **Wrap** (a toggle, on by default).
    - **Copy**, which copies the lines currently shown.
    - **Download**, which downloads everything loaded, unfiltered, as `<replica>[-<container>].log`.
    - All buttons have text labels.

### The log

- Monospace 13px on a 20px line, on a very light grey background. Wrapped by default. With wrap off, it
  scrolls sideways inside the log area only.
- ERROR (also FATAL, SEVERE) lines get a light red tint, a 3px red left bar and a bold red level word.
  WARN (also WARNING) lines get the same in amber.
    - A line's level comes from the first level word near its start. This covers DHIS2 (`* ERROR`), the
      mock (`ERROR org...`), Postgres (`ERROR:`, `WARNING:`) and logback/log4j styles.
    - Continuation lines take the level of the line above. These are lines that start with whitespace or
      `at `, or that look like an exception class (`xxx.yyy.SomeException:`, `Caused by:`). This makes a
      stack trace stay red with its ERROR.
    - Lines with no level word are plain. Not every format will be caught, and that's acceptable.
- Following: the view stays at the bottom as lines arrive. Scrolling up more than about 32px pauses (the
  same threshold as today).
- While paused, new lines are still received but held back. A floating **↓ N new lines** button at the
  bottom of the log resumes and jumps to the end. Resume does the same.

### States

These come from the mockup:

- **Connecting**: until the first chunk arrives, a quiet "Connecting…" line, not a large spinner.
- **Waiting** (409): "<component> is still starting up. Logs will appear here as soon as the container
  starts. You don't need to reopen this." It retries on its own while the drawer is open. The waits grow: 4s, 8s, 16s, then every 30s.
- **Stream ends** (the request finishes without being cancelled). _This changes the mockup's "Stream
  ended + Reconnect" state, as my call after the builder check._ There are two reasons a stream ends:
    - The container stopped or restarted.
    - The connection went quiet. im-manager's ingress has `proxy-read-timeout: 300`
      (`helm/chart/values.yaml:113`), so a quiet container such as Postgres gets cut after 5 minutes with
      nothing having restarted.

    So the drawer reconnects by itself after about 2 seconds and keeps every line already on screen:
    - While reconnecting, the status shows **Reconnecting…**.
    - **If the replica restarted** (its restart count went up) or was replaced: a divider goes in, e.g.
      "Container restarted at 10:52", and the new container's log follows it. A crash loop then reads as a
      series of runs separated by dividers. That's the closest thing to "previous container" without a
      backend change.
    - **If nothing restarted** (a quiet cut): the new response repeats the last N lines. Drop the first
      response lines up to and including the last line already held, when it can be found (most lines carry
      a timestamp). If it can't be found, add a plain "Reconnected" divider and accept the duplicates.
    - **If reconnecting gets a 409** (crash-loop backoff): show the Waiting state under the kept lines, and
      keep retrying every 3–5 seconds.
    - **If reconnecting fails three times in a row**: fall to Not connected.

- **Not connected** (any other error): "Couldn't load the log", then the server's reason from
  `errorMessage`, and **Try again**. Any lines already loaded stay above the message.
- **No matches**: when the filter or chips hide everything, show "No lines match" with a way to clear
  them.

### Data and speed

- **Read the stream with `fetch` and a stream reader, not axios progress events** _(builder check, my
  call)_. `XMLHttpRequest.response` holds the whole body for as long as the request is open, so a drawer
  left open for hours grows memory without limit, whatever the line cap.
    - `fetch(`${baseURL}/instances/${id}/logs?…`, { credentials: 'include', signal })`. Auth is cookies,
      as with the axios instance's `withCredentials`.
    - Decode chunks with `TextDecoder` (`stream: true`).
    - Abort with an `AbortController` on cleanup and whenever the source changes.
    - On a 401, call the existing `refreshTokens()` from `use-auth-axios.ts` and retry once. If that fails
      too, dispatch `UNAUTHORIZED_EVENT` as the axios interceptor does.
    - The comments in `log-modal.tsx` about a stable axios config no longer apply.
- Keep lines as an array, not one string:
    1. Split each decoded chunk on `\n`.
    2. Keep the unfinished last piece until the next chunk.
    3. Classify each line's level once, when it arrives.
- **Hard limits on what is held** (go cautious). These are all constants in one place:
    - **At most 10,000 lines** (`MAX_LINES`), dropping the oldest. A stream keeps adding after the first
      5,000, so the cap is what bounds a drawer left open.
    - **At most 4,000,000 characters in total** (`MAX_HELD_CHARS`, about 8 MB in memory). Drop the oldest lines
      until under. This catches logs whose lines are long.
    - **At most 5,000 characters per line** (`MAX_LINE_CHARS`). Longer lines are cut and end with
      `… [N more characters]`. A line that never ends (no newline arriving) is cut the same way once its
      unfinished piece passes the limit, and the rest is thrown away until the next newline. Download contains
      the cut lines, because the full text isn't kept.
    - **When anything has been dropped**, show a note at the top: "Showing the most recent lines only.
      Older lines are in Grafana" (with the link when it is configured).
- **Hard limits on what is drawn:**
    - Draw at most the **2,000** most recent matching lines (`RENDER_LINES`). Above them is a "Show 2,000
      earlier lines" button that adds 2,000 more each time it is pressed, up to what is held. Filter and
      level chips search all held lines and draw at most the same number of matches.
    - Apply new lines at most **every 100ms** (`FLUSH_MS`, a timer rather than `requestAnimationFrame`, which
      stops in a background tab and would let lines pile up). Lines waiting for the next update obey the
      same caps.
    - The filter waits **200ms** after typing stops (the existing `useDebouncedState` hook).
- **Hard limits on retrying**, so a broken instance isn't hammered:
    - A 409 waits 4s, 8s, 16s, then 30s between tries.
    - A stream that ends reconnects after 2s, and the waits grow the same way if it keeps ending.
    - After **10 minutes** with no new line, retrying stops. The drawer shows "Stopped trying after 10
      minutes" with **Try again**.
- Only one log stream is open at a time, because only one drawer can be open. Closing the drawer or
  changing the source aborts the request.
- No library is added. Joe agreed to cap rather than virtualise.
- Put the line parser, level classifier, line cap and overlap-dropping on reconnect in a plain module
  with Jest tests, kept separate from React.

### Mock API

Make the mock good enough to try every state. It lives in Joe's own repo `~/Documents/github/im-mock-api`:

- Honour `tail`.
- Include ERROR lines with stack traces.
- Have some way to make a stream end, e.g. after N lines for one component or replica.
- Have some way to return a 409 after a stream ends, to imitate a crash-loop backoff.
- Have a flood mode for testing the limits: one component sends lines as fast as it can, including a
  single 1 MB line with no newline for a while.

## Left to the builder

- The exact drawer width and how the two control rows wrap on narrow windows.
- Which DHIS2 UI components to use for selects, the chips (e.g. `SegmentedControl`), toggles and the
  filter input.
- Whether to keep `log-modal.tsx` or delete it. Nothing else uses it, so deleting it is expected.
- How to batch React updates as chunks arrive (e.g. per animation frame).
- How to write the CSS for the tint and the bar, and how to handle the colours if a dark theme is ever
  added.
- Copy feedback: an alert or a short "Copied" label.
