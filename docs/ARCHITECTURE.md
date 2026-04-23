# Samaj — Architecture & AI Coding Guidelines

> **Purpose**: This document serves as the system prompt and authoritative reference for AI agents and human developers working on the Samaj codebase. 

---

# PART 1: INSTRUCTIONS FOR AI AGENTS

**CRITICAL DIRECTIVE:** Before writing or modifying any code, read this section to understand the architectural boundaries. You must strictly adhere to the patterns laid out in Part 2. Do not invent new patterns. Do not bypass established layers.

## 1. File Reference Mapping
When you need to perform a task, use these specific files as your reference for the correct pattern:

| To implement this... | Read this file as your reference model... |
|---|---|
| A new **UI Screen** | `app/(tabs)/messages.tsx` (complex form) or `app/(tabs)/index.tsx` (feed) |
| A new **Hook** | `hooks/usePosts.ts` (fetch) or `hooks/useCreatePost.ts` (submit) |
| A new **API Service** | `services/post/PostService.ts` |
| **API Error Handling** | `services/http/apiClient.ts` |
| **Styling & Tokens** | `constants/unistyles.ts` |
| **Optimistic Updates** | `app/(tabs)/index.tsx` (parent state) and `components/feed/CommentsBottomSheet.tsx` (nested state) |

## 2. Hard Constraints & Prohibitions

> [!CAUTION]
> **THESE ARE NON-NEGOTIABLE:**
> 1. **No `fetch()`:** Never use `fetch()`, `XMLHttpRequest`, or raw `axios` in any service. Always import `{ apiClient }` from `services/http/apiClient`. React Native's fetch polyfill crashes on iOS with Blob deallocation errors.
> 2. **No arbitrary colors/spacing:** Never hardcode colors (`#FFF`), spacing (`margin: 10`), or fonts. You must use `theme.colors.*`, `theme.spacing.*`, etc., from `unistyles.ts`.
> 3. **No manual Authorization headers:** The `apiClient` interceptor handles token injection automatically. Do not pass or set tokens in service method implementations.
> 4. **No UI state in services:** Services only handle HTTP and DTO mapping. State belongs in hooks.
> 5. **No business logic in screens:** Screens only compose UI and call hooks. All async logic, try/catch, and state management belongs in hooks.

## 3. Workflow Checklist for AI
When asked to add a new feature that connects to the backend, complete these steps exactly in this order:

1. **Contract:** Create `services/{domain}/I{Domain}Service.ts` (Interface + DTOs).
2. **Implementation:** Create `services/{domain}/{Domain}Service.ts` using `apiClient`.
3. **Config:** Add base URL to `constants/Config.ts` if a new domain endpoint is required.
4. **Hook:** Create `hooks/use{Feature}.ts`. Inject the service interface via parameter. Manage loading/error/data state here.
5. **Screen:** Create `app/.../screen.tsx`. Instantiate the service interface at the **module level** (outside the component). Inject it into the hook. Compose the UI using Sentinel design tokens.

---

# PART 2: ARCHITECTURE & PATTERNS

## 1. Project Structure

```
samaj/
├── app/                    # Expo Router screens (UI only, zero business logic)
│   └── (tabs)/
├── components/             # Reusable, stateless UI components
│   ├── common/
│   └── feed/
├── constants/
│   ├── Config.ts           # API base URL, HOST — only place for env-specific values
│   └── unistyles.ts        # Sentinel Design System — single source of truth for all UI tokens
├── context/
│   └── AuthContext.tsx     # Global auth state (token + session lifecycle)
├── hooks/                  # Thin orchestration layer — state + calling services
├── services/               # API layer — one folder per domain
│   ├── http/
│   │   └── apiClient.ts    # Axios instance + interceptors (token injection, ApiError)
│   ├── auth/
│   ├── post/
│   └── comment/
└── docs/
    └── ARCHITECTURE.md     # ← you are here
```

---

## 2. SOLID Principles

### S — Single Responsibility
| Layer | Responsibility |
|---|---|
| **Screen** | Compose UI + wire hook. Zero business logic. |
| **Hook** | Manage async state (loading/error/data). Call one service. |
| **Service** | Make HTTP calls for one domain. Return typed responses. |
| **Interface** | Define the contract. No implementation. |
| **Component** | Render UI from props. No API calls. |

### D — Dependency Inversion
- **Screens** instantiate the concrete service **once** (composition root) and inject it into hooks.
- **Hooks** depend only on the **interface**, never the concrete class.

---

## 3. Networking — `apiClient`

All HTTP calls go through **`services/http/apiClient.ts`** — a pre-configured Axios instance.

```typescript
// Request interceptor — injects Bearer token automatically
apiClient.interceptors.request.use(async (config) => { ... });

// Response interceptor — normalises errors into ApiError
apiClient.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(new ApiError(message, status))
);
```

### ApiError
```typescript
export class ApiError extends Error {
    constructor(message: string, public readonly status: number) { super(message); }
}
```

---

## 4. Service Layer Pattern

Every domain gets a folder under `services/` with two files.

