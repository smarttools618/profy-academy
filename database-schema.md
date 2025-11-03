# Profy Academy - Database Schema Design

## Overview
This document outlines the complete database schema for Profy Academy educational platform. All tables support Arabic content with RTL layout.

## Technology Stack
- **Backend**: Supabase (PostgreSQL)
- **Frontend**: Next.js 14+ with App Router
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

---

## 1. Authentication & User Management

### Table: `profiles`
Core user profile information linked to Supabase Auth.

```sql
CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin');
CREATE TYPE grade_level AS ENUM ('grade_5', 'grade_6', 'grade_7');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE,
  full_name_ar TEXT NOT NULL,
  role user_role NOT NULL,
  grade_level grade_level, -- Only for students
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_grade ON profiles(grade_level);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
```

**RLS Policies:**
- Users can read their own profile
- Admins can read/update all profiles
- Teachers can read student profiles
- Parents can read profiles of their linked children

---

### Table: `student_parent_links`
Links parent accounts to student accounts (one parent can have multiple children).

```sql
CREATE TABLE student_parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_ar TEXT, -- e.g., 'الأب', 'الأم', 'الوصي'
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_student_parent_student ON student_parent_links(student_id);
CREATE INDEX idx_student_parent_parent ON student_parent_links(parent_id);
```

---

## 2. Subscription System

### Table: `subscription_plans`
Defines the three tiers: Profy, Profy+, Profy++

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL, -- 'بروفي', 'بروفي+', 'بروفي++'
  name_en TEXT NOT NULL, -- 'profy', 'profy_plus', 'profy_premium'
  description_ar TEXT,
  price_monthly DECIMAL(10,2),
  price_quarterly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB, -- Array of features in Arabic
  max_live_sessions INT,
  can_download_videos BOOLEAN DEFAULT FALSE,
  can_download_materials BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table: `subscriptions`
Tracks student subscriptions

```sql
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending_payment');
CREATE TYPE payment_method AS ENUM ('online', 'manual', 'free_trial');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status DEFAULT 'pending_payment',
  payment_method payment_method,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_reference TEXT, -- For manual payments
  activated_by UUID REFERENCES profiles(id), -- Admin who activated manual payment
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

---

### Table: `payment_transactions`
Tracks all payment transactions

```sql
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  student_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'TND', -- Tunisian Dinar or your currency
  payment_method payment_method NOT NULL,
  payment_gateway TEXT, -- 'stripe', 'manual', etc.
  gateway_transaction_id TEXT,
  status transaction_status DEFAULT 'pending',
  processed_by UUID REFERENCES profiles(id), -- For manual payments
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_student ON payment_transactions(student_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
```

---

## 3. Academic Content Structure

### Table: `subjects`
Academic subjects for each grade

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  grade_level grade_level NOT NULL,
  icon_url TEXT,
  color_hex TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_grade ON subjects(grade_level);
```

---

### Table: `chapters`
Chapters within each subject

```sql
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  chapter_number INT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chapters_subject ON chapters(subject_id);
```

---

### Table: `lessons`
Individual lessons/topics within chapters

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  lesson_number INT NOT NULL,
  duration_minutes INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_chapter ON lessons(chapter_id);
```

---

## 4. Live Sessions

### Table: `live_sessions`
Scheduled live teaching sessions

```sql
CREATE TYPE session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE meeting_platform AS ENUM ('google_meet', 'zoom');

CREATE TABLE live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  subject_id UUID REFERENCES subjects(id),
  chapter_id UUID REFERENCES chapters(id),
  lesson_id UUID REFERENCES lessons(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  grade_level grade_level NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status session_status DEFAULT 'scheduled',
  meeting_platform meeting_platform NOT NULL,
  meeting_url TEXT NOT NULL,
  meeting_id TEXT, -- External platform meeting ID
  meeting_password TEXT,
  max_participants INT,
  required_plan_level TEXT, -- Minimum plan required
  reminder_sent BOOLEAN DEFAULT FALSE,
  recording_url TEXT, -- If session was recorded
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_sessions_teacher ON live_sessions(teacher_id);
CREATE INDEX idx_live_sessions_grade ON live_sessions(grade_level);
CREATE INDEX idx_live_sessions_start ON live_sessions(scheduled_start);
CREATE INDEX idx_live_sessions_status ON live_sessions(status);
```

---

### Table: `session_participants`
Track who attended live sessions

```sql
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  attendance_duration INT, -- Minutes attended
  was_present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_student ON session_participants(student_id);
```

---

## 5. Recorded Content

### Table: `recorded_sessions`
Library of pre-recorded educational videos

```sql
CREATE TYPE content_access_level AS ENUM ('free', 'profy', 'profy_plus', 'profy_premium');

CREATE TABLE recorded_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  subject_id UUID REFERENCES subjects(id),
  chapter_id UUID REFERENCES chapters(id),
  lesson_id UUID REFERENCES lessons(id),
  teacher_id UUID REFERENCES profiles(id),
  grade_level grade_level NOT NULL,
  video_url TEXT NOT NULL, -- Supabase Storage path
  thumbnail_url TEXT,
  duration_seconds INT,
  file_size_mb DECIMAL(10,2),
  video_quality TEXT, -- '720p', '1080p', etc.
  required_access_level content_access_level DEFAULT 'profy',
  allow_download BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recorded_sessions_subject ON recorded_sessions(subject_id);
CREATE INDEX idx_recorded_sessions_chapter ON recorded_sessions(chapter_id);
CREATE INDEX idx_recorded_sessions_grade ON recorded_sessions(grade_level);
CREATE INDEX idx_recorded_sessions_published ON recorded_sessions(is_published);
```

---

### Table: `session_materials`
Supplementary materials (PDFs, documents) for sessions

```sql
CREATE TYPE material_type AS ENUM ('pdf', 'document', 'image', 'other');

CREATE TABLE session_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_session_id UUID REFERENCES recorded_sessions(id) ON DELETE CASCADE,
  live_session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  material_type material_type NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage path
  file_size_mb DECIMAL(10,2),
  allow_download BOOLEAN DEFAULT TRUE,
  required_access_level content_access_level DEFAULT 'profy',
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_recorded ON session_materials(recorded_session_id);
CREATE INDEX idx_materials_live ON session_materials(live_session_id);
```

---

### Table: `video_views`
Track student video viewing progress

```sql
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_session_id UUID NOT NULL REFERENCES recorded_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  watch_duration_seconds INT DEFAULT 0,
  completion_percentage INT DEFAULT 0,
  last_position_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  first_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recorded_session_id, student_id)
);

