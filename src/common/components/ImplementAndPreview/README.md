# ImplementAndPreview

AI-powered idea implementation and preview deployment management for the frontend.

## Overview

This module provides two modes of operation:

- **Normal mode** — Admins can submit ideas to the AI implementation webhook, view recent tasks and their statuses, and see preview/PR links for completed tasks.
- **Preview mode** — When the app is deployed as a PR preview, all users see an animated banner chip. Admins can open a dialog to submit follow-up changes and view the task chain history.

## Components

### `ImplementIdeaProvider`

Top-level provider mounted in `layout.tsx`. Handles:

- Routing between normal and preview mode
- Version change detection (polls `/api/build-id` every 60s, shows reload snackbar when build hash changes)
- Admin option menu entry (normal mode)

### `ImplementIdeaDialog`

Dialog for normal (non-preview) mode:

- **Submit tab** — Text input to describe an idea, POSTs to `NEXT_PUBLIC_IMPLEMENT_IDEA_URL`
- **Recent ideas tab** — Lists tasks from the API with status chips, PR links, and preview links
- Chain deduplication: shows one entry per `chainId` (oldest task's title, newest task's status)
- Inherits PR links from newer tasks when the oldest task has none
- Auto-detects merged PRs via GitHub API
- Polls for task updates every 30s

### `PreviewModeBanner`

Fixed-position animated chip (bottom-left corner) visible to all users in preview mode:

- Shows PR title or number
- Admins click to open `PreviewModeDialog`
- Non-admins see a tooltip
- Slide-in animation + continuous subtle pulse

### `PreviewModeDialog`

Dialog for preview mode (admins only):

- **Update section** — Text input to describe a follow-up change, POSTs to the webhook with `continueInPRNumber`
- **History section** — Shows all tasks in the current chain with status, duration, timestamps
- Animated busy indicator when a task is running/queued (blocks new submissions)
- Auto-polls every 15s
- Matches the current PR to a task chain via `findPreviewContext()`
- PR link button in header when a matching PR is found

### `shared.ts`

Shared constants, types, and utilities used across components:

- Color constants (`BLUE`, `BLUE_DARK`, `PURPLE`, `PURPLE_DARK`)
- `TaskStatus` type, `PullRequest` type
- `STATUS_STYLE` map for status chip colors
- `extractPrNumber()` utility
- `bgMove` keyframes animation for dialog backgrounds

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_IMPLEMENT_IDEA_URL` | Webhook URL for submitting ideas and fetching tasks (GET/POST) |
| `NEXT_PUBLIC_PREVIEW_BASE_URL` | Base URL for preview deployments (e.g. `https://preview.chvalotce.cz`) — used to generate preview links as `{base}/pr-{number}` |
| `NEXT_PUBLIC_PREVIEW_MODE` | Set to `"true"` to enable preview mode |
| `NEXT_PUBLIC_PREVIEW_PR_NUMBER` | PR number for the current preview deployment |
| `NEXT_PUBLIC_PREVIEW_PR_TITLE` | PR title displayed in the banner |
| `NEXT_PUBLIC_BUILD_HASH` | Auto-generated at build time for version detection |

## Translation Keys

Translations are in the `previewMode` and `implementIdea` namespaces across all 3 locales (`chvalotce.json`, `chwalmy.json`, `hallelujahhub.json`).

## API Contract

**GET** `NEXT_PUBLIC_IMPLEMENT_IDEA_URL` — Returns `{ tasks: Task[] }` where each task has:

```ts
{
  taskId: string
  status: 'queued' | 'starting' | 'running' | 'retrying' | 'completed' | 'failed' | 'interrupted'
  prompt: string
  title?: string
  parentTaskId: string | null
  chainId: string
  startedAt: string
  completedAt: string | null
  pullRequests: { repo: string; url: string }[] | null
  previewUrl?: string
}
```

**POST** `NEXT_PUBLIC_IMPLEMENT_IDEA_URL` — Submits a new idea or follow-up change:

```json
{ "message": "...", "continueInPRNumber": 42 }
```

`continueInPRNumber` is only sent in preview mode to continue the existing task chain.
