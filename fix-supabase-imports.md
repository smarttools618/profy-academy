# Files that need Supabase null checks

All files using Supabase client need to add null checks before using the client.

## Pattern to follow:

```typescript
// At the start of any async function using supabase
if (!supabase) {
  console.error('Supabase client not available');
  return; // or handle error appropriately
}
```

## Files to update:
1. ✅ src/app/(auth)/login/page.tsx - DONE
2. ✅ src/app/student/subscription/page.tsx - DONE
3. src/app/(auth)/register/page.tsx
4. src/app/admin/dashboard/page.tsx
5. src/app/parent/dashboard/page.tsx
6. src/app/student/assignments/[id]/page.tsx
7. src/app/student/dashboard/page.tsx
8. src/app/student/payment/page.tsx
9. src/app/student/videos/[id]/page.tsx
10. src/app/student/videos/page.tsx
11. src/app/teacher/assignments/create/page.tsx
12. src/app/teacher/dashboard/page.tsx
13. src/app/teacher/sessions/create/page.tsx
14. src/components/SubscriptionAlert.tsx
15. src/hooks/useAuth.ts
