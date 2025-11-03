import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initiateKonnectPayment, calculateSubscriptionPrice } from '@/lib/payments/konnect';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name_ar, phone_number, email')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'الملف الشخصي غير موجود' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { planLevel, period, studentId } = body;

    if (!planLevel || !period) {
      return NextResponse.json(
        { error: 'يرجى تحديد نوع الاشتراك والفترة' },
        { status: 400 }
      );
    }

    // Calculate amount
    const amount = calculateSubscriptionPrice(planLevel, period);

    // Create order ID
    const orderId = `SUB_${Date.now()}_${user.id.substring(0, 8)}`;

    // Get plan name in Arabic
    const planNames = {
      basic: 'أساسي',
      standard: 'قياسي',
      premium: 'متميز',
    };

    const periodNames = {
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
    };

    const description = `اشتراك ${planNames[planLevel as keyof typeof planNames]} - ${periodNames[period as keyof typeof periodNames]}`;

    // Split full name
    const nameParts = profile.full_name_ar?.split(' ') || ['', ''];
    const firstName = nameParts[0] || 'الطالب';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Initialize payment with Konnect
    const paymentResponse = await initiateKonnectPayment({
      token: 'TND',
      amount,
      type: 'immediate',
      description,
      acceptedPaymentMethods: ['bank_card', 'e-DINAR', 'wallet'],
      lifespan: 30, // 30 minutes
      checkoutForm: true,
      addPaymentFeesToAmount: false, // We'll absorb the fees
      firstName,
      lastName,
      phoneNumber: profile.phone_number || '00000000',
      email: profile.email || user.email || '',
      orderId,
      theme: 'light',
    });

    // Store payment record in database
    await supabase.from('payments').insert({
      user_id: user.id,
      student_id: studentId || user.id,
      order_id: orderId,
      payment_ref: paymentResponse.paymentRef,
      amount_millimes: amount,
      plan_level: planLevel,
      billing_period: period,
      status: 'pending',
      payment_method: 'konnect',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.paymentUrl,
      paymentRef: paymentResponse.paymentRef,
      orderId,
    });

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    );
  }
}
