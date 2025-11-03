# 🎓 أكاديمية بروفي | Profy Academy

منصة تعليمية متكاملة للطلاب في السنة الخامسة والسادسة والسابعة

A comprehensive educational platform for 5th, 6th, and 7th grade students in Tunisia.

---

## 📋 Overview

**Profy Academy** is a modern, full-stack educational platform built with:
- **Frontend**: Next.js 14+ with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI**: Tailwind CSS + shadcn/ui (RTL Arabic)
- **Language**: 100% Arabic interface with RTL support

---

## ✨ Key Features

### 👥 User Roles
- **طالب (Student)**: Access courses, watch videos, submit assignments
- **ولي أمر (Parent)**: Monitor children's progress, manage subscriptions
- **معلم (Teacher)**: Create content, grade assignments, conduct live sessions
- **مدير (Admin)**: Full platform management and analytics

### 📚 Core Modules
1. **إدارة الحسابات** - Account Management
   - Multi-role authentication
   - Email and phone login
   - User profiles

2. **نظام الاشتراكات** - Subscription System
   - Three tiers: Profy, Profy+, Profy++
   - Online and manual payments
   - Parent-managed subscriptions

3. **الحصص المباشرة** - Live Sessions
   - Google Meet / Zoom integration
   - Automated notifications (Email, SMS, In-app)
   - Session recording

4. **الحصص المسجلة** - Recorded Sessions
   - Video library organized by subject/grade
   - Progress tracking
   - Downloadable materials

5. **الواجبات والتقييم** - Assignments & Assessments
   - Multiple question types
   - Auto-grading for quizzes
   - Parent progress reports

6. **المتابعة والتواصل** - Communication
   - Real-time messaging
   - Course discussion groups
   - Automated parent reports

7. **لوحة التحكم** - Admin Dashboard
   - User management
   - Content management
   - Analytics and reports

---

## 🏗️ Project Structure

```
profy-academy/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/              # Core utilities
│   ├── hooks/            # Custom hooks
│   ├── stores/           # State management
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge Functions
├── public/               # Static assets
└── tests/                # Test suites
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd profy-academy
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Run database migrations**
```bash
# Connect to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

5. **Start development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with 30+ tables including:

- **User Management**: `profiles`, `student_parent_links`
- **Subscriptions**: `subscription_plans`, `subscriptions`, `payment_transactions`
- **Content**: `subjects`, `chapters`, `lessons`, `recorded_sessions`
- **Live Sessions**: `live_sessions`, `session_participants`
- **Assignments**: `assignments`, `assignment_questions`, `student_submissions`
- **Communication**: `conversations`, `messages`
- **Analytics**: `student_progress`, `video_views`

See [database-schema.md](./database-schema.md) for complete details.

---

## 🔒 Security

### Row Level Security (RLS)
All database tables have RLS policies enforcing:
- Students can only access their own data
- Parents can access their children's data
- Teachers can access their assigned content
- Admins have full access

### Authentication
- Supabase Auth with email/phone support
- Secure password policies
- Email and phone verification
- Role-based access control

### Data Protection
- Input validation with Zod
- XSS protection
- SQL injection prevention (via Supabase)
- Secure file uploads

---

## 🎨 UI/UX Features

### Arabic RTL Support
- Complete right-to-left layout
- Arabic typography (Cairo font family)
- Culturally appropriate design patterns

### Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced experience

### Modern UI Components
- shadcn/ui component library
- Lucide icons
- Smooth animations
- Dark mode support (optional)

---

## 🔌 Integrations

### Payment Gateway
- Stripe integration for online payments
- Manual payment approval by admin

### Video Conferencing
- Google Meet API for live sessions
- Zoom API as alternative

### Notifications
- **Email**: Resend or SendGrid
- **SMS**: Twilio
- **In-app**: Real-time with Supabase

---

## 📱 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email/phone verification

### Payments
- `POST /api/payments/create-intent` - Create payment
- `POST /api/webhooks/stripe` - Stripe webhooks

### Content
- `GET /api/sessions` - List sessions
- `GET /api/assignments` - List assignments
- `POST /api/submissions` - Submit assignment

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy automatically

### Manual Deployment

```bash
# Build production
pnpm build

# Start production server
pnpm start
```

---

## 📈 Performance

- **Lighthouse Score**: 95+ (target)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

---

## 🗺️ Roadmap

### Phase 1: MVP (4 weeks)
- [x] Database schema design
- [ ] Authentication system
- [ ] Basic dashboards for all roles
- [ ] Subscription management
- [ ] Recorded sessions library
- [ ] Assignment system
- [ ] Deployment

### Phase 2: Enhanced Features (4 weeks)
- [ ] Live sessions with video integration
- [ ] Real-time messaging
- [ ] Advanced analytics
- [ ] Mobile app

### Phase 3: Optimization (2 weeks)
- [ ] Performance tuning
- [ ] Security audit
- [ ] User feedback implementation
- [ ] Advanced reporting

---

## 🤝 Contributing

This is a private educational platform project. For internal development:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component documentation

---

## 📖 Documentation

- [Database Schema](./database-schema.md) - Complete database design
- [Architecture](./ARCHITECTURE.md) - Technical architecture
- [API Documentation](./API.md) - API endpoints (coming soon)
- [Deployment Guide](./DEPLOYMENT.md) - Deployment instructions (coming soon)

---

## 🛠️ Tech Stack Details

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Beautiful component library
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **date-fns**: Date manipulation

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions
  - Edge Functions

### DevOps
- **Vercel**: Hosting and deployments
- **GitHub Actions**: CI/CD
- **Sentry**: Error tracking
- **PostHog**: Analytics

---

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check documentation

---

## 📄 License

This project is proprietary and confidential.

---

## 🙏 Acknowledgments

Built with ❤️ for Tunisian students using modern web technologies.

---

**Current Status**: 🟡 In Development

**Last Updated**: 2024
