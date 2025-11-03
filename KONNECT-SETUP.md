# 🇹🇳 Konnect Payment Gateway Setup Guide

## Overview

Konnect is Tunisia's leading payment gateway that allows you to accept payments online. This guide will help you integrate Konnect into Profy Academy.

**Official Website:** https://konnect.network/en/  
**Documentation:** https://docs.konnect.network/  
**Dashboard:** https://dashboard.konnect.network

---

## 💳 **Payment Features**

### **Supported Payment Methods:**
- 💳 Tunisian Bank Cards
- 💳 International Bank Cards (Visa, Mastercard)
- 💰 e-DINAR
- 👛 Konnect Wallet

### **Fees:**
- Local Tunisian transactions: **1.6%**
- International transactions: **3.3%**
- Bank transfer fee: **2 TND** per transfer

### **Pricing Examples for Profy Academy:**
- Basic Plan (50 TND/month):
  - Fee: 0.80 TND
  - You receive: 49.20 TND

- Standard Plan (100 TND/month):
  - Fee: 1.60 TND
  - You receive: 98.40 TND

- Premium Plan (150 TND/month):
  - Fee: 2.40 TND
  - You receive: 147.60 TND

---

## 📋 **Step 1: Create Konnect Account**

### **For Production:**

1. **Visit:** https://dashboard.konnect.network/auth/register
2. **Fill in your information:**
   - Full name
   - Email address
   - Phone number
   - Create password

3. **Verify your email**

### **For Testing (Sandbox):**

1. **Visit:** https://dashboard.sandbox.konnect.network/auth/register
2. Same registration process
3. Use test environment for development

---

## 🔐 **Step 2: Complete KYC Verification**

### **Required Documents:**

