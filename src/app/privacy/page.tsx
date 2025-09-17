import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import pkg from '../../../package.json';

// 确保从您的组件库中正确导入

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            OneNav 隐私条款
          </h1>
          <p className="text-muted-foreground mt-2">
            最后更新日期：2025年9月16日
          </p>
        </header>

        {/* 引言部分 */}
        <p className="text-lg text-muted-foreground text-center">
          感谢您使用 &quot;OneNav -
          书签管理与快速搜索&quot;（以下简称“本扩展”）。我们非常重视您的个人隐私和数据安全。本隐私条款将详细说明我们如何收集、使用和保护您的信息。
        </p>

        {/* 核心信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">我们收集的信息及原因</CardTitle>
            <CardDescription>
              我们收集信息旨在为您提供更好、更个性化的服务。所需权限和数据使用情况如下：
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 书签权限 */}
            <div>
              <h3 className="font-semibold text-lg">书签 (bookmarks 权限)</h3>
              <p className="text-muted-foreground mt-1">
                这是本扩展的核心权限。我们需要访问您的书签数据以实现书签的增加、删除、修改、查询、排序、导入和导出等功能。所有书签操作默认都在您的本地设备上进行，除非您主动选择使用云同步功能，否则我们不会将您的书签数据上传到任何服务器。
              </p>
            </div>

            {/* 本地存储权限 */}
            <div>
              <h3 className="font-semibold text-lg">本地存储 (storage 权限)</h3>
              <p className="text-muted-foreground mt-1">
                为了保存您的个性化配置（如主题偏好、排序方式等），本扩展会将这些设置信息存储在您浏览器的本地存储空间中。这些数据仅存储在您的设备上。
              </p>
            </div>

            {/* 标签页与活动页面权限 */}
            <div>
              <h3 className="font-semibold text-lg">
                标签页与活动页面 (tabs, activeTab, contextMenus 权限)
              </h3>
              <p className="text-muted-foreground mt-1">
                当您通过右键菜单（Context
                Menu）将当前网页添加到书签，或点击书签在新标签页中打开时，我们需要使用这些权限。我们仅在您执行这些特定操作时才会获取相关页面信息，绝不会跟踪或记录您的浏览历史。
              </p>
            </div>

            {/* 服务器通信权限 */}
            <div>
              <h3 className="font-semibold text-lg">
                服务器通信 (host_permissions)
              </h3>
              <p className="text-muted-foreground mt-1">
                本扩展为您提供了可选的云端同步和备份功能。为了实现这些高级功能（如
                SSH、2FA 等），本扩展需要与我们的服务器{' '}
                <code>{pkg.seo.og.url}</code> 进行通信。
                <strong>
                  如果您不注册账户或不使用这些在线功能，您的任何个人数据（包括书签）都不会被发送到我们的服务器。
                </strong>
                当您选择使用云同步时，您的数据将在加密后传输和存储。
              </p>
            </div>

            {/* 第三方图像资源 */}
            <div>
              <h3 className="font-semibold text-lg">
                第三方图像资源 (Content Security Policy)
              </h3>
              <p className="text-muted-foreground mt-1">
                为了改善书签列表的视觉体验，本扩展可能会从 Google 和 DuckDuckGo
                等第三方服务获取网站图标
                (Favicon)。在此过程中，您书签中的网站域名可能会被发送给这些第三方服务，以便获取对应的图标。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 其他信息模块 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>数据使用与安全</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                您的核心书签数据和扩展配置默认仅存储在您的本地计算机上。若您选择使用云同步，数据将被加密传输并安全存储。我们采取行业标准的安全措施保护您的信息，但无法保证100%的安全。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据共享</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                我们郑重承诺，不会将您的个人可识别信息出售、交易或转让给外部第三方，除非是为您提供您主动选择的云服务或遵守法律法规的强制性要求。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>您的权利和选择</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                您可以完全控制您的数据，随时选择是否使用需要联网的云同步功能。若使用云服务，您有权随时访问、修改或删除存储在服务器上的数据。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>隐私条款的变更</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                我们可能会适时更新本隐私条款。任何变更都将在此页面上发布，我们建议您定期查看以获取最新信息。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 联系我们 */}
        <footer className="text-center text-sm text-muted-foreground">
          <p>
            如果您对本隐私条款有任何疑问或建议，请通过我们的官方网站与我们联系：
          </p>
          <a
            href={pkg.seo.og.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {pkg.seo.og.url}
          </a>
        </footer>
      </div>
    </div>
  );
}
