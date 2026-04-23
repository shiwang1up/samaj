# Samaj — Architecture & Coding Standards

> **Purpose**: This document is the single authoritative reference for how every feature in this codebase should be structured. Read this before writing any new screen, hook, service, or component.

---

## 1. Project Structure

```
samaj/
├── app/                    # Expo Router screens (UI only, zero business logic)
│   └── (tabs)/
├── components/             # Reusable, stateless UI components
│   └── feed/
├── constants/
│   ├── Config.ts           # API base URLs, host config
│   └── unistyles.ts        # Design system — THE SINGLE SOURCE OF TRUTH for all UI tokens
├── context/
│   └── AuthContext.tsx     # Global auth state (token + session)
├── hooks/                  # Thin orchestration layer — state + calling services
├── services/               # API layer — one folder per domain
│   ├── auth/
│   │   ├── IAuthService.ts
│   │   └── AuthService.ts
│   ├── user/
│   │   ├── IUserService.ts
│   │   └── UserService.ts
│   └── storage/
│       ├── IStorageService.ts
│       └── SecureStorageService.ts
└── types/                  # Shared TypeScript types (non-service-specific)
```

---

## 2. SOLID Principles — How We Apply Them

### S — Single Responsibility Principle
Each file owns **exactly one concern**:

| Layer | Responsibility |
|---|---|
| **Screen** (`app/`) | Compose UI + wire hook. Zero business logic. |
| **Hook** (`hooks/`) | Manage async state (loading / error / data). Call one service. |
| **Service** (`services/`) | Make HTTP calls for one domain. Return typed responses. |
| **Interface** (`I*.ts`) | Define the contract. No implementation. |
| **Component** (`components/`) | Render UI from props. No API calls. |

### O — Open / Closed Principle
- Add a new API method to a service by **adding** to the class — don't modify existing methods.
- Add a new status badge type by **extending** `STATUS_CONFIG` — don't modify `StatusBadge`.
- Add new theme tokens to `unistyles.ts` under their existing category group.

### L — Liskov Substitution Principle
- Every concrete service (`AuthService`, `UserService`) must fully satisfy its interface.
- Any mock that satisfies `IUserService` must be droppable into any hook or test without breaking anything.

### I — Interface Segregation Principle
- Keep interfaces small and role-focused (`IUserService` only knows about user API calls).
- Don't merge unrelated methods into one interface.

### D — Dependency Inversion Principle
- **Screens** instantiate the concrete service **once** (composition root) and inject it into hooks.
- **Hooks** depend only on the **interface**, never the concrete class.
- **AuthContext** is accessed via `useAuth()` — hooks never import `AuthContext` directly.

---

## 3. Service Layer Pattern

Every domain gets a folder under `services/` with two files:

### `I{Domain}Service.ts` — the contract
```typescript
export interface User { ... }               // DTOs live here
export interface UserSearchResponse { ... }

export interface IUserService {
  searchUsers(query: string, token: string): Promise<UserSearchResponse>;
}
```

### `{Domain}Service.ts` — the implementation
```typescript
export class UserService implements IUserService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = Config.USER_API_BASE_URL;   // always from Config
  }

  async searchUsers(query: string, token: string): Promise<UserSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,      // always send token for protected routes
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Failed: ${response.status}`);
    return data;
  }
}
```

**Rules:**
- Always use `Config.*` for base URLs — never hardcode.
- Always check `!response.ok` and throw with the server message.
- Log with a qualified prefix: `console.error('UserService.searchUsers:', error)`.
- `encodeURIComponent()` all path params.
- Auth token always comes in as a parameter — the service never reads storage directly.

---

## 4. Hook Layer Pattern

Hooks are the **orchestration** layer — they call one service and manage async state.

```typescript
/**
 * useSearchUsers
 *
 * SRP: only manages the search-users async flow.
 * DIP: depends on IUserService interface, injected by the screen.
 */
export const useSearchUsers = (userService: IUserService) => {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string, token: string) => {
    if (!query.trim()) { setUsers([]); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await userService.searchUsers(query, token);
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message ?? 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userService]);

  return { users, loading, error, searchUsers };
};
```

**Rules:**
- Hook receives its **service via parameter** (DIP) — never `new UserService()` inside a hook.
- Hook receives **token as a call-time argument** — it does not call `useAuth()` itself.
- Always `setError(null)` before each attempt.
- Always use `finally` to clear loading state.
- One hook, one domain.

---

## 5. Screen (Composition Root) Pattern

Screens are the **only** place where concrete classes are instantiated.

```typescript
// ── Composition root — stable instance per screen mount ───────
const userService = new UserService();   // module-level, outside component

