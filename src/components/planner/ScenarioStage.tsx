import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';
import { Sun, LogOut, Home as HomeIcon, Film, BedDouble, Plus, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';

const SCENARIOS = [
  {
    key: 'good_morning',
    name: 'Good Morning',
    description: 'Slowly open curtains, fade in warm lights, and turn off AC as you wake up.',
    icon: Sun,
    color: 'amber',
  },
  {
    key: 'leaving_home',
    name: 'Leaving Home',
    description: 'One tap to turn off all lights, ACs, and fans. Arms the security system.',
    icon: LogOut,
    color: 'blue',
  },
  {
    key: 'welcome_home',
    name: 'Welcome Home',
    description: 'Path lights turn on automatically when you unlock the front door.',
    icon: HomeIcon,
    color: 'green',
  },
  {
    key: 'movie_mode',
    name: 'Movie Mode',
    description: 'Dim the living room lights to 10%, close curtains, and power on the TV.',
    icon: Film,
    color: 'purple',
  },
  {
    key: 'goodnight',
    name: 'Goodnight',
    description: 'Locks doors, turns off main lights, and sets AC to sleep mode.',
    icon: BedDouble,
    color: 'indigo',
  },
];

export function ScenarioStage() {
  const { scenarios, toggleScenario, setStep } = useVisualPlannerStore();
  const initialized = useRef(false);

  // Initialize store scenarios if empty
  useEffect(() => {
    if (scenarios.length === 0 && !initialized.current) {
      SCENARIOS.forEach(s => toggleScenario(s.key, false));
      initialized.current = true;
    }
  }, [scenarios.length, toggleScenario]);

  const handleToggle = (key: string) => {
    const isEnabled = scenarios.find(s => s.id === key)?.isEnabled ?? false;
    toggleScenario(key, !isEnabled);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-32 lg:pb-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">
          Your <span className="font-medium text-brand-600 dark:text-brand-400">Smart Home Experiences</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Automation isn&apos;t just about controlling devices&mdash;it&apos;s about orchestrating them to fit your life. Select the routines you want.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isEnabled = scenarios.find(s => s.id === scenario.key)?.isEnabled ?? false;

          return (
            <button
              key={scenario.key}
              onClick={() => handleToggle(scenario.key)}
              className={`relative flex flex-col items-start p-6 rounded-2xl border-2 text-left transition-all ${
                isEnabled
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-md'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-brand-200 dark:hover:border-brand-800 bg-white dark:bg-neutral-900'
              }`}
            >
              <div className="flex w-full justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isEnabled 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isEnabled
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-neutral-300 dark:border-neutral-700 text-transparent'
                }`}>
                  {isEnabled ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5 text-neutral-400" />}
                </div>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isEnabled ? 'text-brand-900 dark:text-brand-100' : 'text-neutral-900 dark:text-white'}`}>
                {scenario.name}
              </h3>
              <p className={`text-sm ${isEnabled ? 'text-brand-700 dark:text-brand-300' : 'text-neutral-600 dark:text-neutral-400'}`}>
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => setStep('review')}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-full font-medium shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
        >
          <span>See Final Plan</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
