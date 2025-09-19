'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  Cloud,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import pkg from '../../../package.json';

const heroHighlights = [
  '秒级检索、分组与快捷键联动',
  '导入导出、批量整理一应俱全',
  '扩展 SSH / 脚本 / 2FA 等高级能力',
];

const featureCards = [
  {
    icon: Search,
    title: '一秒找到任意书签',
    description:
      '命令面板 + 键盘快捷键组合，支持标签、URL、描述等多维度模糊搜索，让常用链接从此不再迷路。',
    bullets: ['智能排序权重，常用优先出现', '历史记录与回收站随时可追溯'],
  },
  {
    icon: Zap,
    title: '一站式工作流枢纽',
    description:
      '将 SSH、脚本指令与浏览器操作统一集中。通过自定义动作把常见流程打包，一键触发日常工作流。',
    bullets: ['自定义脚本动作与参数输出', '快捷面板支持拖拽与排序'],
  },
  {
    icon: ShieldCheck,
    title: '隐私优先 + 扩展能力',
    description:
      '默认本地存储，无需账号即可使用。可选的云端加密同步让你的收藏夹在多设备间安全传递。',
    bullets: ['AES 加密存储与传输', '权限分级与操作日志可追踪'],
  },
];

const syncTimeline = [
  {
    icon: RefreshCcw,
    title: '智能差异检测',
    description: '实时监听本地变更，仅上传增量数据，避免重复同步与带宽浪费。',
  },
  {
    icon: Cloud,
    title: '云端自动调度',
    description: '跨时区、跨设备的冲突自动合并，保留清晰的版本历史与恢复节点。',
  },
  {
    icon: ShieldCheck,
    title: '端到端加密守护',
    description: '同步前本地加密，云端仅存密文；设备绑定校验确保资料只属于你。',
  },
];

const pricingTiers = [
  {
    name: '本地基础版',
    price: '￥0',
    subPrice: '永久免费',
    description: '离线可用的书签管理与搜索体验，数据存储在你的设备里。',
    features: ['无限书签与标签', '命令面板与快捷键', '导入导出与备份'],
    cta: {
      label: '立即开始',
      href: '#download',
    },
  },
  {
    name: '云端专业版',
    price: '$0.99',
    subPrice: '每月',
    description: '自动同步、版本管理与跨设备体验，适合多终端办公的团队与个人。',
    features: ['多端自动同步', '端到端加密与历史版本', '自动冲突处理与通知'],
    cta: {
      label: '开通云同步',
      href: '#pricing',
    },
    highlighted: true,
  },
];

export default function Page() {
  const seo = pkg.seo ?? {};
  const keywords: string[] = Array.isArray(seo.keywords)
    ? (seo.keywords.slice(0, 6) as string[])
    : [];

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="animated-gradient" />
        <div className="container relative z-10 mx-auto flex flex-col gap-16 px-6 pb-24 pt-20 lg:flex-row lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex-1"
          >
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
              <Sparkles className="mr-1 size-4" /> 一站式高效书签工作台
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {seo.title ?? 'OneNav — 私人的高效书签中心'}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {seo.description ??
                'OneNav 专注于将书签、脚本与高频操作统一管理，帮你打造快速又安全的浏览工作流。'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {heroHighlights.map((item) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 shadow-sm ring-1 ring-border backdrop-blur"
                >
                  <Check className="size-3.5 text-primary" />
                  {item}
                </motion.span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 py-6 text-base"
                id="download"
              >
                <a
                  href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  立即安装扩展
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base"
              >
                <Link href="#pricing">查看定价策略</Link>
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                本地使用永久免费 · 云端同步仅 $0.99 / 月
              </p>
            </div>
            {keywords.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 text-xs text-muted-foreground/80">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-muted px-3 py-1"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="relative flex-1"
          >
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 shadow-2xl ring-1 ring-black/5 backdrop-blur">
              <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/30 blur-3xl" />
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    命令面板
                  </p>
                  <p className="mt-2 text-lg font-medium text-foreground">
                    ⌘ + K · 立即搜索书签与动作
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                      <span>最近访问 · 设计环境</span>
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                        快捷键
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                      <span>触发部署脚本</span>
                      <span className="text-xs">
                        输入 <code>deploy</code>
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                      <span>连接生产服务器</span>
                      <span className="text-xs">
                        SSH · <code>prod-01</code>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    自动同步概览
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-400" />
                      本地变更已捕获，等待同步 ·{' '}
                      <span className="text-xs text-foreground">+4 项</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-primary" />
                      云端队列正常，延迟{' '}
                      <span className="text-xs text-foreground">240ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="size-4 text-primary" />{' '}
                      端到端加密已启用
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            以效率为核心的全能特性
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            无论是整理个人收藏还是管理团队知识库，OneNav
            都能提供细腻流畅的体验与可扩展的能力。
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ icon: Icon, title, description, bullets }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm ring-1 ring-border/60 backdrop-blur"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {description}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {bullets.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-secondary/30 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              自动同步策略，丝滑无感
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              开启云端专业版后，OneNav
              会按照以下策略在后台守护你的数据，确保多设备协同始终快速而安全。
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {syncTimeline.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative h-full rounded-3xl border border-border/60 bg-background p-6 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            简单透明的定价策略
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            本地方案永久免费，云端专业版仅 $0.99 /
            月，为自动同步、历史版本与团队协作提供足够的弹性空间。
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className={`relative flex h-full flex-col justify-between rounded-3xl border border-border/60 p-8 shadow-sm backdrop-blur ${
                tier.highlighted
                  ? 'bg-primary/10 ring-2 ring-primary/60'
                  : 'bg-background'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  自动同步首选
                </span>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tier.subPrice}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? 'default' : 'outline'}
                className="mt-8 w-full rounded-full"
              >
                {tier.cta.href.startsWith('http') ? (
                  <a
                    href={tier.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tier.cta.label}
                  </a>
                ) : (
                  <Link href={tier.cta.href}>{tier.cta.label}</Link>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-primary text-primary-foreground shadow-lg"
        >
          <div className="relative overflow-hidden rounded-3xl px-8 py-12 sm:px-12">
            <div className="absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6 text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                随时随地，保持工作流的连贯
              </h2>
              <p className="text-base sm:text-lg">
                现在就安装
                OneNav，体验极速书签管理与丝滑的云端同步。开启专业版即可获得
                $0.99/月 的自动同步策略与完整历史版本保障。
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-background px-8 py-6 text-base text-foreground hover:bg-background/90"
                >
                  <a
                    href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    安装 Chrome 扩展
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base text-primary-foreground/90 hover:bg-background/20"
                >
                  <Link href="#pricing">了解定价</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
