# Project Architecture

## 📁 Directory Structure

```
datapeserta/
├── app/
│   ├── components/        # ✨ NEW: Reusable UI components
│   │   ├── admin/        # Admin-specific components
│   │   └── display/      # Display page components
│   ├── hooks/            # ✨ NEW: Custom React hooks
│   │   └── useAuth.ts
│   ├── utils/            # ✨ NEW: Utility functions
│   │   └── date.ts
│   ├── types/            # ✨ NEW: TypeScript type definitions
│   │   └── index.ts
│   ├── contexts/         # React contexts
│   ├── admin/            # Admin pages
│   ├── api/              # API routes
│   ├── display/          # TV display page
│   └── form/             # Guest form pages
├── lib/                  # Server-side utilities
│   ├── auth.ts
│   ├── prisma.ts
│   ├── r2.ts
│   ├── security.ts
│   └── hcaptcha.ts
└── prisma/              # Database schema

```

## 🎯 Design Principles

### 1. Separation of Concerns
- **Components**: UI rendering only
- **Hooks**: State management and side effects
- **Utils**: Pure functions
- **Types**: Type definitions
- **API**: Server-side logic

### 2. File Size Limits
- Components: **< 150 lines**
- Pages: **< 300 lines** (with extracted components)
- Utils: **< 200 lines**
- Hooks: **< 100 lines**

### 3. Import Conventions
```typescript
// Types
import { BukuTamu, User } from '@/app/types';

// Utils
import { formatDate, formatTime } from '@/app/utils/date';

// Hooks
import { useAuth } from '@/app/hooks/useAuth';

// Components
import { GuestCard } from '@/app/components/display/GuestCard';
```

## 🔄 Data Flow

```
User Action → Component → Hook → API Route → Database
                ↓           ↓
              Utils      Context
```

## 📦 Component Guidelines

### Reusable Components
Location: `app/components/`
- Small, focused components
- Accept props for configuration
- No business logic
- Export as named exports

### Page Components
Location: `app/[feature]/page.tsx`
- Compose reusable components
- Handle business logic
- Manage local state
- Connect to hooks/context

## 🎨 Code Style

### Components
```typescript
// ✅ Good
export function GuestCard({ guest, onEdit }: Props) {
  return <div>...</div>;
}

// ❌ Bad
export default function Component() { ... }
```

### Hooks
```typescript
// ✅ Good
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, loading, logout };
}
```

### Utils
```typescript
// ✅ Good
export const formatDate = (date: string): string => {
  // ...
};
```

## 🚀 Performance Optimizations

1. **Memoization**: Use `useCallback` for stable functions
2. **Caching**: In-memory cache for API responses
3. **Debouncing**: Search inputs (500ms)
4. **Skip queries**: Optional pagination counts
5. **Lazy loading**: Components and images

## 📝 Best Practices

- ✅ Use TypeScript types from `@/app/types`
- ✅ Extract reusable logic to hooks
- ✅ Keep components under 150 lines
- ✅ Use named exports
- ✅ Add prop interfaces
- ✅ Document complex logic
- ❌ No inline styles (use Tailwind)
- ❌ No prop drilling (use context)
- ❌ No duplicate code
