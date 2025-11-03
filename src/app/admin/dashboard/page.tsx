'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Video, FileText, CreditCard, TrendingUp, Settings, Database, Shield } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalTeachers: number;
  activeSubscriptions: number;
  totalSessions: number;
  totalVideos: number;
  totalAssignments: number;
}

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalTeachers: 0,
    activeSubscriptions: 0,
    totalSessions: 0,
    totalVideos: 0,
    totalAssignments: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, profile]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client not available');
        setLoadingData(false);
        return;
      }

      // Fetch user statistics
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: parentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'parent');

      const { count: teachersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      // Fetch subscription statistics
      const { count: activeSubscriptionsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch session statistics
      const { count: totalSessionsCount } = await supabase
        .from('live_sessions')
        .select('*', { count: 'exact', head: true });

      // Fetch video statistics
      const { count: totalVideosCount } = await supabase
        .from('recorded_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch assignment statistics
      const { count: totalAssignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true });

      // Fetch recent users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name_ar, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsersCount || 0,
        totalStudents: studentsCount || 0,
        totalParents: parentsCount || 0,
        totalTeachers: teachersCount || 0,
        activeSubscriptions: activeSubscriptionsCount || 0,
        totalSessions: totalSessionsCount || 0,
        totalVideos: totalVideosCount || 0,
        totalAssignments: totalAssignmentsCount || 0,
      });

      setRecentUsers(users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      student: 'طالب',
      parent: 'ولي أمر',
      teacher: 'معلم',
      admin: 'مدير',
    };
    return roles[role] || role;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'short',
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

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">غير مصرح</CardTitle>
            <CardDescription>
              هذه الصفحة متاحة للمديرين فقط
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
        <h1 className="text-3xl font-bold mb-2">لوحة تحكم المدير</h1>
        <p className="text-muted-foreground">إدارة ومراقبة المنصة بالكامل</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <div className="text-xs text-muted-foreground mt-2">
              <div>طلاب: {stats.totalStudents}</div>
              <div>معلمين: {stats.totalTeachers}</div>
              <div>أولياء أمور: {stats.totalParents}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاشتراكات النشطة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              من {stats.totalStudents} طالب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحصص والفيديوهات</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions + stats.totalVideos}</div>
            <div className="text-xs text-muted-foreground mt-2">
              <div>حصص مباشرة: {stats.totalSessions}</div>
              <div>فيديوهات: {stats.totalVideos}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الواجبات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">واجب منشور</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Link href="/admin/users">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Users className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">إدارة المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                إضافة وتعديل المستخدمين
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/subscriptions">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CreditCard className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">إدارة الاشتراكات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                تفعيل وتجديد الاشتراكات
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Database className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">إدارة المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                المواد والدروس والفصول
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Settings className="h-5 w-5 text-primary ml-2" />
              <CardTitle className="text-base">الإعدادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                إعدادات النظام
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Users */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المستخدمون الجدد</CardTitle>
            <CardDescription>آخر المستخدمين المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                لا يوجد مستخدمون جدد
              </p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{user.full_name_ar}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-left">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {getRoleLabel(user.role)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>صحة النظام</CardTitle>
            <CardDescription>حالة الخدمات والأنظمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>قاعدة البيانات</span>
                </div>
                <span className="text-green-600 font-semibold">نشط</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>المصادقة</span>
                </div>
                <span className="text-green-600 font-semibold">نشط</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>التخزين</span>
                </div>
                <span className="text-green-600 font-semibold">نشط</span>
              </div>

              <Link href="/admin/logs">
                <Button variant="outline" className="w-full mt-2">
                  عرض السجلات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Link */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            التقارير والإحصائيات
          </CardTitle>
          <CardDescription>
            عرض تقارير مفصلة عن أداء المنصة واستخدامها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href="/admin/analytics/users">
              <Button variant="outline">تقرير المستخدمين</Button>
            </Link>
            <Link href="/admin/analytics/revenue">
              <Button variant="outline">تقرير الإيرادات</Button>
            </Link>
            <Link href="/admin/analytics/engagement">
              <Button variant="outline">تقرير التفاعل</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
