import pkg from '../../package.json';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/pwa-512x512.png"
                alt=""
                className="size-12 rounded-md"
              />
              {/* <span className="font-semibold">OneNav</span> */}
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              智能书签管理工具，让您的网络世界更有序、更高效。
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <p>
                  由{' '}
                  <a
                    href={pkg.seo.og.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {pkg.seo.og.url}
                  </a>
                  构建
                </p>
                <p>
                  © {new Date().getFullYear()} OneNav. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