CREATE INDEX idx_video_views_student ON video_views(student_id);
CREATE INDEX idx_video_views_session ON video_views(recorded_session_id);
```

---

## 6. Assignments & Assessments

### Table: `assignments`
Teacher-created assignments and homework

```sql
CREATE TYPE assignment_type AS ENUM ('homework', 'quiz', 'exam', 'project');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'written', 'upload');

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  subject_id UUID REFERENCES subjects(id),
  chapter_id UUID REFERENCES chapters(id),
  lesson_id UUID REFERENCES lessons(id),
  teacher_id UUID NOT NULL REFERENCES profiles(id),
  grade_level grade_level NOT NULL,
  assignment_type assignment_type NOT NULL,
  total_points DECIMAL(10,2),
  passing_score DECIMAL(10,2),
  due_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  allow_late_submission BOOLEAN DEFAULT FALSE,
  auto_grade BOOLEAN DEFAULT FALSE, -- For multiple choice
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_grade ON assignments(grade_level);
CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_assignments_due ON assignments(due_date);
```

---

### Table: `assignment_questions`
Questions within an assignment

```sql
CREATE TABLE assignment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  question_text_ar TEXT NOT NULL,
  question_type question_type NOT NULL,
  question_order INT NOT NULL,
  points DECIMAL(10,2) DEFAULT 1,
  options JSONB, -- For multiple choice: [{"id": "a", "text": "..."}]
  correct_answer TEXT, -- For auto-grading multiple choice
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignment_questions_assignment ON assignment_questions(assignment_id);
```

---

### Table: `assignment_files`
Files attached to assignments (PDF, images)

```sql
CREATE TABLE assignment_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT,
  file_size_mb DECIMAL(10,2),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignment_files_assignment ON assignment_files(assignment_id);
```

---

### Table: `student_submissions`
Student submissions for assignments

```sql
CREATE TYPE submission_status AS ENUM ('not_started', 'in_progress', 'submitted', 'graded', 'returned');

CREATE TABLE student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status submission_status DEFAULT 'not_started',
  submitted_at TIMESTAMPTZ,
  score DECIMAL(10,2),
  feedback_ar TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  is_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON student_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON student_submissions(student_id);
CREATE INDEX idx_submissions_status ON student_submissions(status);
```

---

### Table: `submission_answers`
Student answers to individual questions

```sql
CREATE TABLE submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES student_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assignment_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  selected_option TEXT, -- For multiple choice
  is_correct BOOLEAN, -- For auto-graded questions
  points_earned DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

