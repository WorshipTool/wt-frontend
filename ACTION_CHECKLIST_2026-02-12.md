# ACTION CHECKLIST - CHVALOTCE.CZ PLATFORMA
**Datum:** 12. února 2026
**Priorita:** P0 KRITICKÉ - IMMEDIATE ACTION REQUIRED

---

## ⚡ QUICK WINS (< 1 hodina) - START HERE

### ✅ QW1: Backend TypeScript Upgrade [15 minut]
```bash
cd /workspace/instances/2/wt-backend
npm install --save-dev typescript@^5.0.0 @types/node@^22.0.0
npm run check-types
npm run test:unit
git add package.json package-lock.json
git commit -m "fix: upgrade TypeScript to v5 for Node.js v22 compatibility"
```
**Verifikace:** `npm run check-types` projde bez chyb
**Owner:** Backend developer

---

### ✅ QW2: Fix Invalid @bull-board Dependencies [10 minut]
```bash
cd /workspace/instances/2/wt-backend
rm -rf node_modules package-lock.json
npm install
npm run test:unit
```
**Verifikace:** npm install projde bez warnings o invalid deps
**Owner:** Backend developer

---

### ✅ QW3: Fix Next.js Config Warnings [15 minut]
```javascript
// File: /workspace/instances/2/wt-frontend/next.config.mjs

// BEFORE:
experimental: {
  serverComponentsExternalPackages: [...],
}

// AFTER:
serverExternalPackages: [...],

// REMOVE deprecated middleware reference
```
**Verifikace:** `npm run build` nehlásí warnings
**Owner:** Frontend developer

---

### ✅ QW4: Fix Dependency Version Mismatch [30 minut]
```bash
cd /workspace/instances/2/wt-frontend
npm install @next/third-parties@^14.2.3
npm run build
```
**Verifikace:** package.json version matches installed version
**Owner:** Frontend developer

---

## 🔴 P0 CRITICAL FIXES (2-8 hodin)

### 🔥 P0-1: Fix Frontend Build OOM [2 hodiny]

**Step 1: Increase Node.js Memory**
```bash
cd /workspace/instances/2/wt-frontend
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

**Step 2: Enable Next.js Optimizations**
```javascript
// next.config.mjs
export default {
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    webpackBuildWorker: true,
  },
}
```

**Step 3: Analyze Bundle Size**
```bash
npm run build -- --analyze
# Check for large dependencies that can be dynamically imported
```

**Verifikace:**
- [ ] `npm run build` completes successfully
- [ ] Build time < 5 minutes
- [ ] Bundle size < 3MB

**Owner:** Senior Frontend Developer

---

### 🔥 P0-2: Fix TypeScript Async Params Errors [3 hodiny]

**Affected Files (11x):**
1. `src/hooks/pathname/useServerPathname.tsx:8`
2. `src/tech/auth/getServerUser.ts:7`
3. `src/app/(submodules)/(teams)/sub/tymy/(teampage)/tech/layout.tech.ts:55`
4. + 8 dalších (viz build error log)

**Pattern Fix:**
```typescript
// BEFORE (ERROR):
export function useServerPathname() {
  const pathname = headers().get('x-pathname')
  return pathname
}

// AFTER (FIXED):
export async function useServerPathname() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname')
  return pathname
}

// BEFORE (ERROR):
export default function Page({ params }: { params: { alias: string } }) {
  const { alias } = params
}

// AFTER (FIXED):
export default async function Page({
  params
}: {
  params: Promise<{ alias: string }>
}) {
  const { alias } = await params
}
```

**Checklist:**
- [ ] Fix all 11 async params errors
- [ ] Run `npm run check-types` - 0 errors
- [ ] Test affected pages locally
- [ ] Run E2E tests for affected routes

**Owner:** Frontend Developer

---

### 🔥 P0-3: Fix Security Gaps [1 den = 8 hodin]

#### Security Gap 1: Missing Auth Decorator [30 minut]
```typescript
// File: src/songs/management/pack-setting/pack.setting.controller.ts:10

