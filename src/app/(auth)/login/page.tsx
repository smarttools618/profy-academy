'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginInput>({
    identifier: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if Supabase client is available
      if (!supabase) {
        setError('خطأ في الاتصال بالخادم');
        setIsLoading(false);
        return;
      }

      // Validate input
      const validatedData = loginSchema.parse(formData);

      // Determine if identifier is email or phone
      const isEmail = validatedData.identifier.includes('@');
      
      let signInData;
      if (isEmail) {
        // Sign in with email
        signInData = await supabase.auth.signInWithPassword({
          email: validatedData.identifier,
          password: validatedData.password,
        });
      } else {
        // Sign in with phone - first get email from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone_number', validatedData.identifier)
          .single();

        if (!profile || !(profile as any).email) {
          throw new Error('رقم الهاتف غير مسجل');
        }

        signInData = await supabase.auth.signInWithPassword({
          email: (profile as any).email,
          password: validatedData.password,
        });
      }

      const { data, error: signInError } = signInData;

      if (signInError) {
        if (signInError.message.includes('Invalid')) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else {
          setError('حدث خطأ أثناء تسجيل الدخول');
        }
        return;
      }

      if (data.user) {
        // Get user role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Redirect based on role
        switch ((profile as any)?.role) {
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'parent':
            router.push('/parent/dashboard');
            break;
          case 'teacher':
            router.push('/teacher/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/');
        }
      }
    } catch (err: any) {
      if (err.errors) {
        // Zod validation error
        setError(err.errors[0].message);
      } else {
        setError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">أكاديمية بروفي</h1>
          <p className="text-muted-foreground">منصة تعليمية متكاملة</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="أدخل بريدك الإلكتروني أو رقم هاتفك"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
