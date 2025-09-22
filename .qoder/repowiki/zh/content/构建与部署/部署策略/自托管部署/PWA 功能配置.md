# PWA 功能配置

<cite>
**本文档引用的文件**  
- [manifest.json](file://public/manifest.json)
- [site.webmanifest](file://public/site.webmanifest)
- [layout.tsx](file://src/app/layout.tsx)
</cite>

## 目录

1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [PWA 清单配置详解](#pwa-清单配置详解)
5. [启动 URL 与作用域设置](#启动-url-与作用域设置)
6. [资源路径调整与部署适配](#资源路径调整与部署适配)
7. [HTTPS 安全上下文要求](#https-安全上下文要求)
8. [验证 PWA 清单有效性](#验证-pwa-清单有效性)
9. [结论](#结论)

## 简介

OneNav 是一个功能丰富的书签管理工具，支持书签的增删改查、排序、导入导出以及快速搜索。该项目不仅作为浏览器扩展运行，还具备渐进式 Web 应用（PWA）的能力，允许用户在支持的环境中安装并离线访问。

本指南旨在全面指导如何正确配置 OneNav 的 PWA 功能，确保其在自托管环境下的离线访问和安装功能正常工作。重点涵盖 `manifest.json` 文件中关键字段的含义与最佳实践，特别是 `start_url` 和 `scope` 的设置，以确保 Service Worker 能正确拦截路由请求。同时，将说明如何根据实际部署路径调整资源配置路径，并强调 HTTPS 对 PWA 的必要性。

## 项目结构

OneNav 项目采用现代前端架构组织，主要结构如下：

```
.
├── public               # 静态资源目录
│   ├── manifest.json    # 浏览器扩展清单（非 PWA 使用）
│   ├── site.webmanifest # PWA 应用清单（核心）
│   ├── favicon-*.png    # 不同尺寸的网站图标
│   ├── pwa-*.png        # PWA 启动图标
│   └── ...
├── src
│   └── app
│       └── layout.tsx   # 根布局文件，包含 meta 标签和 manifest 引用
└── ...
```

其中，`public` 目录存放所有静态资源，包括 PWA 所需的图标和清单文件。`site.webmanifest` 是 PWA 的核心配置文件，而 `layout.tsx` 则负责在 HTML 头部注入必要的元数据。

**Section sources**

- [project_structure](file://workspace_path)

## 核心组件

OneNav 的 PWA 功能依赖于以下几个核心组件协同工作：

- **Web App Manifest (`site.webmanifest`)**：定义应用名称、图标、启动 URL、显示模式等元信息。
- **Service Worker**：虽然未在当前上下文中直接展示，但它是实现离线功能的关键，通常由构建工具（如 Next.js）自动生成。
- **HTML Meta Tags (`layout.tsx`)**：通过 `<meta>` 标签提供主题色、视口设置等，增强 PWA 体验。
- **图标资源**：多种尺寸的 PNG 图标用于不同设备和场景。

这些组件共同作用，使 OneNav 能够被识别为可安装的应用，并提供类原生的用户体验。

**Section sources**

- [site.webmanifest](file://public/site.webmanifest#L1-L35)
- [layout.tsx](file://src/app/layout.tsx#L31-L75)

## PWA 清单配置详解

PWA 的行为由 `site.webmanifest` 文件精确控制。以下是该文件中各字段的详细解释及最佳实践。

### name 与 short_name

- **name**: `"OneNav"`  
  指定应用的全名，在应用安装和显示时使用。应具有描述性且完整。
- **short_name**: `"OneNav"`  
  指定应用的简称，用于空间有限的场合（如主屏幕图标下方）。建议保持简洁，通常不超过 12 个字符。

两者在本项目中相同，符合命名规范。

### icons

定义应用在不同场景下使用的图标集合：

```json
"icons": [
  {
    "src": "/pwa-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/pwa-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/pwa-maskable-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "maskable"
  },
  {
    "src": "/pwa-maskable-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "maskable"
  }
]
```

- **`src`**: 图标文件路径，建议使用绝对路径。
- **`sizes`**: 图标尺寸，推荐包含 192x192 和 512x512 以满足不同设备需求。
- **`type`**: MIME 类型，通常为 `image/png`。
- **`purpose`**:
  - `"any"`: 可用于任何用途。
  - `"maskable"`: 表示图标设计为可裁剪（无边框），适用于 Android 上的自适应图标。

**最佳实践**：始终提供 `maskable` 版本的图标以获得最佳视觉效果。

### start_url

- **值**: `"/"`  
  指定用户从主屏幕启动应用时加载的初始页面。必须是一个相对 URL，相对于 manifest 文件的位置。

此路径应指向应用的入口点，通常是根路径或 `index.html`。

### display

- **值**: `"standalone"`  
  控制应用的显示模式：
  - `"standalone"`: 类似原生应用，无浏览器 UI（地址栏、导航按钮等）。
  - `"fullscreen"`: 完全沉浸式，隐藏所有系统 UI。
  - `"minimal-ui"`: 提供最基本的浏览器控件。
  - `"browser"`: 在标准浏览器标签页中打开。

推荐使用 `"standalone"` 以提供最接近原生应用的体验。

### theme_color 与 background_color

- **`theme_color`**: `"#FFFFFF"`  
  定义应用的主题色，影响操作系统 UI（如状态栏、任务切换器）的颜色。
- **`background_color`**: `"#FFFFFF"`  
  定义启动画面的背景色，应在应用加载前提供平滑的视觉过渡。

在 `layout.tsx` 中也通过 `<meta name="theme-color">` 动态设置了主题色，以适配用户的明暗模式偏好。

```tsx
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
```

这确保了无论用户使用何种系统主题，都能获得一致的视觉体验。

**Section sources**

- [site.webmanifest](file://public/site.webmanifest#L1-L35)
- [layout.tsx](file://src/app/layout.tsx#L31-L75)

## 启动 URL 与作用域设置

虽然 `site.webmanifest` 中未显式定义 `scope` 属性，但其默认值为 manifest 文件所在目录的路径（即 `/`）。

### start_url 详解

- **当前设置**: `"/"`  
  这意味着当用户启动应用时，浏览器会请求根路径的内容。对于基于路由的单页应用（SPA），这通常是正确的设置，因为所有路由都由前端框架（如 Next.js）处理。

### scope 详解

- **隐式值**: `"/"`  
  `scope` 定义了 Service Worker 可以控制的 URL 范围。所有在此范围内的导航请求都将被 Service Worker 拦截，从而实现离线缓存和自定义路由逻辑。

**关键点**：

- 如果应用部署在子路径下（如 `https://example.com/onenav/`），则必须将 `start_url` 和 `scope` 显式设置为 `/onenav/`。
- `start_url` 必须在 `scope` 范围内。
- 错误的 `scope` 设置会导致 Service Worker 无法拦截深层路由，从而破坏离线功能。

例如，若部署路径为 `/onenav`，则 `site.webmanifest` 应修改为：

```json
{
  "start_url": "/onenav/",
  "scope": "/onenav/"
}
```

同时，HTML 中的 manifest 引用也需更新：

```html
<link rel="manifest" href="/onenav/site.webmanifest" />
```

**Section sources**

- [site.webmanifest](file://public/site.webmanifest#L1-L35)
- [layout.tsx](file://src/app/layout.tsx#L31-L75)

## 资源路径调整与部署适配

在自托管环境中，必须根据实际部署路径调整所有资源的引用路径。

### 路径类型

- **绝对路径**：以 `/` 开头，相对于域名根目录。例如 `/pwa-192x192.png`。
- **相对路径**：相对于当前文件位置。不推荐用于 PWA 资源。

### 部署在根路径（推荐）

如果应用部署在域名根目录（如 `https://example.com/`），则无需修改路径，当前配置可直接使用。

### 部署在子路径

如果应用部署在子路径（如 `https://example.com/onenav/`），则需进行以下调整：

1. **更新 `site.webmanifest`**：

   ```json
   {
     "icons": [
       {
         "src": "/onenav/pwa-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       }
     ],
     "start_url": "/onenav/",
     "scope": "/onenav/"
   }
   ```

2. **更新 `layout.tsx` 中的资源引用**：

   ```tsx
   <link rel="icon" href="/onenav/favicon-32x32.png" />
   <link rel="manifest" href="/onenav/site.webmanifest" />
   ```

3. **确保构建工具输出路径正确**：配置 `next.config.ts` 中的 `basePath` 选项（如果使用 Next.js）。

**最佳实践**：使用构建时变量或环境变量来动态生成路径，避免硬编码。

**Section sources**

- [site.webmanifest](file://public/site.webmanifest#L1-L35)
- [layout.tsx](file://src/app/layout.tsx#L31-L75)

## HTTPS 安全上下文要求

PWA 的核心功能（如 Service Worker、Push API、Geolocation 等）只能在安全上下文中运行，即通过 HTTPS 协议提供服务。

### 为什么需要 HTTPS？

- **安全性**：防止中间人攻击，保护用户数据。
- **功能限制**：现代浏览器禁止在非安全源（HTTP）上注册 Service Worker，这是 PWA 离线功能的基础。
- **用户信任**：HTTPS 是建立用户信任的前提。

### 自托管解决方案

1. **生产环境**：使用 Let's Encrypt 等免费 CA 获取有效 SSL 证书。
2. **本地开发**：现代开发服务器（如 Next.js、Vite）通常内置 HTTPS 支持，可通过配置启用。
3. **测试环境**：可使用自签名证书，但需手动信任。

**重要提示**：即使在本地 `localhost` 上，也应使用 HTTPS 进行 PWA 功能测试，因为某些浏览器（如 Chrome）对 `http://localhost` 有特殊豁免，但行为可能与生产环境不一致。

**Section sources**

- [layout.tsx](file://src/app/layout.tsx#L31-L75)

## 验证 PWA 清单有效性

为确保 PWA 配置正确，应使用专业工具进行验证。

### 推荐工具

- **Chrome DevTools > Application > Manifest**：直接查看解析后的 manifest 信息，检查是否有错误或警告。
- **Lighthouse**：运行 PWA 审计，全面评估安装性、离线能力、性能等。
- **Web.dev Measure**：在线工具，提供详细的 PWA 质量评分和改进建议。

### 验证步骤

1. 部署应用至 HTTPS 环境。
2. 打开 Chrome 浏览器，进入应用页面。
3. 打开 DevTools，切换到 **Application** 标签页。
4. 查看 **Manifest** 面板，确认所有字段正确解析，图标可正常加载。
5. 运行 **Lighthouse** 审计，重点关注“PWA”类别得分。

### 常见问题

- **图标无法加载**：检查路径是否正确，服务器是否返回正确的 MIME 类型。
- **无法安装**：确认 `display` 模式为 `standalone` 或 `fullscreen`，且存在有效的 `start_url`。
- **离线失败**：检查 Service Worker 是否成功注册并缓存了关键资源。

**Section sources**

- [site.webmanifest](file://public/site.webmanifest#L1-L35)

## 结论

正确配置 PWA 是提升 OneNav 用户体验的关键一步。通过精心设置 `site.webmanifest` 中的 `name`、`short_name`、`icons`、`start_url`、`display` 和 `theme_color` 等字段，并根据部署路径调整资源引用，可以确保应用在各种设备上都能正常安装和运行。

特别要注意 `start_url` 和 `scope` 的设置，它们直接关系到 Service Worker 能否正确拦截路由请求，是实现离线功能的基础。同时，必须在 HTTPS 环境下部署应用，以满足现代浏览器的安全要求。

最后，利用 Chrome DevTools 和 Lighthouse 等工具持续验证和优化 PWA 配置，确保提供稳定、可靠、类原生的用户体验。
