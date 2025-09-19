import { ArrowUpRight } from 'lucide-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectEntry {
  title: string;
  highlight?: string;
  site?: {
    label: string;
    href: string;
  };
  logo?: {
    alt: string;
    src: string;
  };
  milestones: Array<{
    title: string;
    description?: string;
    items: Array<{ label?: string; detail: string }>;
  }>;
}

const markdownPlugins = [remarkGfm];

function extractLink(text: string) {
  const match = text.match(/\[(.*?)\]\((.*?)\)/);
  if (!match) return undefined;
  return {
    label: match[1],
    href: match[2],
  };
}

function parseProjectSection(section: string): ProjectEntry | null {
  const lines = section.split('\n');
  if (!lines.length) return null;

  const titleLine = lines[0]?.trim();
  if (!titleLine || !titleLine.startsWith('##')) return null;

  const title = titleLine
    .replace(/^##\s*/, '')
    .replace(/\*\*/g, '')
    .trim();

  let index = 1;
  const highlightParts: string[] = [];
  const linkParts: Array<{ label: string; href: string }> = [];
  let logo: ProjectEntry['logo'];

  while (index < lines.length) {
    const raw = lines[index];
    if (!raw || !raw.trim()) {
      index++;
      continue;
    }
    const trimmed = raw.trim();
    if (!trimmed.startsWith('>')) break;

    const content = trimmed.replace(/^>\s?/, '').trim();
    if (!content) {
      index++;
      continue;
    }

    if (content.startsWith('![')) {
      const imageMatch = content.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        logo = { alt: imageMatch[1], src: imageMatch[2] };
      }
      index++;
      continue;
    }

    const link = extractLink(content);
    if (link) {
      const labelMatch = content.match(/\*\*(.+?)\*\*/);
      const cleanedLabel = labelMatch
        ? labelMatch[1].replace(/[:：]$/, '').trim()
        : link.label;
      linkParts.push({ label: cleanedLabel, href: link.href });
      index++;
      continue;
    }

    highlightParts.push(content.replace(/\*\*/g, '').trim());
    index++;
  }

  while (index < lines.length && lines[index].trim() === '') {
    index++;
  }

  if (lines[index]?.trim().startsWith('###')) {
    index++;
  }

  while (index < lines.length && lines[index].trim() === '') {
    index++;
  }

  const milestones: ProjectEntry['milestones'] = [];
  let current: ProjectEntry['milestones'][number] | null = null;

  for (; index < lines.length; index++) {
    const raw = lines[index];
    if (!raw) continue;

    if (raw.startsWith('- ')) {
      if (current) {
        milestones.push(current);
      }
      const match = raw.match(/- \*\*(.+?)\*\*/);
      const rawTitle = match ? match[1] : raw.replace(/^-\s*/, '');
      const cleanTitle = rawTitle.replace(/`/g, '').trim();
      const description = match
        ? raw
            .replace(match[0], '')
            .trim()
            .replace(/^[:\-\s]+/, '')
        : undefined;

      current = {
        title: cleanTitle,
        description: description || undefined,
        items: [],
      };
    } else if (raw.startsWith('  - ')) {
      const text = raw.trim().replace(/^-\s*/, '');
      const detailMatch = text.match(/\*\*(.+?)\*\*/);
      const label = detailMatch ? detailMatch[1].trim() : undefined;
      const detail = detailMatch
        ? text
            .replace(detailMatch[0], '')
            .replace(/^[:\s-]+/, '')
            .trim()
        : text;

      current?.items.push({ label, detail });
    }
  }

  if (current) {
    milestones.push(current);
  }

  return {
    title,
    highlight: highlightParts.join('\n'),
    site: linkParts[0],
    logo,
    milestones,
  };
}

async function loadProjects(): Promise<{
  intro: string;
  entries: ProjectEntry[];
}> {
  const mdPath = path.join(process.cwd(), 'src/app/project/project.md');
  const fileContent = await fs.readFile(mdPath, 'utf8');
  const [introSection, ...projectSections] = fileContent.split('\n---\n');

  const entries = projectSections
    .map((section) => parseProjectSection(section.trim()))
    .filter((entry): entry is ProjectEntry => Boolean(entry));

  return {
    intro: introSection.trim(),
    entries,
  };
}

function MarkdownText({
  content,
  className,
}: {
  content?: string;
  className?: string;
}) {
  if (!content) return null;
  return (
    <ReactMarkdown remarkPlugins={markdownPlugins} className={className}>
      {content}
    </ReactMarkdown>
  );
}

export default async function Page() {
  const { intro, entries } = await loadProjects();

  return (
    <main className="relative min-h-[100dvh] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 py-14 sm:px-8 lg:px-10">
        <section className="rounded-3xl border border-border/50 bg-background/80 p-8 shadow-sm backdrop-blur">
          <ReactMarkdown
            remarkPlugins={markdownPlugins}
            className="prose prose-slate max-w-none dark:prose-invert"
            components={{
              h1: ({ children }) => (
                <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-3xl">
                  {children}
                </h1>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {children}
                </p>
              ),
            }}
          >
            {intro}
          </ReactMarkdown>
        </section>

        <div className="space-y-16">
          {entries.map((project) => (
            <section
              key={project.title}
              className="rounded-3xl border border-border/40 bg-background/95 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {project.logo ? (
                      <img
                        src={project.logo.src}
                        alt={project.logo.alt}
                        className="h-12 w-12 rounded-xl border border-border/40 bg-muted object-contain p-2"
                      />
                    ) : null}
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                        {project.title}
                      </h2>
                      <MarkdownText
                        content={project.highlight}
                        className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
                      />
                    </div>
                  </div>
                  {project.site ? (
                    <a
                      href={project.site.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/20"
                    >
                      {project.site.label || '访问站点'}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                {project.site ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border/40">
                    <iframe
                      src={project.site.href}
                      title={`${project.title} preview`}
                      loading="lazy"
                      className="aspect-[16/9] w-full border-0 bg-background object-cover pointer-events-none"
                    />
                    <a
                      href={project.site.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                      新标签打开
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  时间线
                </p>
                <div className="space-y-5 border-l border-dashed border-border/70 pl-6">
                  {project.milestones.map((milestone, index) => {
                    const yearMatch = milestone.title.match(/(\d{4})/);
                    const year = yearMatch ? yearMatch[1] : undefined;
                    const cleanedTitle = milestone.title
                      .replace(/`/g, '')
                      .replace(/🗓️/g, '')
                      .replace(year ?? '', '')
                      .trim();

                    return (
                      <article
                        key={milestone.title + index}
                        className="relative space-y-3"
                      >
                        <span className="absolute -left-[29px] top-1 flex h-3 w-3 rounded-full border border-primary/40 bg-primary/80" />
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {cleanedTitle || milestone.title}
                          </h4>
                          {year ? (
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                              {year}
                            </span>
                          ) : null}
                        </div>
                        <MarkdownText
                          content={milestone.description}
                          className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
                        />
                        {milestone.items.length ? (
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            {milestone.items.map((item, idx) => (
                              <li
                                key={item.detail + idx}
                                className="flex gap-2"
                              >
                                {item.label ? (
                                  <span className="shrink-0 font-medium text-foreground">
                                    {item.label}：
                                  </span>
                                ) : null}
                                <MarkdownText
                                  content={item.detail}
                                  className="prose prose-xs max-w-none text-muted-foreground dark:prose-invert"
                                />
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
