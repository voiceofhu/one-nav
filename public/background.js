// OneNav Chrome Extension Background Script

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('OneNav 扩展已安装');

    // 创建右键菜单
    chrome.contextMenus.create({
      id: 'add-bookmark',
      title: '添加到 OneNav 书签',
      contexts: ['page', 'link'],
    });
  }
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-bookmark') {
    const url = info.linkUrl || tab.url;
    const title = info.linkUrl
      ? info.selectionText || 'New Bookmark'
      : tab.title;

    // 添加书签
    chrome.bookmarks.create(
      {
        title: title,
        url: url,
      },
      (bookmark) => {
        console.log('书签已添加:', bookmark);
        // 通知所有扩展页面刷新（popup/options）
        chrome.runtime.sendMessage({
          type: 'onenav:bookmark-created',
          payload: bookmark,
        });
      },
    );
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 可以在这里添加一些标签页相关的逻辑
  if (changeInfo.status === 'complete' && tab.url) {
    // 标签页加载完成
  }
});

// 处理来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // 返回一些数据给 popup
    sendResponse({ data: 'Hello from background!' });
  }
  return true; // 保持消息通道开放
});

// 将原生书签事件转发为 runtime 消息，方便前端页面统一监听
const forward =
  (type) =>
  (...args) => {
    try {
      chrome.runtime.sendMessage({ type, payload: args });
    } catch {
      // ignore if no listeners
    }
  };

chrome.bookmarks.onCreated.addListener(forward('onenav:bookmarks:onCreated'));
chrome.bookmarks.onChanged.addListener(forward('onenav:bookmarks:onChanged'));
chrome.bookmarks.onRemoved.addListener(forward('onenav:bookmarks:onRemoved'));
chrome.bookmarks.onMoved.addListener(forward('onenav:bookmarks:onMoved'));
// 某些 Chromium 版本可能不支持该事件
if (chrome.bookmarks.onChildrenReordered) {
  chrome.bookmarks.onChildrenReordered.addListener(
    forward('onenav:bookmarks:onChildrenReordered'),
  );
}
// 背景脚本就绪
console.log('OneNav background service worker ready');
console.log(window.chrome.bookmarks);
console.log(window.chrome.bookmark);
