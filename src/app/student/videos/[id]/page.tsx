'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, Download, Eye, Share2, ChevronDown, ChevronUp, Play } from 'lucide-react';
import Link from 'next/link';

interface VideoData {
  id: string;
  title_ar: string;
  description_ar: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  subject_name: string;
  chapter_name: string | null;
  lesson_name: string | null;
  teacher_name: string;
  view_count: number | null;
  is_downloadable: boolean;
  recording_date: string | null;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [watchProgress, setWatchProgress] = useState(0);

  useEffect(() => {
    if (user && profile?.role === 'student' && params.id) {
      fetchVideo();
      trackView();
    }
  }, [user, profile, params.id]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('recorded_sessions')
        .select(`
          id,
          title_ar,
          description_ar,
          video_url,
          thumbnail_url,
          duration_seconds,
          view_count,
          is_downloadable,
          recording_date,
          subjects (name_ar),
          chapters (name_ar),
          lessons (name_ar),
          profiles!recorded_sessions_teacher_id_fkey (full_name_ar)
        `)
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setVideo({
          id: data.id,
          title_ar: data.title_ar,
          description_ar: data.description_ar,
          video_url: data.video_url,
          thumbnail_url: data.thumbnail_url,
          duration_seconds: data.duration_seconds,
          subject_name: (data.subjects as any)?.name_ar || 'غير محدد',
          chapter_name: (data.chapters as any)?.name_ar || null,
          lesson_name: (data.lessons as any)?.name_ar || null,
          teacher_name: (data.profiles as any)?.full_name_ar || 'غير محدد',
          view_count: data.view_count,
          is_downloadable: data.is_downloadable || false,
          recording_date: data.recording_date,
        });

        // Load saved progress
        const { data: viewData } = await supabase
          .from('video_views')
          .select('last_position_seconds')
          .eq('recorded_session_id', params.id)
          .eq('student_id', user?.id)
          .single();

        if (viewData) {
          setWatchProgress(viewData.last_position_seconds || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      // Check if view record exists
      const { data: existingView } = await supabase
        .from('video_views')
        .select('id')
        .eq('recorded_session_id', params.id)
        .eq('student_id', user?.id)
        .single();

      if (!existingView) {
        // Create new view record
        await supabase.from('video_views').insert({
          recorded_session_id: params.id,
          student_id: user?.id,
          watch_duration_seconds: 0,
          completion_percentage: 0,
          last_position_seconds: 0,
        });

        // Increment view count
        await supabase.rpc('increment_view_count', {
          video_id: params.id,
        });
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const updateProgress = async (currentTime: number, duration: number) => {
    try {
      const percentage = Math.floor((currentTime / duration) * 100);
      
      await supabase
        .from('video_views')
        .update({
          last_position_seconds: Math.floor(currentTime),
          completion_percentage: percentage,
          last_viewed_at: new Date().toISOString(),
          completed: percentage >= 90,
        })
        .eq('recorded_session_id', params.id)
        .eq('student_id', user?.id);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>الفيديو غير موجود</CardTitle>
            <CardDescription>لم نتمكن من العثور على هذا الفيديو</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/videos">
              <Button>العودة إلى المكتبة</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/student/videos">
          <Button variant="ghost" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى المكتبة
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Video Section */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <Card className="overflow-hidden mb-4">
            <div className="relative bg-black aspect-video">
              {/* Placeholder for actual video player */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="mb-4">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title_ar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                        <Play className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/70">
                    مشغل الفيديو - سيتم دمج مشغل فيديو حقيقي هنا
                  </p>
                  <p className="text-xs text-white/50 mt-2">URL: {video.video_url}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{video.title_ar}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration_seconds)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {video.view_count || 0} مشاهدة
                </span>
                <span>{formatDate(video.recording_date)}</span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Actions */}
              <div className="flex gap-2 mb-6">
                {video.is_downloadable && (
                  <Button variant="outline" size="sm">
                    <Download className="ml-2 h-4 w-4" />
                    تحميل
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Share2 className="ml-2 h-4 w-4" />
                  مشاركة
                </Button>
              </div>

              {/* Description */}
              <div>
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center justify-between w-full text-right font-semibold mb-2 hover:text-primary transition-colors"
                >
                  <span>الوصف</span>
                  {showDescription ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {showDescription && (
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {video.description_ar || 'لا يوجد وصف متاح لهذا الفيديو'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الدرس</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">المادة</p>
                <p className="font-semibold">{video.subject_name}</p>
              </div>
              {video.chapter_name && (
                <div>
                  <p className="text-sm text-muted-foreground">الفصل</p>
                  <p className="font-semibold">{video.chapter_name}</p>
                </div>
              )}
              {video.lesson_name && (
                <div>
                  <p className="text-sm text-muted-foreground">الدرس</p>
                  <p className="font-semibold">{video.lesson_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">المعلم</p>
                <p className="font-semibold">{video.teacher_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                المواد المرفقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد مواد مرفقة بهذا الفيديو
              </p>
            </CardContent>
          </Card>

          {/* Progress */}
          {watchProgress > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقدم المشاهدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>آخر موضع</span>
                    <span>{formatDuration(watchProgress)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${video.duration_seconds ? (watchProgress / video.duration_seconds) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
