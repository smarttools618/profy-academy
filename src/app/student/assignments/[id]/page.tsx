'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Assignment {
  id: string;
  title_ar: string;
  description_ar: string | null;
  subject_name: string | null;
  chapter_name: string | null;
  lesson_name: string | null;
  due_date: string;
  total_points: number;
  created_by_name: string;
}

interface Submission {
  id: string;
  submission_text: string | null;
  score: number | null;
  feedback: string | null;
  status: string | null;
  submitted_at: string | null;
  graded_at: string | null;
}

export default function AssignmentSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile?.role === 'student' && params.id) {
      fetchAssignment();
      fetchSubmission();
    }
  }, [user, profile, params.id]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title_ar,
          description_ar,
          due_date,
          total_points,
          subjects (name_ar),
          chapters (name_ar),
          lessons (name_ar),
          profiles!assignments_created_by_fkey (full_name_ar)
        `)
        .eq('id', params.id)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      if (data) {
        setAssignment({
          id: data.id,
          title_ar: data.title_ar,
          description_ar: data.description_ar,
          subject_name: (data.subjects as any)?.name_ar || null,
          chapter_name: (data.chapters as any)?.name_ar || null,
          lesson_name: (data.lessons as any)?.name_ar || null,
          due_date: data.due_date,
          total_points: data.total_points || 100,
          created_by_name: (data.profiles as any)?.full_name_ar || 'المعلم',
        });
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('*')
        .eq('assignment_id', params.id)
        .eq('student_id', user?.id)
        .single();

      if (data) {
        setSubmission(data);
        setSubmissionText(data.submission_text || '');
      }
    } catch (error) {
      // No submission yet is okay
      console.log('No submission found');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!submissionText.trim()) {
        setError('يرجى كتابة إجابتك قبل التسليم');
        return;
      }

      const now = new Date().toISOString();
      const isLate = assignment && new Date(assignment.due_date) < new Date();

      if (submission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('student_submissions')
          .update({
            submission_text: submissionText,
            submitted_at: now,
            status: isLate ? 'late' : 'submitted',
          })
          .eq('id', submission.id);

        if (updateError) throw updateError;
      } else {
        // Create new submission
        const { error: insertError } = await supabase
          .from('student_submissions')
          .insert({
            assignment_id: params.id,
            student_id: user?.id,
            submission_text: submissionText,
            submitted_at: now,
            status: isLate ? 'late' : 'submitted',
          });

        if (insertError) throw insertError;
      }

      // Refresh submission data
      await fetchSubmission();
      setError(null);
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'حدث خطأ أثناء تسليم الواجب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = assignment ? new Date(assignment.due_date) < new Date() : false;
  const isSubmitted = submission ? !!submission.submitted_at : false;
  const isGraded = submission ? submission.status === 'graded' : false;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>هذه الصفحة متاحة للطلاب فقط</CardDescription>
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

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الواجب غير موجود</CardTitle>
            <CardDescription>لم نتمكن من العثور على هذا الواجب</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/dashboard">
              <Button>العودة للوحة التحكم</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/student/dashboard">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowRight className="h-4 w-4" />
            العودة للوحة التحكم
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">{assignment.title_ar}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>المعلم: {assignment.created_by_name}</span>
          {assignment.subject_name && <span>• {assignment.subject_name}</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الواجب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.description_ar ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{assignment.description_ar}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">لا يوجد وصف لهذا الواجب</p>
              )}

              {assignment.chapter_name && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">الفصل: {assignment.chapter_name}</p>
                  {assignment.lesson_name && (
                    <p className="text-sm text-muted-foreground">الدرس: {assignment.lesson_name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grading Result */}
          {isGraded && submission && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  تم التصحيح
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الدرجة</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {submission.score} / {assignment.total_points}
                  </p>
                </div>
                {submission.feedback && (
                  <div>
                    <p className="text-sm font-medium mb-1">ملاحظات المعلم:</p>
                    <p className="text-sm whitespace-pre-wrap bg-background/50 p-3 rounded-lg">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          {!isGraded && (
            <Card>
              <CardHeader>
                <CardTitle>إجابتك</CardTitle>
                <CardDescription>
                  {isSubmitted
                    ? 'يمكنك تعديل إجابتك قبل انتهاء الموعد'
                    : 'قم بكتابة إجابتك وتسليم الواجب'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-64"
                      placeholder="اكتب إجابتك هنا..."
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isOverdue}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                          جاري التسليم...
                        </>
                      ) : isSubmitted ? (
                        'تحديث الإجابة'
                      ) : (
                        'تسليم الواجب'
                      )}
                    </Button>
                  </div>

                  {isSubmitted && submission && (
                    <p className="text-sm text-muted-foreground text-center">
                      آخر تسليم: {formatDate(submission.submitted_at!)}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">آخر موعد للتسليم</p>
                <p className="font-semibold">{formatDate(assignment.due_date)}</p>
              </div>

              {isOverdue && !isSubmitted && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">تأخر عن الموعد</p>
                </div>
              )}

              {isSubmitted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    {isGraded ? 'تم التصحيح' : 'تم التسليم'}
                  </p>
                </div>
              )}

              {!isSubmitted && !isOverdue && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <p className="text-sm font-medium">قيد الانتظار</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">الدرجة الكلية</p>
                <p className="text-2xl font-bold text-primary">{assignment.total_points}</p>
              </div>
            </CardContent>
          </Card>

          {/* Files Card (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المرفقات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد مرفقات
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