// BEFORE:
@AllowNonUser() // TODO: add correct auth decorator

// AFTER:
@UseGuards(JwtAuthGuard)
@ApiSecurity('bearer')
```

**Test:**
```bash
curl -X GET http://localhost:3300/api/pack-setting/xxx
# Should return 401 Unauthorized without JWT token
```

---

#### Security Gap 2: Missing User Context in Merge [4 hodiny]
```typescript
// Files:
// - src/songs/management/merging/main/song.merging.service.ts:76,163,332,343

// BEFORE:
async mergeSongs(songIds: string[]) {
  await this.songDbService.createSong(validPacks); // TODO: user
}

// AFTER:
async mergeSongs(songIds: string[], user: UserEntity) {
  if (!user || !user.id) {
    throw new UnauthorizedException('User context required for merge operation')
  }

  // Log audit trail
  await this.auditService.logMerge({
    userId: user.id,
    songIds,
    timestamp: new Date(),
  })

  await this.songDbService.createSong(validPacks, user)
}
```

**Affected Methods (4x):**
1. `mergeSongs()` - line 76
2. `mergeSongFamilies()` - line 163
3. `createMergedSong()` - line 332
4. `updateMergedSong()` - line 343

**Tests:**
- [ ] Add unit test for merge without user context (should throw)
- [ ] Add integration test for merge with valid user
- [ ] Verify audit log entries created

---

#### Security Gap 3: Missing Playlist Permissions [2 hodiny]
```typescript
// File: src/playlists/editing/playlist.editing.service.ts:77,152

// BEFORE:
async editPlaylist(playlistId: string, data: EditDto) {
  // TODO - permissions
  await this.playlistDb.update(playlistId, data)
}

// AFTER:
async editPlaylist(playlistId: string, data: EditDto, user: UserEntity) {
  const playlist = await this.playlistDb.findOne(playlistId)

  // Check ownership or team membership
  const canEdit = await this.permissionService.canEditPlaylist(user, playlist)
  if (!canEdit) {
    throw new ForbiddenException(
      `User ${user.id} cannot edit playlist ${playlistId}`
    )
  }

  await this.playlistDb.update(playlistId, data)
}
```

**Affected Methods (2x):**
1. `editPlaylist()` - line 77
2. `deletePlaylistSong()` - line 152

**Tests:**
- [ ] Test edit by owner (should succeed)
- [ ] Test edit by non-owner (should throw ForbiddenException)
- [ ] Test edit by team member (should succeed if team playlist)

---

#### Security Gap 4: Audit Log Implementation [1.5 hodiny]
```typescript
// Create new service: src/audit/audit.service.ts

@Injectable()
export class AuditService {
  async logMerge(data: {
    userId: string
    songIds: string[]
    timestamp: Date
  }) {
    await this.auditDb.create({
      action: 'SONG_MERGE',
      userId: data.userId,
      metadata: { songIds: data.songIds },
      timestamp: data.timestamp,
    })
  }

  async logPlaylistEdit(data: {
    userId: string
    playlistId: string
    changes: object
  }) {
    // Similar implementation
  }
}
```

**Verifikace:**
- [ ] All 6 security gaps fixed
- [ ] All new tests passing
- [ ] Manual security review completed
- [ ] Audit logs working

**Owner:** Backend Security Lead + Senior Backend Developer

---

## ⚠️ P1 HIGH PRIORITY (DO 1 TÝDNE)

### P1-1: Merge Critical Security Patches [8 hodin]

**Process:**
```bash
# 1. List all security branches
cd /workspace/instances/2/wt-frontend
git branch -r | grep -E "snyk-upgrade|snyk-fix" | wc -l
# Expected: ~45 branches

cd /workspace/instances/2/wt-backend
git branch -r | grep -E "snyk-upgrade|snyk-fix" | wc -l
# Expected: ~66 branches

# 2. Prioritize by severity (check PR descriptions)
# HIGH severity first, then MEDIUM, then LOW

