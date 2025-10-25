# Components Structure

This directory contains reusable React components organized by feature.

## Directory Structure

```
components/
├── admin/          # Admin dashboard components
│   ├── SearchBar.tsx
│   └── Pagination.tsx
├── display/        # Display page (TV) components
│   ├── Clock.tsx
│   ├── DatePicker.tsx
│   ├── GuestCard.tsx
│   └── PhotoModal.tsx
└── README.md
```

## Usage Guidelines

### Import Pattern
```typescript
import { GuestCard } from '@/app/components/display/GuestCard';
import { SearchBar } from '@/app/components/admin/SearchBar';
```

### Component Responsibilities
- **Keep components small** (< 150 lines)
- **Single responsibility** principle
- **Reusable** across multiple pages
- **Props-based** configuration

## Adding New Components

1. Create component file in appropriate subfolder
2. Export as named export
3. Add TypeScript interfaces for props
4. Keep business logic in parent components
5. Focus on UI rendering only
