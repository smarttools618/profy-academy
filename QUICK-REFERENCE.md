# 🚀 Profy Academy - Quick Reference Card

**Use this card as your go-to reference while developing!**

---

## 📦 Installation (First Time Only)

```powershell
pnpm install
# Create .env.local with Supabase credentials
pnpm dev
```

---

## 🎯 Key Commands

```powershell
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Check code quality
pnpm format           # Format all code
pnpm supabase:types   # Generate database types
```

---

## 📁 File Structure Quick Guide

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── student/         # Student pages
│   ├── parent/          # Parent pages (to build)
│   ├── teacher/         # Teacher pages (to build)
│   └── admin/           # Admin pages (to build)
│
├── components/
│   └── ui/              # Reusable UI components
│
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Authentication hook
│
├── lib/
│   ├── supabase/        # Database utilities
│   ├── validations/     # Zod schemas
│   └── utils.ts         # Helper functions
│
└── types/               # TypeScript types
```

---

## 🗄️ Database Quick Access

**Supabase Dashboard**: https://supabase.com/dashboard/project/wvhnudjqwmbudhhyqmvo

**Main Tables**:
- `profiles` - User accounts
- `subscription_plans` - Profy, Profy+, Profy++
- `subscriptions` - Active subscriptions
- `subjects` - Academic subjects
- `live_sessions` - Video sessions
- `recorded_sessions` - Video library
- `assignments` - Homework
- `messages` - Chat system

---

## 🔐 Authentication Flow

```typescript
// Register
import { supabase } from '@/lib/supabase/client';
await supabase.auth.signUp({ email, password });

// Login
await supabase.auth.signInWithPassword({ email, password });

// Logout
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## 📊 Fetch Data (Examples)

```typescript
// Get subjects for a grade
const { data } = await supabase
  .from('subjects')
  .select('*')
  .eq('grade_level', 'grade_5')
  .eq('is_active', true);

// Get student profile
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Get with relations
const { data } = await supabase
  .from('live_sessions')
  .select(`
    *,
    subjects (name_ar, color_hex)
  `)
  .eq('grade_level', 'grade_5');
```

---

## 🎨 UI Components

```typescript
// Button
import { Button } from '@/components/ui/button';
<Button variant="default" size="lg">Click Me</Button>

// Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 🪝 Custom Hooks

```typescript
// useAuth - Authentication state
import { useAuth } from '@/hooks/useAuth';

const { user, profile, loading, signOut, isStudent } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) router.push('/login');
```

---

## ✅ Form Validation

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  name: z.string().min(3, 'الاسم قصير جداً'),
});

const result = schema.parse(formData);
```

---

## 🛠️ Utility Functions

```typescript
import {
  formatDate,      // Format date in Arabic
  formatTime,      // Format time in Arabic
  formatCurrency,  // Format TND currency
  getGradeName,    // Get grade name in Arabic
  cn,              // Merge Tailwind classes
} from '@/lib/utils';

const date = formatDate(new Date()); // "٣ نوفمبر ٢٠٢٤"
const grade = getGradeName('grade_5'); // "السنة الخامسة"
```

---

## 🎨 Tailwind Classes (RTL)

```html
<!-- Text alignment -->
<div className="text-right">   <!-- Default for Arabic -->
<div className="text-left">    <!-- For numbers/English -->

<!-- Spacing -->
<div className="mr-4">   <!-- Margin right -->
<div className="ml-4">   <!-- Margin left -->

<!-- Flex direction -->
<div className="flex flex-row-reverse">  <!-- RTL flex -->
```

---

## 🌍 Arabic Formatting

```typescript
// Dates
const date = new Intl.DateTimeFormat('ar-TN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date());

// Currency
const price = new Intl.NumberFormat('ar-TN', {
  style: 'currency',
  currency: 'TND',
}).format(49.99);
```

---

## 🔒 RLS Policy Pattern

```sql
-- Students see their own data
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Parents see children's data
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_parent_links
      WHERE student_id = table_name.student_id
        AND parent_id = auth.uid()
    )
  );
```

---

## 🚨 Common Issues & Solutions

**Issue**: TypeScript errors everywhere  
**Solution**: Run `pnpm install`

**Issue**: Can't connect to database  
**Solution**: Check `.env.local` has correct keys

**Issue**: Page not updating  
**Solution**: Clear cache: `rm -rf .next && pnpm dev`

**Issue**: Login not working  
**Solution**: Check browser console, verify Supabase dashboard

---

## 📝 Code Snippets

### Create a new page
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function PageName() {
  const { profile } = useAuth();
  
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold">{profile?.full_name_ar}</h1>
    </div>
  );
}
```

### Fetch data on page load
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    const { data } = await supabase.from('table').select('*');
    setData(data || []);
    setLoading(false);
  }
  fetchData();
}, []);
```

### Protected route
```typescript
useEffect(() => {
  if (!authLoading && !profile) {
    router.push('/login');
  }
}, [profile, authLoading]);
```

---

## 📊 Grade Levels

```typescript
type GradeLevel = 'grade_5' | 'grade_6' | 'grade_7';

const grades = {
  grade_5: 'السنة الخامسة',
  grade_6: 'السنة السادسة',
  grade_7: 'السنة السابعة',
};
```

---

## 👥 User Roles

```typescript
type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

const roles = {
  student: 'طالب',
  parent: 'ولي أمر',
  teacher: 'معلم',
  admin: 'مدير',
};
```

---

## 🎯 Subscription Plans

```typescript
const plans = {
  profy: 'بروفي',        // 49.99 TND/month
  profy_plus: 'بروفي+',   // 79.99 TND/month
  profy_premium: 'بروفي++', // 129.99 TND/month
};
```

---

## 🔗 Useful URLs

**Development**: http://localhost:3000  
**Supabase Dashboard**: https://supabase.com/dashboard/project/wvhnudjqwmbudhhyqmvo  
**Database Editor**: https://supabase.com/dashboard/project/wvhnudjqwmbudhhyqmvo/editor  
**API Docs**: https://supabase.com/dashboard/project/wvhnudjqwmbudhhyqmvo/api

---

## 📚 Documentation Files

- `SETUP-INSTRUCTIONS.md` - Installation guide
- `database-schema.md` - Database reference
- `ARCHITECTURE.md` - Technical details
- `IMPLEMENTATION-CHECKLIST.md` - Task list
- `FINAL-SUMMARY.md` - Complete overview
- `QUICK-REFERENCE.md` - This file

---

## 💡 Quick Tips

1. **Always use `cn()` for className merging**
2. **Validate forms with Zod before submitting**
3. **Check RLS policies when data doesn't show**
4. **Use `useAuth` hook for authentication**
5. **Format dates/currency with utility functions**
6. **Test with different user roles**
7. **Check browser console for errors**
8. **Read TypeScript errors carefully**

---

## ✨ Next Steps

1. Install dependencies: `pnpm install`
2. Configure `.env.local`
3. Start dev server: `pnpm dev`
4. Test authentication flow
5. Build parent dashboard
6. Add more features!

---

**Keep this file open while coding!** 📌

*Last Updated: November 3, 2024*
