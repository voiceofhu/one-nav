'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Chrome as ChromeIcon,
  Cloud,
  Cpu,
  FileText,
  GitBranch,
  PanelsTopLeft,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  UploadCloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';

import pkg from '../../../package.json';

type OptionShowcaseKey = 'general' | 'import-export' | 'about';

interface OptionShowcase {
  key: OptionShowcaseKey;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  accent: string;
  icon: LucideIcon;
}

interface AutomationHighlight {
  key: string;
  title: string;
  description: string;
  command: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}

interface HeroShot {
  src: string;
  alt: string;
  className: string;
  delay: number;
  rotate: number;
}

const automationScriptCount = Object.keys(pkg.scripts ?? {}).length;

const featureCards = [
  {
    icon: Settings2,
    title: '自定义启动仪表板',
    description:
      '在 Options 中为弹出层配置默认视图、详情面板与打开策略，让收藏夹秒变专属仪表盘。',
    accent: 'from-sky-500 via-blue-500 to-indigo-500',
  },
  {
    icon: UploadCloud,
    title: '秒级数据迁移',
    description:
      'JSON 导入导出保留完整层级结构，时间戳命名方便归档，迁移和备份都安心。',
    accent: 'from-teal-500 to-emerald-400',
  },
  {
    icon: Search,
    title: '毫秒级 AI 搜索',
    description:
      '全局检索结合标签、脚本建议与智能提示，常用链接与自动化工作流触手可及。',
    accent: 'from-orange-500 to-rose-500',
  },
  {
    icon: ShieldCheck,
    title: '安全可扩展',
    description:
      '预留 SSH、脚本执行、双因素认证等扩展能力，为未来的团队协作与自动化铺路。',
    accent: 'from-purple-500 to-fuchsia-500',
  },
];

const workflowSteps = [
  {
    title: '采集与整理',
    description:
      '使用 Chrome 扩展一键收藏链接，拖拽分类保持层级清晰，默认视图可随时切换。',
    badge: 'FLOW 1',
  },
  {
    title: '智能管理',
    description:
      'Options 页面定义打开策略、详情面板与显示逻辑，配合快速搜索建立个人知识库。',
    badge: 'FLOW 2',
  },
  {
    title: '分享与扩展',
    description:
      '导出 JSON 或接入脚本与团队共享，自动化同步即将上线，持续升级导航体验。',
    badge: 'FLOW 3',
  },
];

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
    alt: '沉浸式浏览器工作区',
  },
  {
    src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    alt: '信息架构草图',
  },
  {
    src: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=800&q=80',
    alt: '团队效率脑暴',
  },
  {
    src: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
    alt: '自动化脚本执行',
  },
];

const heroShots: HeroShot[] = [
  {
    src: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80',
    alt: '浏览器工作区示意',
    className: 'top-[-5rem] right-[-5rem] w-56 rotate-6',
    delay: 0.3,
    rotate: 6,
  },
  {
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    alt: '开发者终端',
    className: 'bottom-[-4rem] left-[-3rem] w-48 -rotate-6',
    delay: 0.6,
    rotate: -5,
  },
  {
    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    alt: '协同计划板',
    className: 'top-[40%] right-[-8rem] w-44 rotate-3',
    delay: 0.9,
    rotate: 4,
  },
];

const optionsShowcases: OptionShowcase[] = [
  {
    key: 'general',
    label: '基础设置',
    title: '启动视图随心而变',
    description:
      '来自 Options → 基础设置的真实配置，控制弹出层默认打开内容、详情面板与交互策略。',
    bullets: [
      '默认视图：最近添加 / 全部书签 自由切换',
      '新标签页打开书签，保持当前工作区整洁',
      '选中书签时自动展开详情面板，快速编辑元信息',
    ],
    image:
      'https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-sky-500/40 via-blue-500/10 to-transparent',
    icon: SlidersHorizontal,
  },
  {
    key: 'import-export',
    label: '导入导出',
    title: '无损迁移你的书签星图',
    description:
      'Options → 导入 / 导出 让你在数秒内备份或合并 JSON 数据，完整保留层级关系。',
    bullets: [
      '导出文件自动带时间戳，方便版本管理与回滚',
      '导入数据会合并至根目录末尾，不覆盖现有内容',
      '批量迁移后可借助搜索去重、优化标签体系',
    ],
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-emerald-500/40 via-teal-500/10 to-transparent',
    icon: UploadCloud,
  },
  {
    key: 'about',
    label: '关于',
    title: '透明版本与资源导航',
    description:
      'Options → 关于板块同步展示当前版本、SEO 信息与常用链接，确保更新节奏可追踪。',
    bullets: [
      `版本号：${pkg.version}`,
      `SEO 标题：${pkg.seo?.title ?? 'OneNav - 书签管理与快速搜索'}`,
      '资源链接覆盖官网、GitHub 与支持邮箱',
    ],
    image:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-fuchsia-500/40 via-violet-500/10 to-transparent',
    icon: Sparkles,
  },
];

