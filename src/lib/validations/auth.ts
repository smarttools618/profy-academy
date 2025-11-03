import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('البريد الإلكتروني غير صحيح')
  .min(1, 'البريد الإلكتروني مطلوب');

// Phone validation for Tunisia
export const phoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .regex(/^(\+216)?[2-9]\d{7}$/, 'رقم الهاتف غير صحيح');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
  .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم');

// Login schema (email or phone + password)
export const loginSchema = z.object({
  identifier: z.string().min(1, 'البريد الإلكتروني أو رقم الهاتف مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Student registration schema
export const studentRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل')
      .max(100, 'الاسم الكامل طويل جداً'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    gradeLevel: z.enum(['grade_5', 'grade_6', 'grade_7'], {
      required_error: 'المستوى الدراسي مطلوب',
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'يجب الموافقة على الشروط والأحكام',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

// Parent registration schema
export const parentRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل')
      .max(100, 'الاسم الكامل طويل جداً'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'يجب الموافقة على الشروط والأحكام',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type ParentRegisterInput = z.infer<typeof parentRegisterSchema>;

// Teacher registration schema (admin creates)
export const teacherRegisterSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم الكامل طويل جداً'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
});

export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;

// Profile update schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم الكامل طويل جداً'),
  phone: phoneSchema.optional(),
  avatarUrl: z.string().url('رابط الصورة غير صحيح').optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن القديمة',
    path: ['newPassword'],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

// Password reset schema
export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
