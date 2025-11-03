'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import {
  studentRegisterSchema,
  type StudentRegisterInput,
} from '@/lib/validations/auth';
import { getGradeName } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<StudentRegisterInput>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gradeLevel: 'grade_5',
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = studentRegisterSchema.parse(formData);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.fullName,
            role: 'student',
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('البريد الإلكتروني مسجل مسبقاً');
        } else {
          setError('حدث خطأ أثناء إنشاء الحساب');
        }
        return;
      }

      if (authData.user) {
        // Create profile in database
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: validatedData.email,
          phone_number: validatedData.phone,
          full_name_ar: validatedData.fullName,
          role: 'student',
          grade_level: validatedData.gradeLevel,
          email_verified: false,
          phone_verified: false,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('تم إنشاء الحساب ولكن حدث خطأ في حفظ البيانات');
          return;
        }

        // Redirect to verification page or dashboard
        router.push('/student/dashboard');
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

  const handleInputChange = (
    field: keyof StudentRegisterInput,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">أكاديمية بروفي</h1>
          <p className="text-muted-foreground">إنشاء حساب طالب جديد</p>
        </div>

        {/* Registration Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">التسجيل</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="أدخل اسمك الكامل"
                disabled={isLoading}
                required
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium mb-2">المستوى الدراسي *</label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                disabled={isLoading}
                required
              >
                <option value="grade_5">{getGradeName('grade_5')}</option>
                <option value="grade_6">{getGradeName('grade_6')}</option>
                <option value="grade_7">{getGradeName('grade_7')}</option>
              </select>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="example@email.com"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="XX XXX XXX"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">كلمة المرور *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                className="mt-1 w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                أوافق على{' '}
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  سياسة الخصوصية
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.agreeToTerms}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>جاري إنشاء الحساب...</span>
                </>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