const automationHighlights: AutomationHighlight[] = [
  {
    key: 'dev',
    title: '极速开发模式',
    description: '实时预览弹出层、Options 与主站改动，迭代体验丝滑。',
    command: 'npm run dev',
    detail: pkg.scripts?.dev ?? 'next dev',
    icon: Terminal,
    accent: 'from-emerald-500/30 via-emerald-500/10 to-transparent',
  },
  {
    key: 'build',
    title: '可靠构建',
    description: '生成高性能的 Next.js 产物，为扩展与 Web 端提供基石。',
    command: 'npm run build',
    detail: pkg.scripts?.build ?? 'next build',
    icon: Cpu,
    accent: 'from-blue-500/30 via-blue-500/10 to-transparent',
  },
  {
    key: 'build:ext',
    title: '扩展打包',
    description: '云端与浏览器扩展一次构建完成，减少手动对齐成本。',
    command: 'npm run build:ext',
    detail:
      pkg.scripts?.['build:ext'] ??
      'BUILD_TARGET=extension next build && node scripts/build-ext.mjs',
    icon: ChromeIcon,
    accent: 'from-amber-500/30 via-orange-500/10 to-transparent',
  },
  {
    key: 'deploy',
    title: '一键发布',
    description: 'Cloudflare Pages 与 Workers 同步部署，自动化上线流程。',
    command: 'npm run deploy',
    detail:
      pkg.scripts?.deploy ??
      'BUILD_TARGET=cloudflare opennextjs-cloudflare build && opennextjs-cloudflare deploy',
    icon: Cloud,
    accent: 'from-purple-500/30 via-fuchsia-500/10 to-transparent',
  },
  {
    key: 'cf-typegen',
    title: '类型守护',
    description: '生成 Cloudflare Workers 类型，保障边缘能力安全可靠。',
    command: 'npm run cf-typegen',
    detail:
      pkg.scripts?.['cf-typegen'] ??
      'wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts',
    icon: GitBranch,
    accent: 'from-cyan-500/30 via-sky-500/10 to-transparent',
  },
];

