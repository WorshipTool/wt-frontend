# E2E Testing Guide

## Overview

This directory contains end-to-end tests for the WorshipTool application using Playwright.

## Test Structure

```
tests/e2e/
├── helpers/               # Reusable test helpers
│   ├── auth.helper.ts    # Authentication utilities
│   └── selectors.helper.ts  # Centralized element selectors
├── pages/                # Page-specific tests
│   ├── playlist/         # Playlist-related tests
│   ├── songs/            # Song-related tests
│   └── teams/            # Team-related tests
├── setup.ts              # Test setup and configuration
└── *.spec.ts             # Test specification files
```

## Running Tests

### Test Suites

Tests are organized into three suites based on importance:

- **Smoke** (`@smoke`): Critical user flows, runs fastest
- **Critical** (`@critical`): Important features
- **Full** (`@full`): Comprehensive test coverage

### Run Commands

```bash
# Run smoke tests (fastest, core functionality)
npm run test:e2e:smoke

# Run critical tests (smoke + critical)
npm run test:e2e:critical

# Run all tests (smoke + critical + full)
npm run test:e2e:full
```

### Local Development

```bash
# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test search.spec.ts

# Run tests with UI mode (interactive debugging)
npx playwright test --ui

# Debug a specific test
npx playwright test --debug search.spec.ts
```

## Writing Tests

### Best Practices

#### 1. Use Helpers

```typescript
import { loginViaUI } from './helpers/auth.helper'
import { selectors } from './helpers/selectors.helper'

smartTest('My test', 'critical', async ({ page }) => {
  const sel = selectors(page)
  await loginViaUI(page)
  await sel.getSearchInput().fill('test')
})
```

#### 2. Use Deterministic Waits

**Good:**
```typescript
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible()
await page.waitForURL(/\/success/, { timeout: 10000 })
```

**Bad:**
```typescript
await page.waitForTimeout(3000)  // Avoid arbitrary timeouts
```

#### 3. Prefer Role-Based Selectors

**Good:**
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
```

**Bad:**
```typescript
page.locator('.submit-btn')  // Brittle CSS class
```

## Debugging Failing Tests

### View Test Artifacts

```bash
# Open HTML report
npx playwright show-report
```

### Run in Debug Mode

```bash
npx playwright test --debug search.spec.ts
```

## CI/CD Integration

The playwright.config.ts automatically adapts for CI:
- More retries (2 vs 1)
- Screenshots/videos on all tests
- Reduced workers for stability