# 3. Batch merge compatible patches
git checkout develop
git merge origin/snyk-upgrade-XXXXX --no-ff -m "security: merge Snyk patch XXXXX"
npm test
git push

# 4. Repeat for all HIGH severity patches
```

**Checklist:**
- [ ] Frontend: Merge all HIGH severity patches (~15 patches)
- [ ] Backend: Merge all HIGH severity patches (~20 patches)
- [ ] Run full test suite after each batch
- [ ] Deploy to staging for verification
- [ ] Setup Dependabot auto-merge for future patches

**Owner:** DevOps Lead + Team Lead

---

### P1-2: Improve Test Coverage - Phase 1 [1 den]

**Critical Paths to Test:**

#### Frontend:
```typescript
// 1. Auth flows (2 hodiny)
describe('Login Flow', () => {
  it('should login with valid credentials')
  it('should show error with invalid credentials')
  it('should redirect to home after login')
})

// 2. Search functionality (2 hodiny)
describe('Song Search', () => {
  it('should display results for valid query')
  it('should show empty state for no results')
  it('should sort by popularity')
})

// 3. Playlist editing (2 hodiny)
describe('Playlist Edit', () => {
  it('should add song to playlist')
  it('should remove song from playlist')
  it('should reorder songs')
})
```

#### Backend:
```typescript
// 1. Security tests (2 hodiny)
describe('Playlist Edit Permissions', () => {
  it('should allow owner to edit')
  it('should deny non-owner to edit')
  it('should allow team member to edit team playlist')
})
```

**Target:** Increase coverage 1% → 15% (frontend), 40% → 60% (backend)

**Owner:** QA Engineer + Frontend/Backend Teams

---

## 📊 PROGRESS TRACKING

### Daily Standup Checklist

**Day 1 (Dnes):**
- [ ] QW1: Backend TypeScript upgrade ✅
- [ ] QW2: Fix @bull-board deps ✅
- [ ] QW3: Fix Next.js warnings ✅
- [ ] P0-1: Frontend build fix (in progress)
- [ ] P0-2: Async params fixes (started)

**Day 2 (Zítra):**
- [ ] P0-2: Complete async params fixes ✅
- [ ] P0-3: Security gaps fix (6/6 completed)
- [ ] Test all P0 fixes ✅
- [ ] Create PR for Task 84uuEVsJ ✅

**Day 3-5 (Tento týden):**
- [ ] P1-1: Merge 111 security patches (50% done)
- [ ] P1-2: Test coverage Phase 1 (50% done)
- [ ] Deploy all fixes to production ✅

---

## 🎯 SUCCESS CRITERIA

### Week 1 Success (by 19.2.2026):
- ✅ 0 P0 issues remaining
- ✅ Frontend build succeeds
- ✅ Backend TypeScript compiles
- ✅ 0 TypeScript errors
- ✅ All security gaps closed
- ✅ Task 84uuEVsJ merged to production
- ✅ >50 security patches merged

### Metrics to Track:
```bash
# TypeScript errors
npm run check-types | grep "error TS"
# Target: 0 errors

# Build success
npm run build
# Target: Exit code 0

# Test coverage
npm run test:cov
# Target: >15% frontend, >60% backend

# Security patches
git branch -r | grep -E "snyk|dependabot" | wc -l
# Target: <60 (from 111)
```

---

## 🚨 ESCALATION PATH

**If Blocked:**
1. **Technical Blocker:** Ping Tech Lead immediately
2. **Resource Constraint:** Escalate to Project Manager
3. **External Dependency:** Coordinate with DevOps

**Emergency Contact:**
- Tech Lead: [TBD]
- DevOps: [TBD]
- Security: [TBD]

---

## 📝 NOTES

- Všechny fixy by měly mít unit testy
- Každý commit by měl být atomic a revertable
- Deploy pouze po passing CI/CD
- Komunikovat v team Slack channel při blockerech

---

**Last Updated:** 12. února 2026
**Next Review:** Daily standup
**Document Owner:** Development Team
