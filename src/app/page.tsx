import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-6">
          أكاديمية بروفي
        </h1>
        
        <p className="text-2xl text-muted-foreground mb-12">
          منصة تعليمية متكاملة للسنة الخامسة والسادسة والسابعة
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            تسجيل الدخول
          </Link>
          
          <Link
            href="/register"
            className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary/80 transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">حصص مسجلة</h3>
            <p className="text-muted-foreground">
              مكتبة شاملة من الدروس المسجلة لجميع المواد
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold mb-2">حصص مباشرة</h3>
            <p className="text-muted-foreground">
              تفاعل مباشر مع المعلمين عبر الإنترنت
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border border-border">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold mb-2">واجبات وتقييم</h3>
            <p className="text-muted-foreground">
              واجبات تفاعلية مع تصحيح فوري
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
