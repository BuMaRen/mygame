// Prompts for using an AI as a practice partner: explain and correct, never translate wholesale.
// Placeholders are written as {{name}} and become input fields on the page.
export const PROMPTS = [
  {
    id: 'chat',
    track: 'daily',
    title: '闲聊陪练',
    use: '日常线的"写"。聊完说 stop 拿反馈，把被纠正的句子存进写作日志。',
    text: `Let's have a casual chat in English, like two friends texting.
Topic: {{话题|周末 / 工作近况 / 游戏 / 电影 / 旅行 / 随便}}.
Rules:
- Use simple, everyday English. Keep each message to 1–3 short sentences.
- Ask me a question each time so the conversation keeps going.
- Don't correct me during the chat.
- When I say "stop", list my mistakes and give a more natural way to say each one
  (explain in Chinese). Also list 3 useful phrases you used that I should learn.`,
  },
  {
    id: 'roleplay',
    track: 'daily',
    title: '场景角色扮演',
    use: '想练某个具体场景时用。',
    text: `Role-play a short conversation with me.
Scene: {{场景|和新同事第一次聊天 / 线上会议开始前寒暄 / 跟外国网友聊爱好 / 在咖啡店点单}}.
You play {{你扮演的角色|a friendly coworker}}. Keep it natural and simple.
After about 8 exchanges, stop and give me feedback in Chinese:
what sounded unnatural, and how a native speaker would say it.`,
  },
  {
    id: 'natural',
    track: 'daily',
    title: '这句地道吗',
    use: '闲聊时不确定一句话自不自然。',
    text: `Is this natural in casual conversation? If not, how would a native speaker say it?
Give 2–3 alternatives from casual to slightly polite. Explain briefly in Chinese.
Sentence: {{你的句子}}`,
  },
  {
    id: 'correct',
    track: 'both',
    title: '改我写的句子',
    use: '每天"写"那一步。改完把原句和改后的句子都存进写作日志。',
    text: `I'm learning English for work and casual chat.
Correct my text. For each change, explain briefly in Chinese why.
Then give one more natural version a native speaker would write.
Keep it simple — don't use fancy words.
My text: {{你写的英文}}`,
  },
  {
    id: 'parse',
    track: 'tech',
    title: '拆长句',
    use: '阅读卡在一句话上时。',
    text: `Break down this sentence for an English learner (explain in Chinese):
1. 主干（主语 + 谓语 + 宾语）是什么
2. 每个修饰成分修饰谁、是什么语法结构
3. 最后再给一句自然的中文意思
Sentence: {{句子}}`,
  },
  {
    id: 'check',
    track: 'both',
    title: '检查我读懂了没',
    use: '读完一段，想确认理解。',
    text: `Here is a paragraph I just read. Ask me 3 questions in simple English to check
whether I understood it. Wait for my answers, then tell me what I got wrong.
Paragraph: {{段落}}`,
  },
  {
    id: 'word',
    track: 'both',
    title: '解释一个词',
    use: '只要这个语境下的意思，不要词典式罗列。',
    text: `Explain the word "{{词}}" as used in this sentence: {{句子}}
Give: 中文意思（只这个语境下的）, a simple English definition,
and 2 short example sentences from {{语境|software/tech / everyday}} contexts.`,
  },
  {
    id: 'translate',
    track: 'tech',
    title: '中译英练习',
    use: '练工作回复。',
    text: `Give me 5 short Chinese sentences that a software engineer would typically write
in a GitHub issue or work chat. Wait for my English translations, then correct them.
Difficulty: {{难度|beginner}}`,
  },
];
