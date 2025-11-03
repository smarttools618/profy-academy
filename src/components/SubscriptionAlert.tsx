'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: string;
  end_date: string;
  status: string;
  plan_level: string;
}

export default function SubscriptionAlert() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (user && profile?.role === 'student') {
      checkSubscription();
    }
  }, [user, profile]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, end_date, status, plan_level')
        .eq('student_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error || !data) return;

      setSubscription(data);

      // Calculate days remaining
      const endDate = new Date(data.end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDaysRemaining(diffDays);

      // Show alert if less than 7 days remaining
      if (diffDays <= 7 && diffDays > 0) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  if (!showAlert || !subscription || daysRemaining === null) {
    return null;
  }

  const getAlertColor = () => {
    if (daysRemaining <= 3) return 'bg-red-50 dark:bg-red-900/20 border-red-200';
    if (daysRemaining <= 7) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
  };

  const getAlertText = () => {
    if (daysRemaining === 0) return 'ينتهي اليوم!';
    if (daysRemaining === 1) return 'ينتهي غداً!';
    return `ينتهي خلال ${daysRemaining} أيام`;
  };

  return (
    <Card className={`${getAlertColor()} mb-6 relative`}>
      <button
        onClick={() => setShowAlert(false)}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className={`h-6 w-6 mt-1 ${
            daysRemaining <= 3 ? 'text-red-600' : 'text-yellow-600'
          }`} />
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              تنبيه: اشتراكك {getAlertText()}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              اشتراكك في باقة <strong>{subscription.plan_level}</strong> على وشك الانتهاء.
              قم بتجديد اشتراكك الآن للاستمرار في الوصول إلى جميع المميزات.
            </p>

            <div className="flex gap-3">
              <Link href="/student/subscription">
                <Button size="sm">
                  تجديد الاشتراك
                </Button>
              </Link>
              <Link href="/student/subscription">
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