export default function SearchScreen() {
    const { token } = useAuth();   // token from context, not storage
    const { searchUsers, users, loading, error } = useSearchUsers(userService);
    // ...UI only below this line
}
```

**Rules:**
- Instantiate service **outside** the component function (module-level) — stable across re-renders.
- Get token from `useAuth()` — never import `SecureStorageService` in a screen.
- No `fetch()`, `axios`, or business logic in screens.
- No `try/catch` in screens — that belongs in hooks.

---

## 6. Design System — `constants/unistyles.ts`

This file is the **single source of truth** for all UI tokens. Never use ad-hoc values in `StyleSheet`.

### Token Reference

| Category | Access pattern | Example value |
|---|---|---|
| Colors | `theme.colors.*` | `theme.colors.on_surface` |
| Surface tiers | `theme.colors.surface_container_*` | `theme.colors.surface_container_low` |
| Spacing | `theme.spacing.*` | `theme.spacing.lg` → 20dp |
| Border radius | `theme.radius.*` | `theme.radius['2xl']` → 16dp |
| Type sizes | `theme.typography.sizes.*` | `theme.typography.sizes.headline_lg` → 32sp |
| Font families | `theme.typography.fonts.*` | `theme.typography.fonts.display` → `"Manrope"` |
| Font weights | `theme.typography.weights.*` | `theme.typography.weights.bold` → `"700"` |
| Elevation | `theme.elevation[n]` | `...theme.elevation[1]` |
| Ghost border | `theme.ghostBorder` | `...theme.ghostBorder` |
| Gradients | `theme.gradients.*` | `theme.gradients.primary` |
| Glass | `theme.glass.*` | `theme.glass.nav` |
| Motion | `theme.motion.*` | `theme.motion.standardDuration` |

### Typography Fonts
- **`Manrope`** → `theme.typography.fonts.display` — Headings, titles, card names, numbers
- **`PublicSans`** → `theme.typography.fonts.body` — Body text, labels, handles, descriptions

### Surface Hierarchy (low nesting → high nesting)
```
background                          ← page canvas
└── surface_container_low           ← search bars, input fields
    └── surface_container           ← section backgrounds
        └── surface_container_high  ← selected / active items
            └── surface_container_lowest  ← cards sitting on containers
```

### Spacing Scale (4dp base unit)
| Token | Value |
|---|---|
| `spacing.xs` | 4dp |
| `spacing.sm` | 8dp |
| `spacing.md` | 12dp |
| `spacing.base` | 16dp |
| `spacing.lg` | 20dp |
| `spacing.xl` | 24dp |
| `spacing['2xl']` | 32dp |
| `spacing['3xl']` | 40dp |
| `spacing['4xl']` | 48dp |
| `spacing['5xl']` | 64dp |

### Ghost Border Rule
All elevated surfaces get a ghost border (felt, not seen):
```typescript
borderWidth: theme.ghostBorder.borderWidth,   // 1
borderColor: theme.ghostBorder.borderColor,   // rgba(192, 201, 193, 0.15)
```

### Card Padding Rule (Trust Doc §5)
Asymmetric padding on list items — more left than right:
```typescript
paddingLeft:  theme.spacing.xl,    // 24
paddingRight: theme.spacing.base,  // 16
```

### What to NEVER do
```typescript
// ❌ Wrong — ad-hoc values break theming and dark mode
style={{ fontSize: 32, color: '#333', borderRadius: 14, padding: 20 }}

// ✅ Correct — all values from the design system
style={{
  fontSize: theme.typography.sizes.headline_lg,
  color: theme.colors.on_surface,
  borderRadius: theme.radius['2xl'],
  padding: theme.spacing.lg,
}}
```

---

## 7. Config Pattern

All environment-specific values live in `constants/Config.ts`:

```typescript
const HOST = '192.168.29.117';
const API_BASE_URL      = `http://${HOST}:4000/api/auth`;
const USER_API_BASE_URL = `http://${HOST}:4000/api/user`;

export const Config = { API_BASE_URL, USER_API_BASE_URL, HOST };
```

**To add a new domain:**
1. Add `const MY_API_BASE_URL = ...` in `Config.ts`
2. Export it from `Config`
3. Use it in your new service constructor

---

## 8. Adding a New Feature — Checklist

```
[ ] Create services/myDomain/IMyDomainService.ts  — interface + DTOs
[ ] Create services/myDomain/MyDomainService.ts   — HTTP implementation
[ ] Add base URL to constants/Config.ts if needed
[ ] Create hooks/useMyFeature.ts                  — inject IMyDomainService, manage state
[ ] Create app/.../myScreen.tsx                   — composition root + UI only
[ ] All styles use theme.* tokens — no ad-hoc values
[ ] Service sends Authorization header for protected endpoints
[ ] Hook uses finally to clear loading state
[ ] Service logs with qualified prefix: ClassName.methodName
```
