// The 8 grammar points needed for reading. `body` is trusted HTML; exercises have a
// reference answer that is revealed after you write your own.
export const LESSONS = [
  {
    id: '01',
    title: '句子主干',
    summary: '找到谁做了什么，一切的基础',
    body: `
<p>英文句子不管多长，骨架只有几种：</p>
<div class="table-wrap"><table>
<tr><th>结构</th><th>例</th></tr>
<tr><td>主 + 谓</td><td>The test <b>failed</b>.</td></tr>
<tr><td>主 + 谓 + 宾</td><td>Playwright <b>runs</b> the tests.</td></tr>
<tr><td>主 + 系 + 表</td><td>The option <b>is</b> optional.</td></tr>
<tr><td>主 + 谓 + 宾 + 宾补</td><td>This flag <b>makes</b> the output verbose.</td></tr>
<tr><td>主 + 谓 + 间宾 + 直宾</td><td>The tool <b>gives</b> you a report.</td></tr>
</table></div>
<p>读句子第一件事：<b>找谓语动词</b>（真正"发生的动作"），再往前找主语、往后找宾语。其他全是修饰。</p>
<p>中文和英文最大的区别：中文修饰放在前面（"在本地运行的<b>测试</b>"），英文长修饰常放在后面（"the <b>tests</b> running locally"）。</p>
<h3>例句</h3>
<blockquote><p>The <code>page.goto()</code> method <b>navigates</b> the page to the given URL.</p></blockquote>
<p>主干：method navigates page。<code>to the given URL</code> 是"去哪"。</p>
<blockquote><p>By default, Playwright <b>runs</b> tests in parallel.</p></blockquote>
<p>主干：Playwright runs tests。<code>By default</code> / <code>in parallel</code> 都是修饰。</p>`,
    task: '标出主干（主语 / 谓语 / 宾语）',
    exercises: [
      { q: 'The config file defines the base URL for all tests.', a: 'file / defines / URL' },
      { q: 'Each worker process starts its own browser.', a: 'process / starts / browser' },
      { q: 'In CI, retries are useful for flaky network calls.', a: 'retries / are（系动词）/ useful（表语）' },
    ],
  },
  {
    id: '02',
    title: '时态',
    summary: '只学 5 个够用的',
    body: `
<p>英文有十几种时态，读技术材料只需认得这 5 种：</p>
<div class="table-wrap"><table>
<tr><th>时态</th><th>形式</th><th>用在哪</th><th>例</th></tr>
<tr><td>一般现在</td><td>do / does</td><td>文档描述功能、事实</td><td>The function <b>returns</b> a promise.</td></tr>
<tr><td>一般过去</td><td>did</td><td>issue 里描述发生过的事</td><td>The build <b>failed</b> yesterday.</td></tr>
<tr><td>现在完成</td><td>have / has done</td><td>已完成且对现在有影响</td><td>I <b>have fixed</b> the bug.</td></tr>
<tr><td>现在进行</td><td>am / is / are doing</td><td>正在做</td><td>We <b>are working</b> on it.</td></tr>
<tr><td>一般将来</td><td>will do</td><td>将会</td><td>This <b>will be</b> removed in v2.</td></tr>
</table></div>
<p>关键区分：过去时 vs 现在完成时</p>
<ul>
<li><code>I fixed it.</code> 我修过了（讲过去那件事）</li>
<li><code>I have fixed it.</code> 我已经修好了（重点：现在是好的）</li>
</ul>
<p>回复 issue 时常用现在完成时：<code>I've tried …</code>、<code>This has been fixed in …</code>。</p>
<h3>不规则动词（认得就行）</h3>
<p>run–ran–run · write–wrote–written · build–built–built · find–found–found · break–broke–broken · get–got–got/gotten · set–set–set · take–took–taken · show–showed–shown · throw–threw–thrown</p>`,
    task: '说出时态和意思',
    exercises: [
      { q: 'This API has been deprecated since version 1.30.', a: '现在完成时（被动）：自 1.30 起已被弃用' },
      { q: 'The test passed locally but failed in CI.', a: '一般过去时：本地通过了，CI 里挂了' },
      { q: 'We will release a fix next week.', a: '一般将来时：下周发布修复' },
      { q: 'I am investigating the issue.', a: '现在进行时：我正在排查这个问题' },
    ],
  },
  {
    id: '03',
    title: '被动语态',
    summary: '文档里到处都是',
    body: `
<p>形式：<b>be + 过去分词（done）</b>。意思："被……"。技术文档极爱用，因为它关心的是"东西"而不是"谁干的"。</p>
<div class="table-wrap"><table>
<tr><th>主动</th><th>被动</th></tr>
<tr><td>Playwright runs the tests.</td><td>The tests <b>are run</b> by Playwright.</td></tr>
<tr><td>We removed this option.</td><td>This option <b>was removed</b>.</td></tr>
<tr><td>You must set the env var.</td><td>The env var <b>must be set</b>.</td></tr>
</table></div>
<p>被动 + 时态：is done（现在）· was done（过去）· has been done（完成）· will be done（将来）· is being done（进行）· can/must/should be done（情态）</p>
<p>中文常不说"被"，翻译时直接按主动理解："The file is created automatically" → 文件会自动创建。</p>
<h3>例句</h3>
<blockquote><p>Screenshots <b>are saved</b> to the <code>test-results</code> directory.</p></blockquote>
<blockquote><p>This method <b>is deprecated</b> and <b>will be removed</b> in a future release.</p></blockquote>
<blockquote><p>If no timeout <b>is specified</b>, the default value <b>is used</b>.</p></blockquote>`,
    task: '找出被动并翻译',
    exercises: [
      { q: 'The browser is launched once per worker.', a: 'is launched：每个 worker 启动一次浏览器' },
      { q: 'Environment variables are read from the .env file.', a: 'are read：从 .env 文件读取环境变量' },
      { q: 'This behavior can be changed with the --headed flag.', a: 'can be changed：可以用 --headed 参数改变这个行为' },
    ],
  },
  {
    id: '04',
    title: '情态动词',
    summary: 'must / should / may：是要求还是建议',
    body: `
<p>情态动词决定一句话是<b>规定、建议还是可能</b>。读文档时这是最容易误解、代价最大的地方。</p>
<div class="table-wrap"><table>
<tr><th>词</th><th>强度</th><th>意思</th></tr>
<tr><td>must / must not</td><td>最强</td><td>必须 / 禁止</td></tr>
<tr><td>should / should not</td><td>建议</td><td>应该 / 不建议</td></tr>
<tr><td>can / cannot</td><td>能力</td><td>能 / 不能</td></tr>
<tr><td>may / might</td><td>可能</td><td>可能（也表"允许"）</td></tr>
<tr><td>will / would</td><td>预期</td><td>会 / 会（假设）</td></tr>
</table></div>
<ul>
<li><code>must not</code> = 禁止；<code>don't have to</code> / <code>need not</code> = 不必（完全不同！）</li>
<li><code>may not</code> 在文档里常是"可能不会"，不一定是禁止：<code>This may not work on Windows.</code></li>
<li><code>would</code> 在回复里常表示礼貌：<code>Would you mind …?</code>、<code>I would suggest …</code></li>
</ul>
<h3>例句</h3>
<blockquote><p>You <b>must</b> call <code>await</code> on every action.（规定）</p></blockquote>
<blockquote><p>You <b>should</b> avoid hardcoded waits.（建议）</p></blockquote>
<blockquote><p>The selector <b>may</b> match multiple elements.（可能）</p></blockquote>`,
    task: '是规定、建议、可能，还是不必？',
    exercises: [
      { q: 'Tests should be independent of each other.', a: '建议' },
      { q: 'The value must be a positive integer.', a: '规定' },
      { q: 'This might take a few minutes.', a: '可能' },
      { q: "You don't have to install browsers manually.", a: '不必（不是禁止）' },
    ],
  },
  {
    id: '05',
    title: '从句',
    summary: 'which / that / if / when',
    body: `
<p>从句 = 句子里套着一个小句子（有自己的主谓）。读的时候先<b>把从句括起来</b>，读主干，再回头看从句修饰谁。</p>
<h3>定语从句：修饰前面的名词</h3>
<p>引导词：that / which / who / where / whose</p>
<blockquote><p>The function <b>[that runs before each test]</b> is called <code>beforeEach</code>.</p></blockquote>
<p>主干：The function is called beforeEach。括号里修饰 function。</p>
<p>带逗号的 <code>, which</code> 常补充说明<b>前面整件事</b>：</p>
<blockquote><p>The test timed out, <b>which usually means the selector is wrong</b>.</p></blockquote>
<h3>状语从句：讲条件、时间、原因</h3>
<div class="table-wrap"><table>
<tr><th>引导词</th><th>意思</th></tr>
<tr><td>if / unless</td><td>如果 / 除非</td></tr>
<tr><td>when / while / once / until / before / after</td><td>时间</td></tr>
<tr><td>because / since / as</td><td>原因（since 也可表"自从"）</td></tr>
<tr><td>although / even though</td><td>虽然</td></tr>
<tr><td>so that</td><td>以便</td></tr>
</table></div>
<blockquote><p><b>Unless you specify a timeout</b>, the default is 30 seconds.</p></blockquote>
<h3>名词性从句：整个从句当一个名词用</h3>
<blockquote><p>Check <b>whether the element is visible</b>.</p><p><b>What you see in the trace</b> is what the test saw.</p></blockquote>`,
    task: '把从句括起来，说出主干',
    exercises: [
      { q: 'Tests that depend on each other are hard to debug.', a: '[that depend on each other]；主干：Tests are hard (to debug)' },
      { q: 'If the element is not found, the action throws an error.', a: '[If the element is not found]；主干：the action throws an error' },
      { q: "We don't know why the build fails only on Windows.", a: '[why the build fails only on Windows] 当宾语；主干：We don’t know' },
    ],
  },
  {
    id: '06',
    title: '非谓语',
    summary: 'to do / doing / done 当修饰',
    body: `
<p>动词变成这三种形式后<b>不再是谓语</b>，而是当修饰或名词。认不出它们，就会误当成谓语，句子就读乱了。</p>
<div class="table-wrap"><table>
<tr><th>形式</th><th>常见作用</th><th>例</th></tr>
<tr><td>to do</td><td>目的（为了）、修饰</td><td>Use <code>--debug</code> <b>to step through</b> the test.</td></tr>
<tr><td>doing</td><td>主动 / 正在 修饰；当名词</td><td>the process <b>running</b> the tests · <b>Running</b> tests in parallel is faster.</td></tr>
<tr><td>done</td><td>被动 / 完成 修饰</td><td>the file <b>generated</b> by the tool · Tests <b>written</b> in TS</td></tr>
</table></div>
<ul>
<li>后面跟着名词、前面没有 be 的 <code>done</code> → 是修饰不是谓语：<code>the report generated by Playwright</code>（Playwright 生成的报告）</li>
<li>句首 <code>doing …,</code> / <code>done …,</code> → 补充背景：<code>Using fixtures, you can share setup.</code></li>
</ul>
<h3>例句</h3>
<blockquote><p>The trace viewer lets you see what happened, <b>making it easier to debug failures</b>.</p></blockquote>
<blockquote><p>Tests <b>marked with test.skip</b> are not run.</p></blockquote>
<p>主干：Tests are not run。<code>marked with test.skip</code> 修饰 Tests。</p>`,
    task: '找出真正的谓语',
    exercises: [
      { q: 'The config file located in the root directory is loaded first.', a: 'is loaded（located 是修饰）' },
      { q: 'To run a single test, use the -g flag.', a: 'use（To run 表目的）' },
      { q: 'Tests running in CI use a headless browser.', a: 'use（running 是修饰）' },
    ],
  },
  {
    id: '07',
    title: '连接词',
    summary: '逻辑路标，比生词更重要',
    body: `
<p>快速阅读靠的是<b>看到连接词就知道下一句要说什么</b>。</p>
<div class="table-wrap"><table>
<tr><th>关系</th><th>词</th></tr>
<tr><td>并列 / 递进</td><td>and, also, in addition, moreover, furthermore, as well as</td></tr>
<tr><td>转折</td><td>but, however, although, though, yet, whereas, while（对比）, instead</td></tr>
<tr><td>因果</td><td>because, since, so, therefore, thus, as a result, hence, due to</td></tr>
<tr><td>条件</td><td>if, unless, otherwise, in case, as long as, provided that</td></tr>
<tr><td>举例</td><td>for example, e.g., such as, for instance, like</td></tr>
<tr><td>解释</td><td>i.e., that is, in other words, namely</td></tr>
<tr><td>让步</td><td>even if, even though, regardless of</td></tr>
<tr><td>顺序</td><td>first, then, next, finally, afterwards, once</td></tr>
<tr><td>总结</td><td>in short, overall, to sum up</td></tr>
</table></div>
<p>易混：<b>e.g.</b> = 举例；<b>i.e.</b> = 也就是。<b>while</b> 既可"当……时"，也可"而（对比）"。<b>otherwise</b> = 否则。</p>
<h3>读的时候怎么用</h3>
<ul>
<li>看到 <b>However</b> → 前面是铺垫，重点在后面。</li>
<li>看到 <b>Therefore / As a result</b> → 这是结论，重点读。</li>
<li>看到 <b>For example</b> → 读不懂可以跳过，前面那句才是观点。</li>
</ul>`,
    task: '预测下一句会说什么',
    exercises: [
      { q: 'Parallel tests are faster. However, …', a: '会讲缺点，比如共享状态冲突' },
      { q: 'The selector must match exactly one element; otherwise, …', a: '讲匹配不到或匹配到多个时会怎样（通常是报错）' },
      { q: 'Use stable locators, e.g., …', a: '给出具体例子，如 getByRole、getByTestId' },
    ],
  },
  {
    id: '08',
    title: '拆长句',
    summary: '把前 7 课合起来用',
    body: `
<h3>方法（4 步）</h3>
<ol>
<li><b>找谓语</b>：标出所有动词，排除 to do / doing / done 修饰（第 06 课）和从句里的动词（第 05 课），剩下的就是主句谓语。</li>
<li><b>括修饰</b>：把从句、介词短语（in / for / with / by …）、非谓语短语都括起来。</li>
<li><b>读主干</b>：主 + 谓 + 宾，先懂这一句。</li>
<li><b>回填</b>：一个括号一个括号地问"它修饰谁"。</li>
</ol>
<h3>示例</h3>
<blockquote><p>When a test fails, Playwright automatically captures a trace that contains a timeline of actions, network requests, and DOM snapshots, which you can open in the trace viewer to see exactly what went wrong.</p></blockquote>
<ol>
<li>动词：fails（从句）、captures、contains（从句）、can open（从句）、see（to do）、went（从句）→ 主句谓语：<b>Playwright captures</b></li>
<li>括号：[When a test fails]，[that contains … snapshots]，[which you can open … wrong]</li>
<li>主干：<b>Playwright captures a trace.</b></li>
<li>回填：什么时候？测试失败时。什么样的 trace？包含操作时间线、网络请求和 DOM 快照的。它能干嘛？在 trace viewer 里打开，看到底哪里出错。</li>
</ol>
<p class="muted">之后每天读材料时，把最难的一句记在阅读记录里，用这 4 步拆一遍。</p>`,
    task: '写出主干，并说出每个括号修饰谁',
    exercises: [
      {
        q: "Locators, which are the central piece of Playwright's auto-waiting and retry-ability, represent a way to find elements on the page at any moment.",
        a: '主干：Locators represent a way。[which are … retry-ability] 补充说明 Locators；[to find elements …] 修饰 way。',
      },
      {
        q: 'If you are using a CI provider that does not support caching, you may want to install browsers in a separate step so that subsequent runs are faster.',
        a: '主干：you may want to install browsers。[If …] 条件；[that does not support caching] 修饰 provider；[so that … faster] 目的。',
      },
    ],
  },
];
