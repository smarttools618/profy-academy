'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, getGradeName } from '@/lib/utils';
import SubscriptionAlert from '@/components/SubscriptionAlert';

interface Subject {
  id: string;
  name_ar: string;
  color_hex: string;
}

interface LiveSession {
  id: string;
  title_ar: string;
  scheduled_start: string;
  subject: Subject;
}

interface Assignment {
  id: string;
  title_ar: string;
  due_date: string;
  subject: Subject;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/login');
      return;
    }

    if (profile && profile.role !== 'student') {
      // Redirect to appropriate dashboard
      router.push(`/${profile.role}/dashboard`);
      return;
    }

    if (profile) {
      fetchDashboardData();
    }
  }, [profile, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch subjects for student's grade
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('grade_level', profile?.grade_level)
        .eq('is_active', true)
        .order('display_order');

      setSubjects(subjectsData || []);

      // Fetch upcoming live sessions
      const { data: sessionsData } = await supabase
        .from('live_sessions')
        .select(`
          id,
          title_ar,
          scheduled_start,
          subjects (
            id,
            name_ar,
            color_hex
          )
        `)
        .eq('grade_level', profile?.grade_level)
        .eq('status', 'scheduled')
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start')
        .limit(5);

      setUpcomingSessions(sessionsData?.map(s => ({
        ...s,
        subject: s.subjects as unknown as Subject
      })) || []);

      // Fetch pending assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`
          id,
          title_ar,
          due_date,
          subjects (
            id,
            name_ar,
            color_hex
          )
        `)
        .eq('grade_level', profile?.grade_level)
        .eq('is_published', true)
        .gte('due_date', new Date().toISOString())
        .order('due_date')
        .limit(5);

      setPendingAssignments(assignmentsData?.map(a => ({
        ...a,
        subject: a.subjects as unknown as Subject
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">مرحباً، {profile.full_name_ar}</h1>
              <p className="text-muted-foreground mt-1">
                {getGradeName(profile.grade_level!)}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/student/profile')}>
              الملف الشخصي
            </Button>
          </div>
        </div>
      </header>

      {/* Subscription Alert */}
      <div className="container-custom pt-6">
        <SubscriptionAlert />
      </div>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المواد الدراسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{subjects.length}</div>
              <p className="text-sm text-muted-foreground mt-1">مادة متاحة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الحصص القادمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{upcomingSessions.length}</div>
              <p className="text-sm text-muted-foreground mt-1">حصة مباشرة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الواجبات المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{pendingAssignments.length}</div>
              <p className="text-sm text-muted-foreground mt-1">واجب مطلوب</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">المواد الدراسية</h2>
              <Button variant="ghost" onClick={() => router.push('/student/subjects')}>
                عرض الكل ←
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.slice(0, 6).map((subject) => (
                <Card
                  key={subject.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/student/subjects/${subject.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: subject.color_hex }}
                      >
                        {subject.name_ar[0]}
                      </div>
                      <CardTitle className="text-lg">{subject.name_ar}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">الحصص المباشرة القادمة</h2>
              <Button variant="ghost" onClick={() => router.push('/student/sessions')}>
                عرض الكل ←
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      لا توجد حصص مباشرة قادمة حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{session.title_ar}</CardTitle>
                          <CardDescription className="mt-1">
                            {session.subject?.name_ar}
                          </CardDescription>
                        </div>
                        <Button size="sm">انضم</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📅 {formatDate(session.scheduled_start)}</span>
                        <span>🕐 {formatTime(session.scheduled_start)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">الواجبات المطلوبة</h2>
              <Button variant="ghost" onClick={() => router.push('/student/assignments')}>
                عرض الكل ←
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignments.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      لا توجد واجبات مطلوبة حالياً
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingAssignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{assignment.title_ar}</CardTitle>
                      <CardDescription>{assignment.subject?.name_ar}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          📅 الموعد النهائي: {formatDate(assignment.due_date)}
                        </span>
                        <Button size="sm" variant="outline">
                          حل الواجب
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/student/library')}
            >
              <span className="text-2xl">📚</span>
              <span>مكتبة الفيديو</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/student/progress')}
            >
              <span className="text-2xl">📊</span>
              <span>تقدمي</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/student/messages')}
            >
              <span className="text-2xl">💬</span>
              <span>الرسائل</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => router.push('/student/subscription')}
            >
              <span className="text-2xl">⭐</span>
              <span>اشتراكي</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
