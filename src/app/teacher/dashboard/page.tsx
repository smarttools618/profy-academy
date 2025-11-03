'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Calendar, FileText, Users, Clock, BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

interface UpcomingSession {
  id: string;
  title_ar: string;
  scheduled_start: string;
  scheduled_end: string;
  subject_name: string;
  participant_count: number;
  status: string;
}

interface RecentAssignment {
  id: string;
  title_ar: string;
  due_date: string;
  subject_name: string;
  submission_count: number;
  total_students: number;
}

interface TeacherStats {
  totalSessions: number;
  upcomingSessions: number;
  totalAssignments: number;
  pendingGrading: number;
  totalStudents: number;
  recordedVideos: number;
}

export default function TeacherDashboard() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalSessions: 0,
    upcomingSessions: 0,
    totalAssignments: 0,
    pendingGrading: 0,
    totalStudents: 0,
    recordedVideos: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'teacher') {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch upcoming sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('live_sessions')
        .select(`
          id,
          title_ar,
          scheduled_start,
          scheduled_end,
          status,
          subjects (name_ar),
          session_participants (count)
        `)
        .eq('teacher_id', user?.id)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(5);

      if (!sessionsError && sessions) {
        setUpcomingSessions(
          sessions.map((s: any) => ({
            id: s.id,
            title_ar: s.title_ar,
            scheduled_start: s.scheduled_start,
            scheduled_end: s.scheduled_end,
            subject_name: s.subjects?.name_ar || 'غير محدد',
            participant_count: s.session_participants?.length || 0,
            status: s.status || 'scheduled',
          }))
        );
      }

      // Fetch total sessions count
      const { count: totalSessionsCount } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id);

      // Fetch upcoming sessions count
      const { count: upcomingSessionsCount } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id)
        .gte('scheduled_start', new Date().toISOString());

      // Fetch assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title_ar,
          due_date,
          subjects (name_ar),
          student_submissions (count)
        `)
        .eq('created_by', user?.id)
        .order('due_date', { ascending: false })
        .limit(5);

      if (!assignmentsError && assignments) {
        setRecentAssignments(
          assignments.map((a: any) => ({
            id: a.id,
            title_ar: a.title_ar,
            due_date: a.due_date,
            subject_name: a.subjects?.name_ar || 'غير محدد',
            submission_count: a.student_submissions?.length || 0,
            total_students: 0, // Would need to calculate based on grade level
          }))
        );
      }

      // Fetch total assignments count
      const { count: totalAssignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user?.id);

      // Fetch pending grading count
      const { count: pendingGradingCount } = await supabase
        .from('student_submissions')
        .select('*, assignments!inner(*)', { count: 'exact', head: true })
        .eq('assignments.created_by', user?.id)
        .eq('status', 'submitted');

      // Fetch recorded videos count
      const { count: recordedVideosCount } = await supabase
        .from('recorded_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user?.id);

      setStats({
        totalSessions: totalSessionsCount || 0,
        upcomingSessions: upcomingSessionsCount || 0,
        totalAssignments: totalAssignmentsCount || 0,
        pendingGrading: pendingGradingCount || 0,
        totalStudents: 0, // Would need to calculate
        recordedVideos: recordedVideosCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      scheduled: { text: 'مجدولة', color: 'bg-blue-100 text-blue-800' },
      ongoing: { text: 'جارية', color: 'bg-green-100 text-green-800' },
      completed: { text: 'مكتملة', color: 'bg-gray-100 text-gray-800' },
      cancelled: { text: 'ملغاة', color: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'teacher') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>
              هذه الصفحة متاحة للمعلمين فقط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">مرحباً، {profile?.full_name_ar}</h1>
        <p className="text-muted-foreground">لوحة تحكم المعلم - إدارة الحصص والواجبات</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحصص</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingSessions} قادمة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الواجبات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingGrading} بانتظار التصحيح
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفيديوهات المسجلة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recordedVideos}</div>
            <p className="text-xs text-muted-foreground">فيديو متاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <Link href="/teacher/sessions/create">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء حصة جديدة
          </Button>
        </Link>
        <Link href="/teacher/assignments/create">
          <Button variant="outline">
            <Plus className="ml-2 h-4 w-4" />
            إضافة واجب
          </Button>
        </Link>
        <Link href="/teacher/videos/upload">
          <Button variant="outline">
            <Video className="ml-2 h-4 w-4" />
            رفع فيديو
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>الحصص القادمة</CardTitle>
            <CardDescription>جدول حصصك المباشرة</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد حصص مجدولة</p>
                <Link href="/teacher/sessions/create">
                  <Button variant="outline" className="mt-2">
                    إنشاء حصة جديدة
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold">{session.title_ar}</h4>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{session.subject_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(session.scheduled_start)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {session.participant_count} طالب
                        </span>
                      </div>
                      <div className="mt-2">
                        <Link href={`/teacher/sessions/${session.id}`}>
                          <Button size="sm" variant="outline">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>الواجبات الأخيرة</CardTitle>
            <CardDescription>متابعة تسليم الواجبات</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد واجبات</p>
                <Link href="/teacher/assignments/create">
                  <Button variant="outline" className="mt-2">
                    إضافة واجب جديد
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{assignment.title_ar}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.subject_name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          آخر موعد: {new Date(assignment.due_date).toLocaleDateString('ar-TN')}
                        </span>
                        <span className="text-sm font-semibold">
                          {assignment.submission_count} تسليم
                        </span>
                      </div>
                      <div className="mt-2">
                        <Link href={`/teacher/assignments/${assignment.id}`}>
                          <Button size="sm" variant="outline">
                            مراجعة التسليمات
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Links */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/teacher/students">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Users className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">قائمة الطلاب</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                عرض وإدارة طلابك
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/grading">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FileText className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">التصحيح</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.pendingGrading} واجب بانتظار التصحيح
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teacher/analytics">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <BookOpen className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">التقارير والإحصائيات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                تقارير أداء الطلاب
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
