// Reading material by level and track. Move up a level once most of it reads with
// at most one unknown word per sentence.
export const LEVELS = [
  {
    level: 'L1',
    title: '短句、简单',
    when: '阶段 1，第 1–2 周',
    tech: [
      { name: '常用工具的 README 首屏', url: 'https://github.com/microsoft/playwright', note: 'Playwright、Node、Docker 等 GitHub 仓库首页' },
      { name: 'CLI 的 --help 输出', note: '如 npx playwright test --help' },
      { name: 'Simple English Wikipedia 技术词条', url: 'https://simple.wikipedia.org/wiki/Software_testing', note: '如 "Software testing"、"Computer program"' },
      { name: '开源项目的 commit message', note: '在项目里运行 git log --oneline，一行一句，适合起步' },
    ],
    daily: [
      { name: 'News in Levels', url: 'https://www.newsinlevels.com/', note: '同一条新闻分 3 个难度，从 Level 1 读起' },
      { name: 'Breaking News English', url: 'https://breakingnewsenglish.com/', note: 'Level 0–2' },
    ],
  },
  {
    level: 'L2',
    title: '入门文档 / 慢速新闻',
    when: '阶段 1，第 3–4 周',
    tech: [
      { name: 'Playwright 文档入门', url: 'https://playwright.dev/docs/intro', note: 'Getting started → Writing tests → Locators' },
      { name: 'MDN Web Docs 入门篇', url: 'https://developer.mozilla.org/en-US/docs/Learn', note: '如 "What is JavaScript?"' },
      { name: 'Claude Code 文档入门页', url: 'https://docs.claude.com/', note: '' },
    ],
    daily: [
      { name: 'VOA Learning English', url: 'https://learningenglish.voanews.com/', note: '用词受控，句子短' },
      { name: '兴趣领域的 Reddit 子版块', url: 'https://www.reddit.com/', note: '游戏、健身、烹饪……先读标题和高赞短评' },
    ],
  },
  {
    level: 'L3',
    title: '讨论和博客',
    when: '阶段 2',
    tech: [
      { name: '开源项目的 GitHub issues', url: 'https://github.com/microsoft/playwright/issues', note: '先挑标签为 bug 且讨论 < 10 条的' },
      { name: 'Release notes / Changelog', url: 'https://playwright.dev/docs/release-notes', note: 'Playwright 的 release notes 很规整' },
      { name: 'Martin Fowler 的短文', url: 'https://martinfowler.com/', note: '' },
      { name: 'Google Testing Blog', url: 'https://testing.googleblog.com/', note: '' },
      { name: 'Anthropic Engineering blog', url: 'https://www.anthropic.com/engineering', note: '' },
    ],
    daily: [
      { name: 'r/CasualConversation', url: 'https://www.reddit.com/r/CasualConversation/', note: '纯闲聊语料' },
      { name: 'r/AskReddit', url: 'https://www.reddit.com/r/AskReddit/', note: '读帖子 + 评论区' },
      { name: '看过的剧 / 电影开英文字幕重看一集', note: '已经知道剧情，注意力全在语言上' },
    ],
  },
  {
    level: 'L4',
    title: '长文和书',
    when: '阶段 3',
    tech: [
      { name: '设计类长文 / RFC', note: '如 Kubernetes KEP、Node.js RFC' },
      { name: 'Software Engineering at Google', url: 'https://abseil.io/resources/swe-book', note: '免费在线，测试章节很相关' },
      { name: 'The Pragmatic Programmer', note: '' },
      { name: 'Hacker News', url: 'https://news.ycombinator.com/', note: '首页高赞文章 + 评论' },
    ],
    daily: [
      { name: 'BBC / The Guardian 生活、科技版', url: 'https://www.bbc.com/', note: '' },
      { name: '兴趣领域的英文 YouTube 频道', note: '开英文字幕' },
      { name: '轻松的英文小说', note: '如 Wonder、The Martian' },
    ],
  },
];

export const METHOD = [
  '第一遍不查词，只求懂个大概，读完用一句中文说出这段讲什么。',
  '第二遍只查影响理解的生词，挑 3–5 个加进生词本，一定抄原句。',
  '最难的一句拿去"拆长句"（语法第 08 课页尾 / AI 陪练）。',
  '写一句英文总结，记到下面的阅读记录。',
];