### `I{Domain}Service.ts` — the contract
```typescript
// DTOs + interface live together
export interface Post { _id: string; caption: string; likes: string[]; }
export interface PostsResponse { posts: Post[]; }

export interface IPostService {
    getAllPosts(): Promise<PostsResponse>;
    likePost(postId: string): Promise<void>;
}
```

### `{Domain}Service.ts` — the implementation
```typescript
export class PostService implements IPostService {
    async getAllPosts(): Promise<PostsResponse> {
        const { data } = await apiClient.get<PostsResponse>('/post/all');
        return data;
    }

    async likePost(postId: string): Promise<void> {
        try {
            await apiClient.post(`/post/like/${postId}`);
        } catch (error: any) {
            // 409 (Conflict): swallow silently — optimistic state was already correct.
            if (error instanceof ApiError && error.status === 409) return; 
            throw error;
        }
    }
}
```

---

## 5. Multipart / Image Upload Pattern

Use `FormData` + `apiClient.post` with `Content-Type: multipart/form-data`:

```typescript
async createPost({ userId, caption, images }: CreatePostPayload): Promise<Post> {
    const formData = new FormData();
    if (caption.trim()) formData.append('caption', caption.trim());
    images.forEach((img) => {
        // RN requires the { uri, name, type } shape cast to `any`
        formData.append('images', { uri: img.uri, name: img.name, type: img.type } as any);
    });
    const { data } = await apiClient.post<{ message: string; post: Post }>(
        `/post/create/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.post;
}
```

---

## 6. Hook Layer Pattern

Hooks are the **orchestration** layer — they call one service and manage async state.

### Standard fetch hook
```typescript
export const usePosts = (postService: IPostService) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const { posts } = await postService.getAllPosts();
            setPosts(posts);
        } catch (err: any) {
            setError(err.message ?? 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [postService]);

    // Expose setPosts for optimistic updates
    return { posts, setPosts, loading, error, refetch: fetch };
};
```

---

## 7. Screen (Composition Root) Pattern

Screens are the **only** place where concrete classes are instantiated.

```typescript
// ── Composition root — module-level, stable across re-renders ──
const postService = new PostService();

export default function FeedScreen() {
    const { token } = useAuth();   // JWT from context only
    const { posts, setPosts, loading, refetch } = usePosts(postService);
    // ...UI only below this line
}
```

---

## 8. Media Picker Pattern (`expo-image-picker`)

```typescript
const handlePickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required');

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4 - images.length,   // respect current count
        quality: 0.85,
    });

    if (result.canceled) return;
    
    // Map assets correctly
    const picked: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        previewUri: asset.uri,
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
    }));
    addImages(picked);
}, [images.length, addImages]);
```

---

## 9. Design System — `constants/unistyles.ts`

This file is the **single source of truth**. Never use ad-hoc values in `StyleSheet`.

### Token Reference
| Category | Access pattern | Example |
|---|---|---|
| Colors | `theme.colors.*` | `theme.colors.on_surface` |
| Spacing | `theme.spacing.*` | `theme.spacing.lg` → 20dp |
| Radius | `theme.radius.*` | `theme.radius['2xl']` → 16dp |
| Fonts | `theme.typography.fonts.*` | `theme.typography.fonts.display` |
| Ghost border | `theme.ghostBorder` | `...theme.ghostBorder` |

### What to NEVER do
```typescript
// ❌ Wrong — ad-hoc values break theming and dark mode
style={{ fontSize: 32, color: '#333', borderRadius: 14 }}

// ✅ Correct — all values from the design system
style={{
    fontSize: theme.typography.sizes.headline_lg,
    color: theme.colors.on_surface,
    borderRadius: theme.radius['2xl'],
}}
```

---

## 10. Optimistic Update Pattern

For write operations that affect visible counts (votes, likes), update UI before the API call:

```typescript
const handleUpvote = useCallback(async (postId: string, isLiked: boolean) => {
    setPosts((prev) => prev.map((p) => {
        if (p._id !== postId) return p;
        return {
            ...p,
            likes: isLiked ? p.likes.filter(id => id !== currentUserId) : [...p.likes, currentUserId],
        };
    }));
    try {
        if (isLiked) await postService.dislikePost(postId);
        else         await postService.likePost(postId);
    } catch {
        refetch(); // revert to server truth on any real error
    }
}, [currentUserId, refetch, setPosts]);
```

**Handling nested optimistic updates** (e.g. reply likes): the inner component (e.g. `CommentRow`) owns the sub-list state and handles its own optimistic update. The parent only provides the API callback.

---

## 11. API Response Envelope & Array Handling

Always defensively unwrap responses map and length operations:

```typescript
// Backend returns { replies: [...] }  NOT  [...]
async getReplies(commentId: string): Promise<CommentReply[]> {
    const { data } = await apiClient.get(`/comment/replies/${commentId}`);
    // Unwrap envelope, fall back if plain array
    return Array.isArray(data) ? data : (data.replies ?? []);
}

// ❌ Unsafe UI — crashes if backend omits the field
const [items, setItems] = useState<Item[]>(raw ?? []);

// ✅ Safe UI
const [items, setItems] = useState<Item[]>(Array.isArray(raw) ? raw : []);
```
