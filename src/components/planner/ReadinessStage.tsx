import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';
import { HardHat, Plug, PaintRoller, Wifi, Zap } from 'lucide-react';
import type { 
  ProjectCondition, 
  ElectricalReadiness, 
  InteriorReadiness, 
  NetworkReadiness, 
  BackupPower 
} from '@/lib/types';

export function ReadinessStage() {
  const { readiness, updateReadiness, setStep } = useVisualPlannerStore();

  const handleConditionSelect = (condition: ProjectCondition) => {
    updateReadiness({ condition });
  };

  const handleElectricalSelect = (electrical: ElectricalReadiness) => {
    updateReadiness({ electrical });
  };

  const handleInteriorSelect = (interior: InteriorReadiness) => {
    updateReadiness({ interior });
  };

  const handleNetworkSelect = (network: NetworkReadiness) => {
    updateReadiness({ network });
  };

  const handleBackupPowerSelect = (backupPower: BackupPower) => {
    updateReadiness({ backupPower });
  };

  const isComplete = readiness.condition && readiness.electrical && readiness.interior;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-32 lg:pb-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">
          Project <span className="font-medium text-brand-600 dark:text-brand-400">Readiness</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Help us understand the current status of your home to give you the most accurate infrastructure recommendations.
        </p>
      </div>

      <div className="space-y-12">
        {/* Project Condition */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <HardHat className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Current Stage</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'new_construction', label: 'New Construction' },
              { id: 'renovation', label: 'Renovation' },
              { id: 'nearly_completed', label: 'Nearly Complete' },
              { id: 'occupied_home', label: 'Living Here' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleConditionSelect(opt.id as ProjectCondition)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  readiness.condition === opt.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-brand-200 dark:hover:border-brand-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Electrical Status */}
        {readiness.condition && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Plug className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Electrical Status</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'not_started', label: 'Not Started', desc: 'Wiring hasn\'t begun yet' },
                { id: 'layout_available', label: 'Layout Ready', desc: 'Electrical drawings are finalized' },
                { id: 'neutral_available', label: 'Neutral Wired', desc: 'Neutral wires are pulled to switchboards' },
                { id: 'switchboards_installed', label: 'Completed', desc: 'Switchboards and plates are installed' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleElectricalSelect(opt.id as ElectricalReadiness)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    readiness.electrical === opt.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-200 dark:hover:border-amber-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="font-medium mb-1">{opt.label}</div>
                  <div className="text-sm opacity-80">{opt.desc}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Interior Status */}
        {readiness.electrical && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <PaintRoller className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Interior Design</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'not_started', label: 'Not Started' },
                { id: 'design_stage', label: 'Design Stage' },
                { id: 'wip', label: 'Work Ongoing' },
                { id: 'completed', label: 'Completed' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleInteriorSelect(opt.id as InteriorReadiness)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    readiness.interior === opt.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Network & Power Options */}
        {readiness.interior && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Network</h2>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'router_known', label: 'ISP Router Only' },
                  { id: 'mesh_wifi', label: 'Mesh WiFi System' },
                  { id: 'need_recommendation', label: 'Need Recommendation' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleNetworkSelect(opt.id as NetworkReadiness)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      readiness.network === opt.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-medium text-neutral-900 dark:text-white">Backup Power</h2>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'inverter', label: 'Home Inverter' },
                  { id: 'generator', label: 'Generator Backup' },
                  { id: 'none', label: 'No Backup Power' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleBackupPowerSelect(opt.id as BackupPower)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      readiness.backupPower === opt.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-green-200 dark:hover:border-green-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

      </div>

      {isComplete && (
        <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setStep('rooms')}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-full font-medium shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
          >
            <span>Design Rooms</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
