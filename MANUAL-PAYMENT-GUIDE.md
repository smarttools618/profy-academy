# 💳 Manual Payment System Guide

## Overview

The platform now uses a **manual payment system** where students upload payment receipt images. Admins review and approve payments to activate subscriptions.

---

## 🔄 **Payment Flow**

### **Student Side:**

1. **Select Subscription**
   - Navigate to `/student/subscription`
   - Choose plan (Basic, Standard, Premium)
   - Select period (Monthly, Quarterly, Yearly)
   - Click "اشترك الآن"

2. **Make Bank Transfer**
   - View subscription details and price
   - Transfer money to academy bank account
   - Keep the receipt/proof of payment

3. **Upload Receipt**
   - Redirected to `/student/payment`
   - Upload clear image of receipt (JPG, PNG, max 5MB)
   - Submit for review

4. **Wait for Approval**
   - Payment status: "Pending"
   - Admin reviews within 24-48 hours
   - Notification sent when approved

5. **Access Activated**
   - Subscription activated
   - Full access to premium features

---

### **Admin Side:**

1. **View Pending Payments**
   - Check `payments` table in database
   - Filter by `status = 'pending'`
   - View uploaded receipt images

2. **Review Receipt**
   - Verify payment amount matches
   - Confirm transfer received
   - Check student details

3. **Approve Payment**
   - Update payment status to 'completed'
   - System automatically creates/extends subscription
   - Student receives notification

4. **Reject if Invalid**
   - Update status to 'failed'
   - Add notes explaining issue
   - Student can re-upload

---

## 📊 **Database Tables**

### **payments Table:**
```sql
- id (uuid)
- user_id (uuid) - Who made the payment
- student_id (uuid) - For whom  
- order_id (text) - MANUAL_timestamp_userid
- amount_millimes (integer) - Amount in millimes
- plan_level (text) - basic/standard/premium
- billing_period (text) - monthly/quarterly/yearly
- status (text) - pending/completed/failed
- payment_method (text) - 'manual_transfer'
- receipt_url (text) - URL to uploaded image
- created_at (timestamp)
- paid_at (timestamp) - When approved
```

### **subscriptions Table:**
Auto-created when payment approved:
```sql
- student_id
- plan_id  
- status - 'active'
- start_date
- end_date (calculated based on period)
- billing_period
```

---

## 🔔 **Subscription Renewal Alerts**

### **Automatic Alerts:**

**When Alert Shows:**
- 7 days before expiry: Yellow alert
- 3 days before expiry: Red alert
- On expiry day: Critical alert

**Alert Features:**
- Shows days remaining
- Displays current plan
- Quick links to renew
- Dismissible by user
- Reappears daily until renewed

**Where Alerts Appear:**
- Student dashboard (top of page)
- Before subscription expires

---

## 🏦 **Bank Account Information**

**Update this in the payment page:**

File: `src/app/student/payment/page.tsx`

```typescript
<p><strong>البنك:</strong> البنك الأهلي التونسي</p>
<p><strong>RIB:</strong> 12345678901234567890</p>
<p><strong>الاسم:</strong> أكاديمية بروفي</p>
```

Replace with your actual bank details!

---

## 📁 **Files Created/Modified**

### **New Files:**

1. **`src/app/student/payment/page.tsx`**
   - Manual payment upload page
   - Receipt image upload
   - Payment instructions
   - Success confirmation

2. **`src/components/SubscriptionAlert.tsx`**
   - Renewal reminder component
   - Automatic 7-day warning
   - Dismissible alert

### **Modified Files:**

1. **`src/app/student/subscription/page.tsx`**
   - Removed Konnect integration
   - Redirects to manual payment page
   - Passes plan details via URL

2. **`src/app/student/dashboard/page.tsx`**
   - Added SubscriptionAlert component
   - Shows renewal warnings

### **Deleted Files:**

1. ❌ `src/lib/payments/konnect.ts`
2. ❌ `src/app/api/payments/initiate/route.ts`
3. ❌ `src/app/api/webhooks/konnect/route.ts`
4. ❌ `KONNECT-SETUP.md`

---

## 🔐 **Image Storage**

### **Supabase Storage Bucket:**

**Bucket Name:** `payments`

**Setup Required:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', false);

-- Add RLS policies
CREATE POLICY "Students can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payments');

CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payments' AND 
       (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## 👨‍💼 **Admin Approval Process**

### **Manual Approval (Current):**

1. **Access Database:**
   ```sql
   SELECT * FROM payments 
   WHERE status = 'pending' 
   ORDER BY created_at DESC;
   ```

2. **View Receipt:**
   - Copy `receipt_url` from database
   - Open in browser to view image
   - Verify payment details

3. **Approve Payment:**
   ```sql
   UPDATE payments 
   SET status = 'completed',
       paid_at = NOW()
   WHERE id = '<payment-id>';
   ```

4. **System Auto-Creates Subscription:**
   - Trigger automatically creates subscription
   - Sets correct start/end dates
   - Sends notification to student

### **Future: Admin Dashboard (TODO):**

Create admin page at `/admin/payments` with:
- List of pending payments
- Receipt image preview
- One-click approve/reject buttons
- Payment history
- Search and filters

---

## 📱 **User Experience**

### **Payment Page Features:**

✅ **Clear Instructions**
- Step-by-step guide
- Bank account details displayed
- Amount clearly shown

✅ **Easy Upload**
- Drag & drop or click to upload
- Image preview before submit
- File validation (type & size)

✅ **Progress Feedback**
- Upload progress indicator
- Success confirmation
- Next steps explained

✅ **Help & Support**
- Contact link provided
- FAQ section
- Expected timeline shown

---

## 💰 **Pricing Information**

### **Subscription Plans:**

| Plan | Monthly | Quarterly | Yearly |
|------|---------|-----------|--------|
| Basic | 50 TND | 142.50 TND | 510 TND |
| Standard | 100 TND | 285 TND | 1,020 TND |
| Premium | 150 TND | 427.50 TND | 1,530 TND |

**Discounts:**
- Quarterly: 5% off
- Yearly: 15% off

---

## 🔄 **Payment States**

### **Status Flow:**

```
pending → completed → active subscription
       ↓
      failed → student can re-upload
```

**Status Meanings:**
- `pending`: Waiting for admin review
- `completed`: Approved and subscription activated
- `failed`: Rejected, needs correction

---

## ⚙️ **Configuration**

### **Update Bank Details:**

Edit: `src/app/student/payment/page.tsx`

Lines 240-244:
```typescript
<p><strong>البنك:</strong> YOUR_BANK_NAME</p>
<p><strong>RIB:</strong> YOUR_RIB_NUMBER</p>
<p><strong>الاسم:</strong> YOUR_ACCOUNT_NAME</p>
```

### **Adjust Alert Timing:**

Edit: `src/components/SubscriptionAlert.tsx`

Line 44:
```typescript
// Show alert if less than 7 days remaining
if (diffDays <= 7 && diffDays > 0) {
  setShowAlert(true);
}
```

Change `7` to desired number of days.

---

## 📊 **Monitoring Payments**

### **Useful Queries:**

**Pending Payments:**
```sql
SELECT p.*, pr.full_name_ar, pr.email
FROM payments p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
```

**Revenue This Month:**
```sql
SELECT 
  COUNT(*) as total_payments,
  SUM(amount_millimes) / 1000 as total_tnd
FROM payments
WHERE status = 'completed'
  AND created_at >= date_trunc('month', CURRENT_DATE);
```

**Expiring Subscriptions (Next 7 Days):**
```sql
SELECT s.*, pr.full_name_ar, pr.email
FROM subscriptions s
JOIN profiles pr ON s.student_id = pr.id
WHERE s.status = 'active'
  AND s.end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY s.end_date ASC;
```

---

## ✅ **Testing the System**

### **Test as Student:**

1. Go to `/student/subscription`
2. Click "اشترك الآن" on any plan
3. You'll be redirected to `/student/payment`
4. Upload a test image
5. Check database for pending payment

### **Test as Admin:**

1. Query `payments` table
2. Find test payment
3. Manually update status to 'completed'
4. Check `subscriptions` table for new entry
5. Student should see active subscription

### **Test Renewal Alert:**

1. Create subscription with end_date in 5 days
2. Login as that student
3. Alert should appear on dashboard
4. Dismiss and verify it reappears on refresh

---

## 🚨 **Troubleshooting**

### **Receipt Upload Fails:**

**Check:**
- File size < 5MB
- File type is image (JPG, PNG)
- Storage bucket 'payments' exists
- RLS policies allow upload

### **Alert Not Showing:**

**Check:**
- Subscription exists and is active
- end_date is within 7 days
- Student role is correct
- Component imported in dashboard

### **Subscription Not Created:**

**Check:**
- Payment status is 'completed'
- plan_level matches a valid plan
- Database trigger is working
- Subscription doesn't already exist

---

## 📈 **Next Steps**

### **Recommended Enhancements:**

1. **Admin Payment Dashboard**
   - Visual interface for approving payments
   - Bulk actions
   - Analytics

2. **Email Notifications**
   - Receipt uploaded confirmation
   - Payment approved email
   - Renewal reminders

3. **SMS Notifications**  
   - Critical renewal alerts
   - Payment confirmations

4. **Payment History**
   - Student can view past payments
   - Download receipts
   - Invoice generation

5. **Auto-Renewal**
   - Send reminder emails
   - Pre-authorize payments
   - Automatic billing

---

## 📞 **Support**

### **For Students:**
- Contact form on website
- Email support
- FAQ section

### **For Admins:**
- Database access via Supabase dashboard
- Direct SQL queries
- Manual approval process

---

## 🎯 **Summary**

✅ **Simple for Students**
- Upload receipt image
- Wait for approval
- Get notified when ready

✅ **Controlled for Admins**
- Review every payment
- Manual verification
- Full control

✅ **Secure & Trackable**
- All payments recorded
- Receipt images stored
- Audit trail maintained

---

**🎓 Your manual payment system is ready to use!**

Students can now subscribe by uploading payment receipts, and you maintain full control over subscription activations.

*Last Updated: November 3, 2025*