const aboutLinks = [
  { label: '官方网站', href: 'https://onenav.h06i.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: '反馈与支持', href: 'mailto:support@onenav.app' },
];

const sampleExportSnippet = `[
  {
    "title": "OneNav Docs",
    "url": "https://onenav.h06i.com",
    "tags": ["workflow", "navigation"]
  },
  {
    "title": "DevOps Runbook",
    "url": "https://runbook.team",
    "children": [
      { "title": "Deploy Checklist", "url": "https://runbook.team/deploy" }
    ]
  }
]`;

const seoKeywords = (pkg.seo?.keywords ?? []).slice(0, 8);

const heroStats = [
  { label: '当前版本', value: pkg.version },
  { label: '自动化脚本', value: `${automationScriptCount} 条 npm scripts` },
  { label: '核心能力', value: '搜索 · 分类 · 导入导出 · 2FA' },
];

export default function HomePage() {
  const [activeOption, setActiveOption] =
    useState<OptionShowcaseKey>('general');
  const activeShowcase =
    optionsShowcases.find((entry) => entry.key === activeOption) ??
    optionsShowcases[0];
  const ActiveIcon = activeShowcase.icon;

  return (
    <main className="relative flex-1 overflow-hidden ">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-900 to-background" />
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/30 via-violet-500/20 to-transparent blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-emerald-400/20 via-cyan-500/10 to-transparent blur-3xl"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      <section className="relative">
        <div className="container mx-auto flex flex-col gap-16 py-24 md:py-32 lg:flex-row">
          <div className="flex-1 space-y-10 ">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] /80"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <SparklePulse />
              {pkg.seo?.title ?? 'OneNav'}
            </motion.span>
            <motion.h1
              className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              将书签管理升级为炫酷的导航星云
            </motion.h1>
            <motion.p
              className="max-w-2xl text-base leading-relaxed  sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              OneNav 汇集 Options 页面提供的定制能力与扩展接口，结合 Motion
              动效与富媒体视觉，打造既好看又高效的个人工作台。
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white text-slate-900 hover:bg-slate-100"
              >
                <a
                  href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ChromeIcon className="mr-2 h-5 w-5" /> 立即安装
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/5  hover:bg-white/10"
              >
                <Link href="/options">
                  探索设置
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="grid gap-6 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="text-xs uppercase tracking-widest /60">
                      {stat.label}
                    </div>
                    <div className="text-lg font-semibold ">{stat.value}</div>
                  </div>
                ))}
              </div>

              {seoKeywords.length ? (
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs /80"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </div>

          <div className="relative flex-1">
            <motion.div
              className="absolute -top-16 right-0 hidden h-36 w-36 rounded-full bg-gradient-to-br from-blue-400/70 to-violet-500/70 blur-3xl lg:block"
              animate={{ x: [0, 10, -10, 0], y: [0, -14, 14, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative overflow-hidden rounded-[2.75rem] border border-white/20 bg-white/10 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="space-y-5 ">
                <motion.div
                  className="rounded-2xl border border-white/15 bg-white/15 p-4 shadow-inner backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] /60">
                        Options
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        基础设置即时预览
                      </div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>默认打开</span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-blue-500/30 px-3 py-1 text-xs">
                            最近添加
                          </span>
                          <span className="rounded-full border border-white/20 px-3 py-1 text-xs /70">
                            全部书签
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs /60">
                        自定义弹出层初始视图
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>新标签页打开</span>
                          <TogglePill active />
                        </div>
                        <p className="mt-2 text-xs /60">保持当前页不被打断。</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>显示详情面板</span>
                          <TogglePill active />
                        </div>
                        <p className="mt-2 text-xs /60">选中即展开编辑视图。</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-white/10 bg-black/50 p-5 shadow-inner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.div
                    className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-4 py-3"
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(0,0,0,0)',
                        '0 18px 50px rgba(59,130,246,0.45)',
                        '0 0 0 rgba(0,0,0,0)',
                      ],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30 text-blue-100">
                        <Search className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-sm font-medium ">
                          AI 建议：自动化收藏清单
                        </div>
                        <div className="text-xs /60">
                          匹配标签、收藏夹与脚本提示
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-300">0.08s</span>
                  </motion.div>

                  <motion.div
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          delayChildren: 1,
                          staggerChildren: 0.18,
                        },
                      },
                    }}
                  >
                    {['DevOps Runbook', '设计灵感库', '自动化脚本集'].map(
                      (item, index) => (
                        <motion.div
                          key={item}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3"
                        >
                          <div>
                            <div className="text-sm font-medium ">{item}</div>
                            <div className="text-xs /50">标签 · 动作 · 2FA</div>
                          </div>
                          <motion.span
                            className="rounded-full bg-white/10 px-3 py-1 text-xs /70"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              delay: index * 0.2,
                            }}
                          >
                            高亮
                          </motion.span>
                        </motion.div>
                      ),
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {heroShots.map((shot) => (
              <motion.img
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                className={`pointer-events-none absolute hidden overflow-hidden rounded-3xl border border-white/15 object-cover opacity-80 shadow-[0_20px_40px_rgba(15,23,42,0.35)] backdrop-blur lg:block ${shot.className}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: [0, -12, 0],
                  rotate: [0, shot.rotate, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: shot.delay,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-slate-950/40 py-24 ">
        <div className="container  mx-auto grid gap-12 lg:grid-cols-[1.25fr,1fr]">
          <div className="space-y-8">
            <motion.h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Options 页面可视化预览
            </motion.h2>
            <motion.p
              className="text-base /70"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              直接从 Options
              页面抽取真实功能与描述，通过动态卡片呈现核心能力，帮助你秒懂
              OneNav 的深度自定义潜力。
            </motion.p>

            <div className="flex flex-wrap gap-3">
              {optionsShowcases.map((showcase) => {
                const Icon = showcase.icon;
                const active = activeOption === showcase.key;
                return (
                  <motion.button
                    key={showcase.key}
                    type="button"
                    onClick={() => setActiveOption(showcase.key)}
                    className={`group relative overflow-hidden rounded-full border px-5 py-2 text-xs uppercase tracking-[0.3em] transition focus:outline-none focus:ring-2 focus:ring-white/60 ${
                      active
                        ? 'border-white bg-white text-slate-900 shadow-[0_10px_40px_rgba(255,255,255,0.25)]'
                        : 'border-white/20 bg-white/5 /70 hover:border-white/40 hover:'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {showcase.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeShowcase.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] /60">
                  <ActiveIcon className="h-4 w-4" />
                  {activeShowcase.label}
                </div>
                <h3 className="text-2xl font-semibold">
                  {activeShowcase.title}
                </h3>
                <p className="text-sm leading-relaxed /70">
                  {activeShowcase.description}
                </p>
                <ul className="space-y-4">
                  {activeShowcase.bullets.map((bullet) => (
                    <motion.li
                      key={bullet}
                      className="flex items-start gap-3 text-sm /80"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Sparkles className="mt-1 h-4 w-4 text-sky-300" />
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <OptionPreview
                key={activeShowcase.key}
                showcase={activeShowcase}
              />
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-200/60 bg-gradient-to-b from-white via-slate-50 to-white py-24">
        <div className="container  mx-auto space-y-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              以效率为核心的沉浸式体验
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              借助 Motion 动效与 Options 页面真实能力，OneNav
              让书签不再只是链接清单，而是动态可适配的效率中枢。
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0px_20px_60px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-2 hover:border-transparent hover:shadow-[0px_30px_80px_rgba(15,23,42,0.16)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} `}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200/60 bg-gradient-to-br from-slate-900 via-slate-950 to-black py-24 ">
        <motion.div
          className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-blue-500/40 blur-3xl"
          animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container  mx-auto relative z-10 flex flex-col gap-16 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <motion.h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              战术级效率流程，一气呵成
            </motion.h2>
            <motion.p
              className="text-base /70"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              将 Options 设置、导入导出与搜索体验串联，OneNav
              帮你从采集、整理到分享，构建专属效率星图。
            </motion.p>

            <div className="space-y-6">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <div className="mb-3 inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] /70">
                    {step.badge}
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold ">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed /70">
                        {step.description}
                      </p>
                    </div>
                    <PanelsTopLeft className="mt-1 h-6 w-6 /40" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryImages.map((image, index) => (
                <motion.figure
                  key={image.src}
                  className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 ${
                    index === 0 ? 'sm:col-span-2 sm:h-80' : 'h-64'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-xs uppercase tracking-[0.2em] /70">
                    {image.alt}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-slate-950 py-24 ">
        <motion.div
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)]"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container mx-auto space-y-12">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              自动化脚本驱动的迭代节奏
            </h2>
            <p className="mt-4 text-lg /70">
              来自 package.json
              的脚本体系让开发、构建、部署与类型维护一体化，搭配 Options
              配置即可快速试错与发布。
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {automationHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.4)] backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ translateY: -8 }}
                >
                  <motion.div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent}`}
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: [0.2, 0.35, 0.2] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                  />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/20 ">
                        <Icon className="h-5 w-5" />
                      </span>
                      <PreviewTag>脚本</PreviewTag>
                    </div>
                    <h3 className="text-xl font-semibold ">{item.title}</h3>
                    <p className="text-sm /70">{item.description}</p>
                    <motion.code
                      className="block rounded-2xl border border-white/20 bg-black/60 px-4 py-3 font-mono text-xs text-emerald-200 whitespace-pre-line"
                      animate={{
                        boxShadow: [
                          '0 0 0 rgba(0,0,0,0)',
                          '0 12px 30px rgba(16,185,129,0.25)',
                          '0 0 0 rgba(0,0,0,0)',
                        ],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.3,
                      }}
                    >
                      {`${item.command}\n${item.detail}`}
                    </motion.code>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto space-y-12">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              准备升级你的导航体验？
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              免费安装 OneNav，或前往 Options
              页面探索更多进阶设置。我们正在持续构建多端同步、自动化与团队协作能力。
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Button asChild size="lg" className="rounded-full px-8">
              <a
                href="https://chrome.google.com/webstore/detail/onenav/libdgdcddkkkmkplihnpmfoegnghdbfl"
                target="_blank"
                rel="noreferrer"
              >
                <ChromeIcon className="mr-2 h-5 w-5" /> 免费安装
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8"
            >
              <Link href="/privacy">
                查看隐私承诺
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function OptionPreview({ showcase }: { showcase: OptionShowcase }) {
  if (showcase.key === 'general') {
    return <GeneralOptionPreview showcase={showcase} />;
  }

  if (showcase.key === 'import-export') {
    return <ImportExportPreview showcase={showcase} />;
  }

  return <AboutPreview showcase={showcase} />;
}

function GeneralOptionPreview({ showcase }: { showcase: OptionShowcase }) {
  return (
    <motion.div
      key={showcase.key}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.4)]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${showcase.accent}`}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={showcase.image}
        alt={showcase.title}
        className="pointer-events-none absolute right-[-30%] top-[-20%] h-48 w-auto opacity-25 blur-xl"
        initial={{ opacity: 0, rotate: -8 }}
        animate={{ opacity: 0.35, rotate: [-8, 6, -8] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 space-y-5 ">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] /50">
              General
            </div>
            <div className="text-2xl font-semibold leading-snug">
              启动视图偏好
            </div>
          </div>
          <PreviewTag>Options</PreviewTag>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>默认打开</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/40 px-3 py-1 text-xs">
                最近添加
              </span>
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs /70">
                全部书签
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs /70">
            选择弹出层初始状态，配合拖拽排序打造顺手导航。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-black/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>新标签页打开</span>
              <TogglePill active />
            </div>
            <p className="mt-2 text-xs /60">在当前浏览上下文之外快速查阅。</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>自动展开详情</span>
              <TogglePill active />
            </div>
            <p className="mt-2 text-xs /60">选中即可编辑标签、脚本或备注。</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ImportExportPreview({ showcase }: { showcase: OptionShowcase }) {
  return (
    <motion.div
      key={showcase.key}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.4)]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${showcase.accent}`}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={showcase.image}
        alt={showcase.title}
        className="pointer-events-none absolute -left-16 top-[-30%] h-48 w-auto opacity-30 blur-xl"
        initial={{ opacity: 0, rotate: 6 }}
        animate={{ opacity: 0.35, rotate: [6, -4, 6] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 space-y-5 ">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] /50">
              Import / Export
            </div>
            <div className="text-2xl font-semibold leading-snug">
              JSON 级备份
            </div>
          </div>
          <PreviewTag>无损迁移</PreviewTag>
        </div>
        <div className="rounded-2xl border border-white/20 bg-black/55 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] /60">
            <FileText className="h-3.5 w-3.5" />
            onenav-bookmarks-20240918.json
          </div>
          <motion.pre
            className="mt-3 max-h-60 overflow-hidden rounded-2xl bg-black/70 p-4 text-xs leading-relaxed text-emerald-200/90"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {sampleExportSnippet}
          </motion.pre>
        </div>
        <div className="flex flex-wrap gap-3">
          <PreviewTag>导出 JSON</PreviewTag>
          <PreviewTag>合并根目录</PreviewTag>
          <PreviewTag>时间戳命名</PreviewTag>
        </div>
      </div>
    </motion.div>
  );
}

function AboutPreview({ showcase }: { showcase: OptionShowcase }) {
  return (
    <motion.div
      key={showcase.key}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.4)]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-bl ${showcase.accent}`}
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={showcase.image}
        alt={showcase.title}
        className="pointer-events-none absolute left-[-18%] bottom-[-22%] h-44 w-auto opacity-25 blur-xl"
        initial={{ opacity: 0, rotate: -6 }}
        animate={{ opacity: 0.3, rotate: [-6, 6, -6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 space-y-6 ">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] /50">About</div>
            <div className="text-2xl font-semibold leading-snug">
              透明版本信息
            </div>
          </div>
          <PreviewTag>Release</PreviewTag>
        </div>
        <div className="grid gap-3 rounded-2xl border border-white/15 bg-black/45 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>版本号</span>
            <span className="font-mono">{pkg.version}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>SEO 标题</span>
            <span className="max-w-[12rem] text-right text-xs /70">
              {pkg.seo?.title ?? 'OneNav - 书签管理与快速搜索'}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] /50">资源导航</div>
          <div className="flex flex-wrap gap-3">
            {aboutLinks.map((link) => (
              <PreviewTag key={link.href}>{link.label}</PreviewTag>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TogglePill({ active }: { active?: boolean }) {
  return (
    <span
      className={`relative block h-5 w-10 rounded-full transition ${
        active ? 'bg-emerald-400/80' : 'bg-white/30'
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-all ${
          active ? 'right-1' : 'left-1'
        }`}
      />
    </span>
  );
}

function PreviewTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] /80">
      {children}
    </span>
  );
}

function SparklePulse() {
  return (
    <motion.span
      className="relative flex h-4 w-4"
      initial={{ scale: 0.8, opacity: 0.6 }}
      animate={{ scale: [0.8, 1.1, 0.9, 1], opacity: [0.6, 1, 0.8, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="absolute inset-0 rounded-full bg-sky-400/70 blur-[2px]" />
      <span className="absolute inset-1 rounded-full bg-sky-200" />
    </motion.span>
  );
}
