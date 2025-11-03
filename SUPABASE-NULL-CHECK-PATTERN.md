# Supabase Null Check Pattern

Add this at the start of any function that uses supabase:

```typescript
if (!supabase) {
  console.error('Supabase client not available');
  // Handle appropriately (setLoading(false), return, etc.)
  return;
}
```

## Files Fixed:
- ✅ src/app/(auth)/login/page.tsx
- ✅ src/app/(auth)/register/page.tsx
- ✅ src/app/admin/dashboard/page.tsx
- ✅ src/app/student/subscription/page.tsx
- ✅ src/hooks/useAuth.ts

## Files Still Need Fixing:
- src/app/parent/dashboard/page.tsx
- src/app/student/assignments/[id]/page.tsx
- src/app/student/dashboard/page.tsx
- src/app/student/payment/page.tsx
- src/app/student/videos/[id]/page.tsx
- src/app/student/videos/page.tsx
- src/app/teacher/assignments/create/page.tsx
- src/app/teacher/dashboard/page.tsx
- src/app/teacher/sessions/create/page.tsx
- src/components/SubscriptionAlert.tsx
