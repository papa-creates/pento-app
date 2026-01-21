export interface WritingMode {
  id: 'sprint' | 'deep' | 'flood' | 'gonzo';
  name: string;
  description: string;
  duration: number | null; // seconds, null = unlimited
  features: {
    timer: boolean;
    countdown: boolean;
    backspace: boolean;
    wordGoal: number | null;
    chaosPrompts: boolean;
  };
  senseiRestriction?: string; // sensei id if restricted
}

export const writingModes: WritingMode[] = [
  {
    id: 'sprint',
    name: 'Sprint',
    description: '20 minutes, timed pressure',
    duration: 20 * 60,
    features: {
      timer: true,
      countdown: true,
      backspace: true,
      wordGoal: null,
      chaosPrompts: false
    }
  },
  {
    id: 'deep',
    name: 'Deep Dive',
    description: 'No timer, no pressure',
    duration: null,
    features: {
      timer: true,
      countdown: false, // shows elapsed, not countdown
      backspace: true,
      wordGoal: null,
      chaosPrompts: false
    }
  },
  {
    id: 'flood',
    name: 'Flood',
    description: '10 minutes, no backspace',
    duration: 10 * 60,
    features: {
      timer: true,
      countdown: true,
      backspace: false,
      wordGoal: null,
      chaosPrompts: false
    }
  },
  {
    id: 'gonzo',
    name: 'Gonzo',
    description: '5 minutes of chaos',
    duration: 5 * 60,
    features: {
      timer: true,
      countdown: true,
      backspace: true,
      wordGoal: null,
      chaosPrompts: true
    },
    senseiRestriction: 'ryu'
  }
];

export function getMode(id: string): WritingMode | undefined {
  return writingModes.find(m => m.id === id);
}

export function getAvailableModes(senseiId: string): WritingMode[] {
  return writingModes.filter(m => !m.senseiRestriction || m.senseiRestriction === senseiId);
}

// Chaos prompt generator for Gonzo mode
const chaosSettings = ['A hospital waiting room', 'The last subway car', 'A funeral you crashed', 'Your childhood bedroom', 'A burning building', 'The edge of a cliff', 'A stranger\'s wedding', 'An interrogation room', 'The moment before impact', 'A place that no longer exists'];

const chaosConstraints = ['Only questions', 'No adjectives', 'Present tense only', 'Second person', 'One continuous sentence', 'Under 100 words', 'No dialogue', 'Every sentence starts with I', 'Backwards chronology', 'Only what you can see'];

const chaosMoods = ['Furious', 'Terrified', 'Deliriously happy', 'Deeply ashamed', 'Paranoid', 'Heartbroken', 'Manic', 'Numb', 'Desperate', 'Triumphant'];

export function generateChaosPrompt(): string {
  const setting = chaosSettings[Math.floor(Math.random() * chaosSettings.length)];
  const constraint = chaosConstraints[Math.floor(Math.random() * chaosConstraints.length)];
  const mood = chaosMoods[Math.floor(Math.random() * chaosMoods.length)];

  return `${setting}. ${constraint}. ${mood}.`;
}