**For Individuals:**
- ✅ Digital copy of your CIN (Carte d'Identité Nationale)
- ✅ IBAN (Bank account details)

**For Companies:**
- ✅ Digital copy of owner's CIN
- ✅ IBAN (Bank account details)
- ✅ Company registration document (Patente)

### **Verification Process:**
1. Login to your Konnect dashboard
2. Go to Settings → Verification
3. Upload required documents
4. Wait for approval (usually 24-48 hours)

---

## 🔑 **Step 3: Get API Credentials**

### **1. Get API Key:**

1. Login to Konnect Dashboard
2. Go to **Settings** → **API Keys**
3. Click "Generate New API Key"
4. **Copy** and save the key securely
5. Add to `.env.local`:
   ```env
   KONNECT_API_KEY=your_actual_api_key_here
   ```

### **2. Get Wallet ID:**

1. In the dashboard, go to **Settings** → **Account**
2. Find your **Wallet ID** (format: `5f7a209aeb3f76490ac4a3d1`)
3. Copy the Wallet ID
4. Add to `.env.local`:
   ```env
   KONNECT_WALLET_ID=your_actual_wallet_id_here
   ```

### **3. Configure Environment:**

Update your `.env.local` file:

```env
# Konnect Payment Gateway (Tunisia)
KONNECT_API_KEY=your_actual_api_key_from_dashboard
KONNECT_WALLET_ID=your_actual_wallet_id_from_dashboard
KONNECT_API_URL=https://api.konnect.network/api/v2
```

**For Sandbox/Testing:**
```env
KONNECT_API_URL=https://api.sandbox.konnect.network/api/v2
```

---

## 🧪 **Step 4: Testing**

### **Test Cards (Sandbox Only):**

Konnect provides test cards for the sandbox environment:

**Successful Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card Number: `4000 0000 0000 0010`
- Expiry: Any future date
- CVV: Any 3 digits

### **Test the Integration:**

1. Run your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/student/subscription

3. Select a plan and click "اشترك الآن"

4. You'll be redirected to Konnect checkout page

5. Use test card to complete payment

6. Check webhook receives payment confirmation

---

## 🔔 **Step 5: Configure Webhook**

### **What is a Webhook?**
A webhook URL receives real-time notifications when payment status changes.

### **Setup:**

1. In Konnect Dashboard, go to **Settings** → **Webhooks**

2. Add your webhook URL:
   ```
   https://your-domain.com/api/webhooks/konnect
   ```
   
   **For local testing:**
   ```
   Use ngrok or similar tunnel service
   ```

3. Select events to receive:
   - ✅ Payment Completed
   - ✅ Payment Failed
   - ✅ Payment Cancelled

4. Save configuration

### **Using ngrok for Local Testing:**

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the https URL provided for webhook
https://abc123.ngrok.io/api/webhooks/konnect
```

---

## 📊 **Payment Flow**

### **1. User Clicks "Subscribe"**
```
Student → Selects plan → Clicks "اشترك الآن"
```

### **2. Your API Creates Payment**
```javascript
POST /api/payments/initiate
{
  planLevel: "premium",
  period: "monthly",
  studentId: "user-id"
}
```

### **3. Konnect Responds**
```json
{
  "paymentRef": "unique-payment-reference",
  "paymentUrl": "https://payment.konnect.network/abc123"
}
```

### **4. User Redirected**
```
User → Konnect checkout → Enters card → Pays
```

### **5. Webhook Notification**
```javascript
POST /api/webhooks/konnect
{
  "paymentRef": "unique-payment-reference",
  "status": "completed",
  "amount": 100000,
  "orderId": "SUB_123456"
}
```

### **6. Subscription Activated**
```
Webhook → Updates database → Creates subscription → Sends notification
```

---

## 🎨 **Customization**

### **Checkout Theme:**

You can customize the Konnect checkout page:

```javascript
{
  theme: 'light', // or 'dark'
  // Add your logo in Konnect dashboard
}
```

### **Payment Methods:**

Control which payment methods to accept:

```javascript
{
  acceptedPaymentMethods: ['bank_card', 'e-DINAR', 'wallet']
}
```

---

## 🔒 **Security Best Practices**

### **1. Never Expose API Keys**
- ❌ Don't commit `.env.local` to git
- ✅ Use environment variables
- ✅ Add `.env.local` to `.gitignore`

### **2. Validate Webhooks**
```javascript
// Already implemented in:
// src/app/api/webhooks/konnect/route.ts
```

### **3. Use HTTPS in Production**
- ✅ Always use HTTPS for webhook URLs
- ✅ Use secure connection for payment processing

### **4. Monitor Transactions**
- Check Konnect dashboard daily
- Set up email notifications
- Review failed payments

---

## 📝 **Database Tables for Payments**

Already created in your database:

### **`payments` Table:**
```sql
- id (uuid)
- user_id (uuid) → Who made the payment
- student_id (uuid) → For whom (can be different if parent pays)
- order_id (text) → Unique order reference
- payment_ref (text) → Konnect payment reference
- amount_millimes (integer) → Amount in millimes
- plan_level (text) → basic/standard/premium
- billing_period (text) → monthly/quarterly/yearly
- status (text) → pending/completed/failed/cancelled
- payment_method (text) → konnect/other
- transaction_id (text) → Konnect transaction ID
- created_at (timestamp)
- paid_at (timestamp)
```

---

## 🚀 **Going Live**

### **Production Checklist:**

1. **✅ Account Verified**
   - KYC documents approved
   - Bank account linked

2. **✅ Switch to Production**
   ```env
   KONNECT_API_URL=https://api.konnect.network/api/v2
   ```

3. **✅ Use Production Credentials**
   - Get production API key
   - Get production wallet ID

4. **✅ Update Webhook URL**
   - Use your production domain
   - Test webhook reception

5. **✅ Test with Real Card**
   - Make a small test payment
   - Verify subscription activation
   - Check money received

6. **✅ Monitor First Transactions**
   - Watch for any errors
   - Verify webhooks working
   - Check database updates

---

## 📞 **Support**

### **Konnect Support:**
- **Email:** support@konnect.network
- **Phone:** Check their website
- **Dashboard:** Live chat available

### **Resources:**
- Documentation: https://docs.konnect.network/
- API Reference: https://api.konnect.network/api/v2/konnect-gateway
- FAQ: https://konnect.network/en/ (scroll to FAQ section)

---

## 💡 **Tips for Success**

### **1. Clear Communication**
- Show accepted payment methods
- Display fees transparently
- Provide payment receipt

### **2. Handle Failures Gracefully**
- Show helpful error messages
- Allow retry without new registration
- Send email notification

### **3. Monitor Performance**
- Track conversion rate
- Identify failed payment patterns
- Optimize checkout flow

### **4. Provide Support**
- Have customer service contact
- Quick response to payment issues
- Clear refund policy

---

## 📈 **Expected Costs**

### **Monthly Estimates:**

**50 Students (mixed plans):**
- Gross Revenue: ~5,000 TND
- Konnect Fees (1.6%): ~80 TND
- Net Revenue: ~4,920 TND

**100 Students:**
- Gross Revenue: ~10,000 TND
- Konnect Fees (1.6%): ~160 TND
- Net Revenue: ~9,840 TND

**Note:** These are estimates. Actual fees depend on payment methods used.

---

## ✅ **Integration Checklist**

- [x] Konnect utility functions created
- [x] Payment initiation API route
- [x] Webhook handler
- [x] Database payment tracking
- [x] Subscription page updated
- [x] Environment variables configured
- [ ] Get Konnect account
- [ ] Complete KYC verification
- [ ] Get API credentials
- [ ] Test with sandbox
- [ ] Configure production webhook
- [ ] Go live!

---

## 🎓 **You're Ready!**

Your Profy Academy platform now has:
- ✅ Full Konnect payment integration
- ✅ Automatic subscription activation
- ✅ Webhook handling
- ✅ Payment tracking
- ✅ Tunisian Dinar support

**Next Step:** Create your Konnect account and start accepting payments!

---

**Made with ❤️ for Tunisian Education** 🇹🇳
