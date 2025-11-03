/**
 * Konnect Payment Gateway Integration
 * Documentation: https://docs.konnect.network/
 * 
 * Fees:
 * - Local transactions: 1.6%
 * - International transactions: 3.3%
 * - Bank transfer: 2 TND
 */

const KONNECT_API_URL = process.env.KONNECT_API_URL || 'https://api.konnect.network/api/v2';
const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
const KONNECT_WALLET_ID = process.env.KONNECT_WALLET_ID;

export interface KonnectPaymentRequest {
  receiverWalletId: string;
  token: 'TND' | 'USD' | 'EUR';
  amount: number; // in millimes (1000 = 1 TND)
  type: 'immediate';
  description: string;
  acceptedPaymentMethods: ('wallet' | 'bank_card' | 'e-DINAR')[];
  lifespan?: number; // in minutes
  checkoutForm: boolean;
  addPaymentFeesToAmount: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  orderId: string;
  webhook: string;
  theme?: 'light' | 'dark';
}

export interface KonnectPaymentResponse {
  paymentRef: string;
  paymentUrl: string;
}

export interface KonnectWebhookPayload {
  paymentRef: string;
  orderId: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  amount: number;
  token: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Initialize a payment with Konnect
 */
export async function initiateKonnectPayment(
  params: Omit<KonnectPaymentRequest, 'receiverWalletId' | 'webhook'>
): Promise<KonnectPaymentResponse> {
  if (!KONNECT_API_KEY) {
    throw new Error('KONNECT_API_KEY is not configured');
  }

  if (!KONNECT_WALLET_ID) {
    throw new Error('KONNECT_WALLET_ID is not configured');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const payload: KonnectPaymentRequest = {
    ...params,
    receiverWalletId: KONNECT_WALLET_ID,
    webhook: `${baseUrl}/api/webhooks/konnect`,
  };

  try {
    const response = await fetch(`${KONNECT_API_URL}/payments/init-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KONNECT_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Konnect API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Konnect payment initiation error:', error);
    throw error;
  }
}

/**
 * Get payment details from Konnect
 */
export async function getKonnectPaymentDetails(paymentRef: string) {
  if (!KONNECT_API_KEY) {
    throw new Error('KONNECT_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `${KONNECT_API_URL}/payments/${paymentRef}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': KONNECT_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Konnect API error: ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Konnect payment details error:', error);
    throw error;
  }
}

/**
 * Convert TND to millimes (1 TND = 1000 millimes)
 */
export function tndToMillimes(tnd: number): number {
  return Math.round(tnd * 1000);
}

/**
 * Convert millimes to TND
 */
export function millimesToTnd(millimes: number): number {
  return millimes / 1000;
}

/**
 * Calculate subscription price in millimes
 */
export function calculateSubscriptionPrice(
  planLevel: 'basic' | 'standard' | 'premium',
  period: 'monthly' | 'quarterly' | 'yearly'
): number {
  const basePrices = {
    basic: 50, // 50 TND/month
    standard: 100, // 100 TND/month
    premium: 150, // 150 TND/month
  };

  const multipliers = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  };

  // Apply discount for longer periods
  const discounts = {
    monthly: 1,
    quarterly: 0.95, // 5% discount
    yearly: 0.85, // 15% discount
  };

  const basePrice = basePrices[planLevel];
  const months = multipliers[period];
  const discount = discounts[period];

  const totalTnd = basePrice * months * discount;
  return tndToMillimes(totalTnd);
}

/**
 * Verify Konnect webhook signature (if they provide signature verification)
 */
export function verifyKonnectWebhook(payload: any, signature?: string): boolean {
  // Add signature verification logic when Konnect provides it
  // For now, verify the payload structure
  return !!(
    payload &&
    payload.paymentRef &&
    payload.orderId &&
    payload.status
  );
}
