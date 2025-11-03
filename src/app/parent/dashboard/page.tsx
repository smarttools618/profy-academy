'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, FileText, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface StudentData {
  id: string;
  full_name_ar: string;
  grade_level: string;
  avatar_url: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
}

interface UpcomingSession {
  id: string;
  title_ar: string;
  scheduled_start: string;
  subject_name: string;
}

interface RecentAssignment {
  id: string;
  title_ar: string;
  due_date: string;
  subject_name: string;
  status: string | null;
  score: number | null;
}

export default function ParentDashboard() {
  const { user, profile, loading } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'parent') {
      fetchLinkedStudents();
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchLinkedStudents = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        return;
      }

      const { data: links, error } = await supabase
        .from('student_parent_links')
        .select(`
          student_id,
          profiles!student_parent_links_student_id_fkey (
            id,
            full_name_ar,
            grade_level,
            avatar_url
          )
        `)
        .eq('parent_id', user?.id);

      if (error) throw error;

      if (links && links.length > 0) {
        const studentsData: StudentData[] = await Promise.all(
          links.map(async (link: any) => {
            const studentProfile = link.profiles;
            
            // Fetch subscription status
            const { data: subscription } = await supabase!
              .from('subscriptions')
              .select('status, end_date')
              .eq('student_id', studentProfile.id)
              .eq('status', 'active')
              .single();

            return {
              id: studentProfile.id,
              full_name_ar: studentProfile.full_name_ar,
              grade_level: studentProfile.grade_level,
              avatar_url: studentProfile.avatar_url,
              subscription_status: (subscription as any)?.status || null,
              subscription_end_date: (subscription as any)?.end_date || null,
            };
          })
        );

        setStudents(studentsData);
        if (studentsData.length > 0) {
          setSelectedStudent(studentsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentData = async (studentId: string) => {
    setLoadingData(true);
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        setLoadingData(false);
        return;
      }

      // Fetch upcoming sessions
      const { data: sessions } = await supabase
        .from('live_sessions')
        .select(`
          id,
          title_ar,
          scheduled_start,
          subjects (name_ar)
        `)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(5);

      if (sessions) {
        setUpcomingSessions(
          sessions.map((s: any) => ({
            id: s.id,
            title_ar: s.title_ar,
            scheduled_start: s.scheduled_start,
            subject_name: s.subjects?.name_ar || 'غير محدد',
          }))
        );
      }

      // Fetch recent assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          id,
          title_ar,
          due_date,
          subjects (name_ar),
          student_submissions!left (
            status,
            score
          )
        `)
        .eq('student_submissions.student_id', studentId)
        .order('due_date', { ascending: false })
        .limit(5);

      if (assignments) {
        setRecentAssignments(
          assignments.map((a: any) => ({
            id: a.id,
            title_ar: a.title_ar,
            due_date: a.due_date,
            subject_name: a.subjects?.name_ar || 'غير محدد',
            status: a.student_submissions?.[0]?.status || null,
            score: a.student_submissions?.[0]?.score || null,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getGradeLevelArabic = (gradeLevel: string) => {
    const levels: { [key: string]: string } = {
      grade_5: 'السنة الخامسة',
      grade_6: 'السنة السادسة',
      grade_7: 'السنة السابعة',
    };
    return levels[gradeLevel] || gradeLevel;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-yellow-600">قيد الانتظار</span>;
    
    const statusMap: { [key: string]: { text: string; color: string } } = {
      submitted: { text: 'تم التسليم', color: 'text-blue-600' },
      graded: { text: 'تم التصحيح', color: 'text-green-600' },
      late: { text: 'متأخر', color: 'text-red-600' },
    };
    
    const statusInfo = statusMap[status] || { text: status, color: 'text-gray-600' };
    return <span className={statusInfo.color}>{statusInfo.text}</span>;
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

  if (!user || profile?.role !== 'parent') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>
              هذه الصفحة متاحة لأولياء الأمور فقط
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

  if (students.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">لوحة تحكم ولي الأمر</h1>
        <Card>
          <CardHeader>
            <CardTitle>لا يوجد طلاب مرتبطين</CardTitle>
            <CardDescription>
              لم يتم ربط حسابك بأي طالب بعد. يرجى التواصل مع الإدارة لربط حسابك بحسابات أبنائك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <MessageSquare className="ml-2 h-4 w-4" />
              التواصل مع الدعم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">مرحباً، {profile?.full_name_ar}</h1>
        <p className="text-muted-foreground">متابعة التقدم الأكاديمي لأبنائك</p>
      </div>

      {/* Student Selector */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap">
          {students.map((student) => (
            <Button
              key={student.id}
              variant={selectedStudent?.id === student.id ? 'default' : 'outline'}
              onClick={() => setSelectedStudent(student)}
              className="h-auto p-4"
            >
              <div className="text-right">
                <div className="font-semibold">{student.full_name_ar}</div>
                <div className="text-xs opacity-80">
                  {getGradeLevelArabic(student.grade_level)}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حالة الاشتراك</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedStudent.subscription_status === 'active' ? 'نشط' : 'غير نشط'}
                </div>
                {selectedStudent.subscription_end_date && (
                  <p className="text-xs text-muted-foreground">
                    ينتهي في {formatDate(selectedStudent.subscription_end_date)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحصص القادمة</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingSessions.length}</div>
                <p className="text-xs text-muted-foreground">حصة مجدولة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الواجبات</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentAssignments.length}</div>
                <p className="text-xs text-muted-foreground">واجب حالي</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المتوسط العام</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentAssignments.filter((a) => a.score).length > 0
                    ? Math.round(
                        recentAssignments
                          .filter((a) => a.score)
                          .reduce((sum, a) => sum + (a.score || 0), 0) /
                          recentAssignments.filter((a) => a.score).length
                      )
                    : '-'}
                </div>
                <p className="text-xs text-muted-foreground">من 100</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>الحصص القادمة</CardTitle>
                <CardDescription>جدول الحصص المباشرة القادمة</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد حصص مجدولة حالياً</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{session.title_ar}</h4>
                          <p className="text-sm text-muted-foreground">{session.subject_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(session.scheduled_start)}
                          </p>
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
                <CardDescription>متابعة تسليم وتقييم الواجبات</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAssignments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد واجبات حالياً</p>
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
                            <span className="text-xs">{getStatusBadge(assignment.status)}</span>
                            {assignment.score !== null && (
                              <span className="text-sm font-bold text-primary">
                                {assignment.score}/100
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <Link href="/parent/monthly-survey">
              <Button variant="outline">
                <FileText className="ml-2 h-4 w-4" />
                الاستبيان الشهري
              </Button>
            </Link>
            <Link href="/parent/messages">
              <Button variant="outline">
                <MessageSquare className="ml-2 h-4 w-4" />
                الرسائل
              </Button>
            </Link>
            <Link href={`/parent/students/${selectedStudent.id}/performance`}>
              <Button variant="outline">
                <TrendingUp className="ml-2 h-4 w-4" />
                تقرير الأداء التفصيلي
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
