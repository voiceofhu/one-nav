'use client';

import pkg from '../../../../package.json';

const LINKS = [
  { label: '官方网站', href: 'https://onenav.h06i.com' },
  { label: 'GitHub', href: 'https://github.com/voiceofhu/one-nav' },
  { label: '反馈与支持', href: 'https://github.com/voiceofhu/one-nav/issues' },
];

export function AboutSection() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-lg bg-white px-5 py-5 shadow-sm ring-1 ring-black/5">
        <div>
          <h2 className="text-base font-semibold">关于</h2>
          <p className="text-xs text-muted-foreground">当前扩展是最新版本。</p>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">版本号</dt>
            <dd>{pkg.version}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">说明</dt>
            <dd>{pkg.seo?.title ?? 'OneNav'}</dd>
          </div>
        </dl>

        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">资源链接</div>
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg bg-primary/5 px-5 py-5 text-xs text-muted-foreground shadow-sm ring-1 ring-primary/10">
        OneNav
        仍在积极迭代，我们正在陆续加入多端同步、脚本自动化、团队分享等功能。如果你有任何想法，欢迎通过上方链接联系我们。
      </section>
    </div>
  );
}
