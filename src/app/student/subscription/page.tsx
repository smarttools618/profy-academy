'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price_monthly: number;
  price_quarterly: number;
  price_yearly: number;
  features: string[];
  can_download_videos: boolean;
  can_download_materials: boolean;
}

interface CurrentSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: string;
  start_date: string;
  end_date: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/login');
      return;
    }

    if (profile) {
      fetchData();
    }
  }, [profile, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch subscription plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      setPlans(plansData || []);

      // Fetch current subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('student_id', profile?.id)
        .eq('status', 'active')
        .single();

      if (subData) {
        setCurrentSubscription({
          ...subData,
          plan: subData.subscription_plans as unknown as SubscriptionPlan,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    switch (selectedPeriod) {
      case 'monthly':
        return plan.price_monthly;
      case 'quarterly':
        return plan.price_quarterly;
      case 'yearly':
        return plan.price_yearly;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'monthly':
        return 'شهرياً';
      case 'quarterly':
        return 'كل 3 أشهر';
      case 'yearly':
        return 'سنوياً';
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    // Get plan level and price
    const planLevel = plan.name_en.replace('profy_', '');
    const price = getPlanPrice(plan);
    
    // Redirect to manual payment page with plan details
    router.push(
      `/student/payment?plan=${planLevel}&period=${selectedPeriod}&price=${price}`
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">الاشتراكات</h1>
              <p className="text-muted-foreground mt-1">اختر الباقة المناسبة لك</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/student/dashboard')}>
              ← العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle>اشتراكك الحالي</CardTitle>
              <CardDescription>معلومات الاشتراك النشط</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الباقة</p>
                  <p className="text-2xl font-bold text-primary">
                    {currentSubscription.plan.name_ar}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">تاريخ البداية</p>
                  <p className="text-lg font-semibold">
                    {formatDate(currentSubscription.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">تاريخ الانتهاء</p>
                  <p className="text-lg font-semibold">
                    {formatDate(currentSubscription.end_date)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">المميزات المتاحة:</p>
                <div className="flex flex-wrap gap-2">
                  {currentSubscription.plan.features.map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-border p-1 bg-card">
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setSelectedPeriod('quarterly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedPeriod === 'quarterly'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              كل 3 أشهر
              <span className="mr-2 text-xs text-green-600">وفر 10%</span>
            </button>
            <button
              onClick={() => setSelectedPeriod('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                selectedPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              سنوي
              <span className="mr-2 text-xs text-green-600">وفر 20%</span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            const isPremium = plan.name_en === 'profy_premium';

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPremium ? 'border-2 border-primary shadow-lg scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      الأكثر شعبية
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl mb-2">{plan.name_ar}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description_ar}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="text-5xl font-bold text-primary">
                      {formatCurrency(getPlanPrice(plan))}
                    </div>
                    <p className="text-muted-foreground mt-2">{getPeriodLabel()}</p>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      الباقة الحالية
                    </Button>
                  ) : (
                    <Button
                      variant={isPremium ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
                          جاري المعالجة...
                        </>
                      ) : (
                        currentSubscription ? 'ترقية الاشتراك' : 'اشترك الآن'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">مقارنة الباقات</CardTitle>
            <CardDescription>قارن بين مميزات الباقات المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-4 px-4">الميزة</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="text-center py-4 px-4">
                        {plan.name_ar}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">الحصص المسجلة</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <span className="text-green-600">✓</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">الواجبات والتقييم</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <span className="text-green-600">✓</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">الحصص المباشرة</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-600">✗</span>
                    </td>
                    {plans.slice(1).map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <span className="text-green-600">✓</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">تحميل المواد التعليمية</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {plan.can_download_materials ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">تحميل مقاطع الفيديو</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {plan.can_download_videos ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4">المتابعة الشخصية</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-600">✗</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-600">✓</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">هل تحتاج مساعدة في اختيار الباقة؟</h3>
              <p className="text-muted-foreground mb-4">
                تواصل معنا وسنساعدك في اختيار الباقة المناسبة لاحتياجاتك
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline">
                  📞 اتصل بنا
                </Button>
                <Button variant="outline">
                  💬 الدردشة المباشرة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
