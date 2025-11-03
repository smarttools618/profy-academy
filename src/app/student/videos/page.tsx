'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Play, Download, Eye, Clock, BookOpen, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface RecordedVideo {
  id: string;
  title_ar: string;
  description_ar: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  subject_name: string;
  chapter_name: string | null;
  teacher_name: string;
  view_count: number | null;
  is_downloadable: boolean;
  recording_date: string | null;
}

interface FilterOptions {
  subject: string;
  grade: string;
  searchQuery: string;
}

export default function RecordedVideosPage() {
  const { user, profile, loading } = useAuth();
  const [videos, setVideos] = useState<RecordedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<RecordedVideo[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    subject: '',
    grade: '',
    searchQuery: '',
  });

  useEffect(() => {
    if (user && profile?.role === 'student') {
      fetchVideos();
      fetchSubjects();
    }
  }, [user, profile]);

  useEffect(() => {
    applyFilters();
  }, [filters, videos]);

  const fetchVideos = async () => {
    setLoadingData(true);
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
          profiles!recorded_sessions_teacher_id_fkey (full_name_ar)
        `)
        .eq('is_active', true)
        .order('recording_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setVideos(
          data.map((v: any) => ({
            id: v.id,
            title_ar: v.title_ar,
            description_ar: v.description_ar,
            video_url: v.video_url,
            thumbnail_url: v.thumbnail_url,
            duration_seconds: v.duration_seconds,
            subject_name: v.subjects?.name_ar || 'غير محدد',
            chapter_name: v.chapters?.name_ar || null,
            teacher_name: v.profiles?.full_name_ar || 'غير محدد',
            view_count: v.view_count,
            is_downloadable: v.is_downloadable || false,
            recording_date: v.recording_date,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingData(false);
    }
  };

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

  const applyFilters = () => {
    let filtered = [...videos];

    if (filters.subject) {
      filtered = filtered.filter((v) => v.subject_name === filters.subject);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.title_ar.toLowerCase().includes(query) ||
          v.description_ar?.toLowerCase().includes(query) ||
          v.teacher_name.toLowerCase().includes(query)
      );
    }

    setFilteredVideos(filtered);
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

  if (!user || profile?.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>
              هذه الصفحة متاحة للطلاب فقط
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
        <h1 className="text-3xl font-bold mb-2">مكتبة الفيديوهات المسجلة</h1>
        <p className="text-muted-foreground">شاهد وراجع الحصص المسجلة في أي وقت</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن فيديو..."
                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>

            {/* Subject Filter */}
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            >
              <option value="">كل المواد</option>
              {subjects
                .filter((s) => s.grade_level === profile?.grade_level)
                .map((subject) => (
                  <option key={subject.id} value={subject.name_ar}>
                    {subject.name_ar}
                  </option>
                ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => setFilters({ subject: '', grade: '', searchQuery: '' })}
            >
              <Filter className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفيديوهات</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredVideos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المواد المتاحة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredVideos.map((v) => v.subject_name)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredVideos.reduce((sum, v) => sum + (v.view_count || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوقت الإجمالي</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(
                filteredVideos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / 3600
              )}
              <span className="text-sm font-normal"> ساعة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">لا توجد فيديوهات</h3>
            <p className="text-muted-foreground text-center">
              لم يتم العثور على فيديوهات تطابق معايير البحث
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative bg-secondary h-48">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title_ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="h-16 w-16 text-muted-foreground opacity-30" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration_seconds)}
                </div>
              </div>

              {/* Content */}
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{video.title_ar}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {video.description_ar || 'لا يوجد وصف'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{video.subject_name}</span>
                    {video.chapter_name && <span>• {video.chapter_name}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>المعلم: {video.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{video.view_count || 0} مشاهدة</span>
                    <span>• {formatDate(video.recording_date)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/student/videos/${video.id}`} className="flex-1">
                    <Button className="w-full">
                      <Play className="ml-2 h-4 w-4" />
                      مشاهدة
                    </Button>
                  </Link>
                  {video.is_downloadable && (
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