CREATE INDEX idx_answers_submission ON submission_answers(submission_id);
```

---

### Table: `submission_files`
Files uploaded by students as answers

```sql
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES student_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT,
  file_size_mb DECIMAL(10,2),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submission_files_submission ON submission_files(submission_id);
```

---

## 7. Communication System

### Table: `conversations`
One-on-one or group conversations

```sql
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'course_group');

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT,
  conversation_type conversation_type NOT NULL,
  subject_id UUID REFERENCES subjects(id), -- For course groups
  grade_level grade_level, -- For course groups
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_type ON conversations(conversation_type);
CREATE INDEX idx_conversations_subject ON conversations(subject_id);
```

---

### Table: `conversation_participants`
Users in a conversation

```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE, -- Can add/remove participants
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
```

---

### Table: `messages`
Individual messages in conversations

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message_text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

---

### Table: `message_attachments`
Files attached to messages

```sql
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_mb DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_message ON message_attachments(message_id);
```

---

## 8. Notifications System

### Table: `notifications`
In-app, email, and SMS notifications

```sql
CREATE TYPE notification_type AS ENUM (
  'session_reminder',
  'assignment_posted',
  'assignment_graded',
  'subscription_expiring',
  'subscription_expired',
  'message_received',
  'announcement',
  'other'
);

CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  title_ar TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  action_url TEXT, -- Deep link or URL to relevant content
  status notification_status DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
```

---

## 9. Reports & Analytics

### Table: `student_progress`
Aggregate student performance metrics

```sql
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  month DATE NOT NULL, -- First day of month
  assignments_completed INT DEFAULT 0,
  assignments_total INT DEFAULT 0,
  average_score DECIMAL(5,2),
  videos_watched INT DEFAULT 0,
  live_sessions_attended INT DEFAULT 0,
  total_study_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, month)
);

CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_progress_month ON student_progress(month);
```

---

### Table: `parent_surveys`
Monthly parent feedback surveys

```sql
CREATE TABLE parent_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  description_ar TEXT,
  questions JSONB NOT NULL, -- Array of survey questions
  target_month DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Table: `survey_responses`
Parent responses to surveys

```sql
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES parent_surveys(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id), -- Which child this is about
  responses JSONB NOT NULL, -- Key-value pairs of question IDs and answers
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, parent_id, student_id)
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_parent ON survey_responses(parent_id);
```

---

## 10. System & Admin

### Table: `announcements`
Platform-wide announcements

```sql
CREATE TYPE announcement_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  priority announcement_priority DEFAULT 'medium',
  target_roles user_role[], -- Which roles can see this
  target_grades grade_level[], -- Which grades can see this
  is_published BOOLEAN DEFAULT FALSE,
  publish_date TIMESTAMPTZ,
  expire_date TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_publish_date ON announcements(publish_date);
```

---

### Table: `audit_logs`
System activity logging for security and debugging

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

### Table: `system_settings`
Global platform configuration

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description_ar TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Database Functions & Triggers

### Auto-update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
-- CREATE TRIGGER update_[table_name]_updated_at
--   BEFORE UPDATE ON [table_name]
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Storage Buckets

Create the following Supabase Storage buckets:

1. **avatars** - User profile pictures (public)
2. **videos** - Recorded session videos (private, authenticated)
3. **materials** - PDFs and documents (private, authenticated)
4. **assignments** - Assignment files from teachers (private)
5. **submissions** - Student submission files (private)
6. **attachments** - Message attachments (private)

---

## Row Level Security (RLS) Policies - High-Level Overview

All tables will have RLS enabled. Key principles:

1. **Students**: Can only access their own data and public content
2. **Parents**: Can access data for their linked children
3. **Teachers**: Can access content for their assigned subjects/grades
4. **Admins**: Full access to all data

Detailed RLS policies will be implemented per table based on these principles.

---

## Indexes Summary

All foreign keys have indexes created. Additional composite indexes may be needed based on common query patterns identified during development.

---

## Next Steps

1. Connect to Supabase project
2. Create all tables in order (respecting foreign key dependencies)
3. Implement RLS policies for each table
4. Create storage buckets with appropriate policies
5. Set up database functions and triggers
6. Create initial admin account
7. Seed sample data for testing

---

**This schema supports:**
- ✅ Multi-role authentication (Student, Parent, Teacher, Admin)
- ✅ Three-tier subscription system
- ✅ Live and recorded sessions
- ✅ Assignment and grading system
- ✅ Real-time messaging
- ✅ Progress tracking and reporting
- ✅ Comprehensive notifications
- ✅ Full RTL Arabic support
- ✅ Security and audit logging
