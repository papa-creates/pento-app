export interface SenseiVoice {
  greeting: string[];      // When selecting sensei
  completion: string[];    // When finishing a session
  streak: string[];        // Streak milestones
}

export interface Sensei {
  id: 'kaze' | 'sora' | 'ryu';
  name: string;
  kanji: string;
  meaning: string;
  philosophy: string;
  voice: SenseiVoice;
  prompts: Prompt[];
}

export interface Prompt {
  id: string;
  text: string;
}

export const senseis: Sensei[] = [
  {
    id: 'kaze',
    name: 'Kaze',
    kanji: '風',
    meaning: 'Wind',
    philosophy: 'Less is more. Every word must earn its place.',
    voice: {
      greeting: [
        'Good. You showed up.',
        'The page waits.',
        'Write true.',
        'No wasted words today.',
        'Begin.'
      ],
      completion: [
        'Done. That is what matters.',
        'The work is the work.',
        'You wrote. Now rest.',
        'Good. Come back tomorrow.',
        'Enough for today.',
        'Clean work.',
        'The page is no longer empty.'
      ],
      streak: [
        'Consistency. Keep it.',
        'Days add up. So do words.',
        'The habit is everything.',
        'Good. Do not stop now.',
        'Discipline shows.'
      ]
    },
    prompts: [
      { id: 'k1', text: 'Write about a meal. Make me taste it. One hundred words.' },
      { id: 'k2', text: 'Someone waits. Show me their waiting without naming the emotion.' },
      { id: 'k3', text: 'The moment before. Any moment before. Go.' },
      { id: 'k4', text: 'Six words. One complete story.' },
      { id: 'k5', text: 'Morning light enters a room. What does it find?' },
      { id: 'k6', text: 'Write about loss using only concrete objects.' },
      { id: 'k7', text: 'A conversation with no dialogue. Only actions.' },
      { id: 'k8', text: 'Describe a place you loved. Use only what you could touch.' },
      { id: 'k9', text: 'The last time you saw someone. Keep it simple.' },
      { id: 'k10', text: 'Write about your hands. What have they done today?' },
      { id: 'k11', text: 'One object on your desk. Give it a history.' },
      { id: 'k12', text: 'The sound of your morning. Nothing more.' },
      { id: 'k13', text: 'Write about water. Any form of water.' },
      { id: 'k14', text: 'A door closes. What happens next?' },
      { id: 'k15', text: 'The space between two people. Describe only the space.' },
      { id: 'k16', text: 'Write about hunger. The real kind or otherwise.' },
      { id: 'k17', text: 'One sentence about today. Make it true.' },
      { id: 'k18', text: 'The weight of something. Anything with weight.' },
      { id: 'k19', text: 'Write about silence. What fills it?' },
      { id: 'k20', text: 'An ending. Any ending. No adjectives.' }
    ]
  },
  {
    id: 'sora',
    name: 'Sora',
    kanji: '空',
    meaning: 'Sky',
    philosophy: 'Writing is discovery. Let words find their own path.',
    voice: {
      greeting: [
        'Welcome back. The sky is endless today.',
        'Let the words come. They know where to go.',
        'No judgment here. Just flow.',
        'Ready when you are.',
        'Breathe. Then begin.'
      ],
      completion: [
        'Beautiful. You trusted the process.',
        'The words found their way.',
        'You showed up for yourself. That matters.',
        'Rest now. The well will refill.',
        'Every session is a small discovery.',
        'You did something brave today.',
        'The sky thanks you for flying.'
      ],
      streak: [
        'Look how far you have come.',
        'Each day, the flow gets easier.',
        'You are building something beautiful.',
        'The practice is becoming you.',
        'Momentum is a gift. Keep it.'
      ]
    },
    prompts: [
      { id: 's1', text: 'Write without stopping. No backspace. Five minutes of pure flow.' },
      { id: 's2', text: 'Where are you right now? Every sensation. Leave nothing out.' },
      { id: 's3', text: 'A letter to who you were ten years ago.' },
      { id: 's4', text: 'What does freedom feel like in your body?' },
      { id: 's5', text: 'The last dream you remember. Just describe it.' },
      { id: 's6', text: 'A moment of unexpected joy. When did it find you?' },
      { id: 's7', text: 'Someone who changed you. Write them into being.' },
      { id: 's8', text: 'A place that felt like home, even if it was not.' },
      { id: 's9', text: 'What does your body remember that your mind forgot?' },
      { id: 's10', text: 'The moment you first felt truly awake.' },
      { id: 's11', text: 'Write something you have never told anyone.' },
      { id: 's12', text: 'What are you afraid to want?' },
      { id: 's13', text: 'The part of yourself you keep hidden. Let it speak.' },
      { id: 's14', text: 'Write about desire. Be honest.' },
      { id: 's15', text: 'What would you do if no one was watching?' },
      { id: 's16', text: 'Stream of consciousness. Start with the word "and".' },
      { id: 's17', text: 'Write about nothing. Make nothing into something.' },
      { id: 's18', text: 'Three words: light, bone, forgiveness. Go.' },
      { id: 's19', text: 'The conversation happening somewhere else right now.' },
      { id: 's20', text: 'You are rain. Tell me your journey.' }
    ]
  },
  {
    id: 'ryu',
    name: 'Ryu',
    kanji: '龍',
    meaning: 'Dragon',
    philosophy: 'Jump in. You are the story. Fear is fuel.',
    voice: {
      greeting: [
        'You again. Good. Let\'s burn something down.',
        'Fear is fuel. Use it.',
        'No thinking. Just fire.',
        'The dragon does not hesitate.',
        'Show me something dangerous.'
      ],
      completion: [
        'Wild. Untamed. Perfect.',
        'You survived the fire. Well done.',
        'That\'s what I\'m talking about.',
        'Chaos serves you well.',
        'The dragon approves.',
        'You didn\'t hold back. Good.',
        'More of that. Always more.'
      ],
      streak: [
        'The fire grows stronger.',
        'Day after day, you choose the hard path.',
        'Most people quit. You didn\'t.',
        'The dragon feeds on consistency.',
        'Keep this energy. Always.'
      ]
    },
    prompts: [
      { id: 'r1', text: 'Write like someone is chasing you. Five minutes. Go.' },
      { id: 'r2', text: 'You wake somewhere unfamiliar. What do you see first?' },
      { id: 'r3', text: 'Describe the last twenty-four hours like you are being questioned.' },
      { id: 'r4', text: 'The strangest person you ever met. Make them stranger.' },
      { id: 'r5', text: 'Write a review of your own life. Be brutal.' },
      { id: 'r6', text: 'What is the biggest lie everyone believes? Attack it.' },
      { id: 'r7', text: 'Write about power. Who has it. Who pretends to.' },
      { id: 'r8', text: 'Your generation failed at something. Name it. Explain it.' },
      { id: 'r9', text: 'When did you last feel truly free? Why did it end?' },
      { id: 'r10', text: 'Write your own ending. Make it interesting.' },
      { id: 'r11', text: 'Your biggest fear. Walk toward it on the page.' },
      { id: 'r12', text: 'The darkest thought you have had this week. Write it down.' },
      { id: 'r13', text: 'A confession you will never send.' },
      { id: 'r14', text: 'You are at an edge. Literal or not. What do you do?' },
      { id: 'r15', text: 'Write from the perspective of someone who dislikes you.' },
      { id: 'r16', text: 'Three strangers. One room. One secret. Go.' },
      { id: 'r17', text: 'Write a press release for the end of everything.' },
      { id: 'r18', text: 'You are running for leader of something absurd. Give your speech.' },
      { id: 'r19', text: 'Interview yourself. Both sides. Get uncomfortable.' },
      { id: 'r20', text: 'The worst advice you ever received. Follow it on paper.' }
    ]
  }
];

export function getSensei(id: string): Sensei | undefined {
  return senseis.find(s => s.id === id);
}

export function getRandomPrompt(sensei: Sensei): Prompt {
  return sensei.prompts[Math.floor(Math.random() * sensei.prompts.length)];
}

// Voice message helpers
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getGreeting(sensei: Sensei): string {
  return randomFrom(sensei.voice.greeting);
}

export function getCompletionMessage(sensei: Sensei): string {
  return randomFrom(sensei.voice.completion);
}

export function getStreakMessage(sensei: Sensei): string {
  return randomFrom(sensei.voice.streak);
}
