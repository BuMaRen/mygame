// Reply templates. Pick a pattern instead of translating from Chinese.
export const WORK = {
  title: '工作回复',
  tip: '短句、主动语态、一句一个意思。',
  groups: [
    { name: '开头 / 致谢', items: ['Thanks for the report.', 'Thanks for looking into this.', 'Thanks, that makes sense.', 'Sorry for the late reply.', 'Hi <name>, just following up on this.'] },
    {
      name: '描述问题（提 issue）',
      items: [
        'When I <do X>, I expected <Y>, but <Z> happened.',
        'Steps to reproduce: 1. … 2. … 3. …',
        'This happens only when <condition>.',
        'It worked in v1.2 but broke after upgrading to v1.3.',
        'Here is the error message:',
        "I've tried <A> and <B>, but neither worked.",
      ],
    },
    {
      name: '确认理解 / 提问',
      items: [
        'Just to confirm, do you mean <…>?',
        "If I understand correctly, <…>. Is that right?",
        'Could you clarify what you mean by "<…>"?',
        'Could you share the full error log / a minimal repro?',
        'What version are you using?',
        'Is there a workaround for now?',
      ],
    },
    { name: '给方案 / 建议', items: ["I'd suggest <doing X>.", 'How about <doing X>?', 'One option is <X>. Another is <Y>.', 'I think <X> is better because <reason>.', 'Would it make sense to <X>?'] },
    {
      name: 'PR review',
      items: ['LGTM, thanks!', 'Nit: <小问题>. (Not blocking.)', 'Could you add a test for this case?', 'Why do we need <X> here?', 'Can we simplify this by <…>?', "I'm not sure about <X>. What do you think about <Y>?"],
    },
    { name: '回复别人的评论', items: ["Good point, I'll update it.", 'Done, PTAL.', 'Fixed in <commit / PR link>.', 'I see what you mean, but <…>.', "I don't think that's the cause, because <…>."] },
    { name: '汇报进度', items: ["I'm looking into it.", "I'll take a look today.", "I'll get back to you by <time>.", 'This is fixed in <version>.', "I'm blocked on <X>. Could you help?"] },
    { name: '结尾', items: ['Let me know if you have any questions.', 'Happy to help if you need anything else.', 'Thanks again!'] },
  ],
};

export const CASUAL = {
  title: '闲聊',
  tip: '短、口语、多反问。回答完就把问题抛回去（And you? / How about you?），对话就能一直往下走。',
  groups: [
    {
      name: '打招呼 / 寒暄',
      items: [
        'Hey! / Hi there! / Morning!',
        "How's it going? / How are you doing? / What's up?",
        'Pretty good, thanks. You?',
        "Not bad. / Busy, but good. / Can't complain.",
        'How was your weekend / day / trip?',
        'It was great. I <did X>. How about yours?',
        "Long time no see! / It's been a while!",
      ],
    },
    {
      name: '自我介绍',
      items: [
        "I'm <name>. I work as a software engineer in <city>.",
        'I mostly work on test automation.',
        "I've been doing this for about <N> years.",
        "I'm trying to improve my English, so sorry if I make mistakes!",
      ],
    },
    {
      name: '聊近况',
      items: [
        "I've been really busy with work lately.",
        'Not much, just working and relaxing at home.',
        'I just got back from <place>.',
        "I'm planning to <do X> this weekend.",
        'I finally finished <X>!',
      ],
    },
    {
      name: '聊兴趣',
      items: [
        'What do you do for fun?',
        'What do you like to do in your free time?',
        "I'm really into <games / hiking / cooking>.",
        "I've been watching <show> recently. Have you seen it?",
        "Have you tried <X>? I think you'd like it.",
        "I used to <play basketball>, but I don't have much time now.",
      ],
    },
    {
      name: '回应（表示在听）',
      items: [
        "Oh nice! / That's cool! / Sounds fun!",
        'Really? / No way! / Seriously?',
        'That makes sense. / I know, right?',
        'Same here. / Me too. / Me neither.',
        'Oh no, sorry to hear that. / That sucks.',
        'Good for you! / Congrats!',
        "Haha, that's funny.",
      ],
    },
    {
      name: '没听懂 / 争取时间',
      items: [
        'Sorry, what do you mean by "<X>"?',
        "Could you say that again? / Sorry, I didn't catch that.",
        'How do you say "<中文>" in English?',
        'Let me think… / Hmm, good question.',
        "I'm not sure how to put it, but <…>.",
      ],
    },
    {
      name: '约时间',
      items: [
        'Are you free on <day>?',
        'Do you want to grab lunch / coffee sometime?',
        'How about <time>? Does that work for you?',
        'Sure, sounds good!',
        "Sorry, I can't make it. Maybe next time?",
      ],
    },
    {
      name: '结束',
      items: [
        'Anyway, I should get going. / I gotta go.',
        'It was nice talking to you!',
        'Talk to you later! / Catch you later!',
        'Have a good one! / Have a nice weekend!',
      ],
    },
  ],
};
