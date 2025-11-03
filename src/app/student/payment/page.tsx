'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get plan details from URL
  const planLevel = searchParams.get('plan') || 'basic';
  const period = searchParams.get('period') || 'monthly';
  const price = searchParams.get('price') || '0';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('يرجى اختيار صورة فقط (JPG, PNG, PDF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('يرجى اختيار صورة إيصال الدفع');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `payment-receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      // Create payment record
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          student_id: user?.id,
          amount_millimes: parseFloat(price) * 1000,
          plan_level: planLevel,
          billing_period: period,
          status: 'pending',
          payment_method: 'manual_transfer',
          receipt_url: urlData.publicUrl,
          order_id: `MANUAL_${Date.now()}_${user?.id.substring(0, 8)}`,
        });

      if (insertError) throw insertError;

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user?.id,
        type: 'payment',
        channel: 'in_app',
        title_ar: 'تم إرسال إيصال الدفع',
        message_ar: `تم إرسال إيصال دفع الاشتراك ${planLevel}. سيتم المراجعة قريباً.`,
        is_read: false,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الإيصال');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>هذه الصفحة متاحة للطلاب فقط</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div>
                <CardTitle className="text-green-700 dark:text-green-400">تم إرسال الإيصال بنجاح!</CardTitle>
                <CardDescription>سيتم مراجعة الدفع وتفعيل الاشتراك قريباً</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/50 p-4 rounded-lg space-y-2">
              <p><strong>الباقة:</strong> {planLevel}</p>
              <p><strong>المدة:</strong> {period === 'monthly' ? 'شهري' : period === 'quarterly' ? 'ربع سنوي' : 'سنوي'}</p>
              <p><strong>المبلغ:</strong> {price} TND</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ✅ سيتم مراجعة الإيصال خلال 24-48 ساعة
              </p>
              <p className="text-sm text-muted-foreground">
                ✅ سيتم إرسال إشعار عند تفعيل الاشتراك
              </p>
              <p className="text-sm text-muted-foreground">
                ✅ يمكنك متابعة حالة الدفع من لوحة التحكم
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/student/dashboard" className="flex-1">
                <Button className="w-full">العودة للوحة التحكم</Button>
              </Link>
              <Link href="/student/subscription" className="flex-1">
                <Button variant="outline" className="w-full">عرض الاشتراكات</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/student/subscription">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowRight className="h-4 w-4" />
            العودة للاشتراكات
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">دفع الاشتراك</h1>
        <p className="text-muted-foreground">قم برفع صورة إيصال الدفع لإتمام الاشتراك</p>
      </div>

      {/* Payment Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            تفاصيل الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الباقة</p>
              <p className="font-semibold text-lg capitalize">{planLevel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المدة</p>
              <p className="font-semibold text-lg">
                {period === 'monthly' ? 'شهري' : period === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">المبلغ المطلوب</p>
            <p className="text-3xl font-bold text-primary">{price} TND</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-sm">طريقة الدفع:</p>
            <ol className="text-sm space-y-1 mr-4">
              <li>1. قم بالتحويل البنكي على الحساب التالي</li>
              <li>2. التقط صورة للإيصال</li>
              <li>3. ارفع الصورة أدناه</li>
              <li>4. انتظر التفعيل خلال 24-48 ساعة</li>
            </ol>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="font-semibold text-sm mb-2">معلومات الحساب البنكي:</p>
            <div className="text-sm space-y-1">
              <p><strong>البنك:</strong> البنك الأهلي التونسي</p>
              <p><strong>RIB:</strong> 12345678901234567890</p>
              <p><strong>الاسم:</strong> أكاديمية بروفي</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>رفع إيصال الدفع</CardTitle>
          <CardDescription>اختر صورة واضحة للإيصال (JPG, PNG - أقل من 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* File Input */}
            <div>
              <label htmlFor="receipt" className="block text-sm font-medium mb-2">
                صورة الإيصال *
              </label>
              <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="receipt" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="ml-2 h-4 w-4" />
                        تغيير الصورة
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">انقر لاختيار صورة</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG - أقل من 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    إرسال الإيصال
                  </>
                )}
              </Button>
              <Link href="/student/subscription">
                <Button type="button" variant="outline" disabled={uploading}>
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            هل تواجه مشكلة؟{' '}
            <Link href="/contact" className="text-primary hover:underline">
              تواصل معنا
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManualPaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
