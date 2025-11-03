'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Subject {
  id: string;
  name_ar: string;
  grade_level: string;
}

interface Chapter {
  id: string;
  name_ar: string;
}

interface Lesson {
  id: string;
  name_ar: string;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [formData, setFormData] = useState({
    title_ar: '',
    description_ar: '',
    subject_id: '',
    chapter_id: '',
    lesson_id: '',
    grade_level: 'grade_5' as 'grade_5' | 'grade_6' | 'grade_7',
    scheduled_start: '',
    scheduled_end: '',
    meeting_platform: 'google_meet' as 'google_meet' | 'zoom',
    meeting_url: '',
    meeting_id: '',
    meeting_password: '',
    max_participants: 50,
    required_plan_level: '',
  });

  useEffect(() => {
    if (user && profile?.role === 'teacher') {
      fetchSubjects();
    }
  }, [user, profile]);

  useEffect(() => {
    if (formData.subject_id) {
      fetchChapters(formData.subject_id);
    } else {
      setChapters([]);
      setLessons([]);
    }
  }, [formData.subject_id]);

  useEffect(() => {
    if (formData.chapter_id) {
      fetchLessons(formData.chapter_id);
    } else {
      setLessons([]);
    }
  }, [formData.chapter_id]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name_ar, grade_level')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, name_ar')
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setChapters(data);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchLessons = async (chapterId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, name_ar')
        .eq('chapter_id', chapterId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!formData.title_ar || !formData.scheduled_start || !formData.scheduled_end) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      if (!formData.meeting_url) {
        setError('يرجى إدخال رابط الاجتماع');
        return;
      }

      if (new Date(formData.scheduled_start) >= new Date(formData.scheduled_end)) {
        setError('وقت النهاية يجب أن يكون بعد وقت البداية');
        return;
      }

      const sessionData = {
        title_ar: formData.title_ar,
        description_ar: formData.description_ar || null,
        subject_id: formData.subject_id || null,
        chapter_id: formData.chapter_id || null,
        lesson_id: formData.lesson_id || null,
        teacher_id: user?.id,
        grade_level: formData.grade_level,
        scheduled_start: formData.scheduled_start,
        scheduled_end: formData.scheduled_end,
        status: 'scheduled',
        meeting_platform: formData.meeting_platform,
        meeting_url: formData.meeting_url,
        meeting_id: formData.meeting_id || null,
        meeting_password: formData.meeting_password || null,
        max_participants: formData.max_participants,
        required_plan_level: formData.required_plan_level || null,
        reminder_sent: false,
        created_by: user?.id,
      };

      const { data, error: insertError } = await supabase
        .from('live_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to sessions list
      router.push(`/teacher/dashboard`);
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء الحصة');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
            <CardDescription>هذه الصفحة متاحة للمعلمين فقط</CardDescription>
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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/teacher/dashboard">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowRight className="h-4 w-4" />
            العودة للوحة التحكم
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">جدولة حصة مباشرة جديدة</h1>
        <p className="text-muted-foreground">قم بإنشاء حصة مباشرة للطلاب</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الحصة</CardTitle>
          <CardDescription>املأ المعلومات التالية لجدولة الحصة</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الحصة *</label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="مثال: حصة الرياضيات - الفصل الأول"
                required
                disabled={isLoading}
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium mb-2">المستوى الدراسي *</label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value as any })}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isLoading}
              >
                <option value="grade_5">السنة الخامسة</option>
                <option value="grade_6">السنة السادسة</option>
                <option value="grade_7">السنة السابعة</option>
              </select>
            </div>

            {/* Subject, Chapter, Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">المادة</label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value, chapter_id: '', lesson_id: '' })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                >
                  <option value="">اختر المادة (اختياري)</option>
                  {subjects
                    .filter((s) => s.grade_level === formData.grade_level)
                    .map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name_ar}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الفصل</label>
                <select
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value, lesson_id: '' })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading || !formData.subject_id}
                >
                  <option value="">اختر الفصل (اختياري)</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الدرس</label>
                <select
                  value={formData.lesson_id}
                  onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading || !formData.chapter_id}
                >
                  <option value="">اختر الدرس (اختياري)</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">وصف الحصة</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-24"
                placeholder="أدخل وصف الحصة وما سيتم شرحه..."
                disabled={isLoading}
              />
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">وقت البداية *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">وقت النهاية *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Meeting Platform */}
            <div>
              <label className="block text-sm font-medium mb-2">منصة الاجتماع *</label>
              <select
                value={formData.meeting_platform}
                onChange={(e) => setFormData({ ...formData, meeting_platform: e.target.value as any })}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isLoading}
              >
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>

            {/* Meeting Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">رابط الاجتماع *</label>
                <input
                  type="url"
                  value={formData.meeting_url}
                  onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">معرف الاجتماع</label>
                  <input
                    type="text"
                    value={formData.meeting_id}
                    onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="اختياري"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور</label>
                  <input
                    type="text"
                    value={formData.meeting_password}
                    onChange={(e) => setFormData({ ...formData, meeting_password: e.target.value })}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="اختياري"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Max Participants and Plan Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الحد الأقصى للمشاركين</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min="1"
                  max="500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">مستوى الاشتراك المطلوب</label>
                <select
                  value={formData.required_plan_level}
                  onChange={(e) => setFormData({ ...formData, required_plan_level: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                >
                  <option value="">متاح للجميع</option>
                  <option value="basic">Basic فقط</option>
                  <option value="standard">Standard وأعلى</option>
                  <option value="premium">Premium فقط</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                    جاري الجدولة...
                  </>
                ) : (
                  <>
                    <Calendar className="ml-2 h-4 w-4" />
                    جدولة الحصة
                  </>
                )}
              </Button>
              <Link href="/teacher/dashboard">
                <Button type="button" variant="outline" disabled={isLoading}>
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
