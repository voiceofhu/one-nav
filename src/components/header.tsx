import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <img
              src="/header.png"
              alt="OneNav Logo"
              className="h-9 rounded-md"
            />
            {/* <span className="font-semibold text-xl">OneNav</span> */}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/privacy">隐私政策</Link>
          </Button>
          <Button className="rounded-full px-6" asChild>
            <a href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl">
              <Chrome className="mr-2 h-4 w-4" />
              安装扩展
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
