import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyKonnectWebhook, type KonnectWebhookPayload } from '@/lib/payments/konnect';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Parse webhook payload
    const payload: KonnectWebhookPayload = await request.json();

    // Verify webhook (basic validation)
    if (!verifyKonnectWebhook(payload)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    console.log('Konnect webhook received:', payload);

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_ref', payload.paymentRef)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', payload.paymentRef);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: payload.status,
        transaction_id: payload.transactionId,
        payment_method: payload.paymentMethod || 'konnect',
        updated_at: new Date().toISOString(),
        paid_at: payload.status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', payment.id);

    // If payment is completed, create/update subscription
    if (payload.status === 'completed') {
      await handleSuccessfulPayment(supabase, payment);
    }

    // If payment failed or cancelled, handle accordingly
    if (payload.status === 'failed' || payload.status === 'cancelled') {
      await handleFailedPayment(supabase, payment);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(supabase: any, payment: any) {
  try {
    // Calculate subscription dates
    const now = new Date();
    let endDate = new Date(now);

    switch (payment.billing_period) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', payment.student_id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      // Extend existing subscription
      const currentEnd = new Date(existingSubscription.end_date);
      const newEndDate = currentEnd > now ? currentEnd : now;
      
      switch (payment.billing_period) {
        case 'monthly':
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case 'quarterly':
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
        case 'yearly':
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          break;
      }

      await supabase
        .from('subscriptions')
        .update({
          plan_level: payment.plan_level,
          end_date: newEndDate.toISOString(),
          auto_renew: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
    } else {
      // Create new subscription
      await supabase.from('subscriptions').insert({
        student_id: payment.student_id,
        plan_id: await getPlanId(supabase, payment.plan_level),
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        billing_period: payment.billing_period,
        auto_renew: true,
        created_by: payment.user_id,
      });
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: payment.student_id,
      type: 'subscription',
      channel: 'in_app',
      title_ar: 'تم تفعيل الاشتراك',
      message_ar: `تم تفعيل اشتراكك بنجاح في خطة ${payment.plan_level}`,
      is_read: false,
    });

    console.log('Subscription activated successfully for:', payment.student_id);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleFailedPayment(supabase: any, payment: any) {
  try {
    // Create notification about failed payment
    await supabase.from('notifications').insert({
      user_id: payment.user_id,
      type: 'payment',
      channel: 'in_app',
      title_ar: 'فشل الدفع',
      message_ar: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.',
      is_read: false,
    });

    console.log('Failed payment handled for:', payment.user_id);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function getPlanId(supabase: any, planLevel: string): Promise<string> {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('plan_level', planLevel)
    .single();

  return plan?.id || '';
}
