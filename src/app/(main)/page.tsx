import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 mx-auto">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/20 z-0" />
        <div className="container relative z-10 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-[64rem] space-y-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              重新定义
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                书签管理体验
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
              简洁优雅的界面，强大的功能，让您的书签管理体验焕然一新。智能搜索、快速访问，一切尽在掌握。
            </p>
            <div className="flex justify-center gap-6">
              <Button size="lg" className="rounded-full px-8" asChild>
                <a href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl">
                  <Chrome className="mr-2 h-5 w-5" />
                  免费安装
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container py-24 space-y-16">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            为效率而生
          </h2>
          <p className="text-lg leading-8 text-muted-foreground">
            精心打造的功能，让您的浏览体验更加流畅
          </p>
        </div>

        <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
          <div className="group relative bg-background/50 p-8 rounded-3xl transition-all hover:bg-background/80">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 p-3 text-white mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">智能书签管理</h3>
            <p className="text-muted-foreground leading-relaxed">
              支持智能分类、快速编辑、批量操作，让您的书签井然有序。支持完整的导入导出功能，数据随心迁移。
            </p>
          </div>

          <div className="group relative bg-background/50 p-8 rounded-3xl transition-all hover:bg-background/80">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 text-white mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">极速搜索</h3>
            <p className="text-muted-foreground leading-relaxed">
              强大的搜索引擎，支持全文检索、标签过滤、智能建议。快速定位任何书签，让信息触手可及。
            </p>
          </div>

          <div className="group relative bg-background/50 p-8 rounded-3xl transition-all hover:bg-background/80">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">扩展生态</h3>
            <p className="text-muted-foreground leading-relaxed">
              支持 SSH
              远程连接、自定义脚本执行、双因素认证等高级功能，打造专属的效率工作流。
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 dark:bg-slate-900/50">
        <div className="container py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              提升您的浏览体验
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              立即安装 OneNav，开启智能书签管理之旅。完全免费，为所有 Chrome
              用户打造。
            </p>
            <Button size="lg" className="rounded-full px-8" asChild>
              <a href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl">
                <Chrome className="mr-2 h-5 w-5" />
                立即安装
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
