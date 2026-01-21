export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'sensei' | 'special';
}

export const achievementDefs: AchievementDef[] = [
  // Milestones
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first writing session',
    icon: '✦',
    category: 'milestone'
  },
  {
    id: 'word-warrior-1k',
    name: 'Word Warrior',
    description: 'Write 1,000 total words',
    icon: '⚔',
    category: 'milestone'
  },
  {
    id: 'word-warrior-10k',
    name: 'Prolific',
    description: 'Write 10,000 total words',
    icon: '🗡',
    category: 'milestone'
  },
  {
    id: 'word-warrior-50k',
    name: 'Unstoppable',
    description: 'Write 50,000 total words',
    icon: '⚡',
    category: 'milestone'
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Write 1,000+ words in a single session',
    icon: '🏃',
    category: 'milestone'
  },

  // Streaks
  {
    id: 'the-habit',
    name: 'The Habit',
    description: 'Maintain a 7-day writing streak',
    icon: '🔥',
    category: 'streak'
  },
  {
    id: 'the-professional',
    name: 'The Professional',
    description: 'Maintain a 30-day writing streak',
    icon: '👑',
    category: 'streak'
  },

  // Sensei-specific
  {
    id: 'precision',
    name: 'Precision',
    description: 'Complete 10 sessions with Kaze',
    icon: '風',
    category: 'sensei'
  },
  {
    id: 'flow-state',
    name: 'Flow State',
    description: 'Complete 10 sessions with Sora',
    icon: '空',
    category: 'sensei'
  },
  {
    id: 'fearless',
    name: 'Fearless',
    description: 'Complete 10 sessions with Ryu',
    icon: '龍',
    category: 'sensei'
  },
  {
    id: 'genre-hopper',
    name: 'Genre Hopper',
    description: 'Write with all 3 senseis',
    icon: '🎭',
    category: 'sensei'
  },

  // Special
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a session after 10pm',
    icon: '🦉',
    category: 'special'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a session before 7am',
    icon: '🌅',
    category: 'special'
  }
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return achievementDefs.find(a => a.id === id);
}

export const totalAchievements = achievementDefs.length;
