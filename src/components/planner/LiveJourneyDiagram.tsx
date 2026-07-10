'use client';

import {
  Check,
  CircleDollarSign,
  House,
  LayoutGrid,
  MessageCircle,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { AUTOMATION_PACKAGES, VISUAL_PROPERTY_TYPES } from '@/lib/constants/visual-planner';
import { calculateVisualEstimate, formatCompactCurrency } from '@/lib/engines/visual-estimate-engine';
import type { GuestLeadDraft, GuestPropertyDraft, VisualPlannerRoom, VisualPlannerStep } from '@/lib/stores/visual-planner-store';
import type { AutomationPackage } from '@/lib/constants/visual-planner';

const JOURNEY_STEPS: Array<{
  id: Exclude<VisualPlannerStep, 'welcome' | 'complete'>;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { id: 'package', label: 'Your priorities', Icon: Sparkles },
  { id: 'property', label: 'Your home', Icon: House },
  { id: 'rooms', label: 'Room map', Icon: LayoutGrid },
  { id: 'configure', label: 'Room setup', Icon: SlidersHorizontal },
  { id: 'review', label: 'Plan check', Icon: Check },
  { id: 'estimate', label: 'Investment', Icon: CircleDollarSign },
  { id: 'contact', label: 'Expert handoff', Icon: MessageCircle },
];

interface LiveJourneyDiagramProps {
  step: VisualPlannerStep;
  automationPackage: AutomationPackage | null;
  property: GuestPropertyDraft;
  rooms: VisualPlannerRoom[];
  lead: GuestLeadDraft;
  onNavigate: (step: VisualPlannerStep) => void;
}

function getNodeValue(
  id: (typeof JOURNEY_STEPS)[number]['id'],
  automationPackage: AutomationPackage | null,
  property: GuestPropertyDraft,
  rooms: VisualPlannerRoom[],
  lead: GuestLeadDraft,
) {
  const placements = rooms.flatMap((room) => room.placements);
  const estimate = calculateVisualEstimate(placements, automationPackage);

  if (id === 'package') return AUTOMATION_PACKAGES.find((item) => item.id === automationPackage)?.title ?? 'Choose what matters';
  if (id === 'property') return VISUAL_PROPERTY_TYPES.find((item) => item.id === property.propertyType)?.label ?? 'Describe your property';
  if (id === 'rooms') return rooms.length ? `${rooms.length} spaces mapped` : 'Build your room list';
  if (id === 'configure') return placements.length ? `${placements.length} devices placed` : 'Design each room';
  if (id === 'review') return rooms.some((room) => room.completionPct > 0) ? 'Coverage ready to review' : 'Check coverage and gaps';
  if (id === 'estimate') return placements.length ? `${formatCompactCurrency(estimate.rangeLow)} - ${formatCompactCurrency(estimate.rangeHigh)}` : 'Updates as you configure';
  return lead.name ? `${lead.name}, ${lead.preferredContact}` : 'Choose the next action';
}

export function LiveJourneyDiagram({ step, automationPackage, property, rooms, lead, onNavigate }: LiveJourneyDiagramProps) {
  const currentIndex = Math.max(0, JOURNEY_STEPS.findIndex((item) => item.id === step));
  const progress = Math.round(((currentIndex + 1) / JOURNEY_STEPS.length) * 100);

  return (
    <aside className="live-journey" aria-label="Your smart home planning journey">
      <div className="live-journey__heading">
        <div>
          <span>Live journey</span>
          <strong>Your plan is taking shape</strong>
        </div>
        <b>{progress}%</b>
      </div>
      <div className="live-journey__progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <div className="live-journey__diagram">
        <svg viewBox="0 0 48 420" preserveAspectRatio="none" aria-hidden="true">
          <path className="journey-path journey-path--base" d="M24 8 C7 42 41 66 24 100 S7 158 24 196 S41 254 24 292 S7 350 24 412" />
          <path className="journey-path journey-path--active" pathLength="100" strokeDasharray={`${progress} 100`} d="M24 8 C7 42 41 66 24 100 S7 158 24 196 S41 254 24 292 S7 350 24 412" />
        </svg>
        <ol>
          {JOURNEY_STEPS.map(({ id, label, Icon }, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            const isReachable = index <= currentIndex;
            return (
              <li key={id} className={isActive ? 'is-active' : isComplete ? 'is-complete' : ''}>
                <button type="button" onClick={() => isReachable && onNavigate(id)} disabled={!isReachable} aria-current={isActive ? 'step' : undefined}>
                  <i>{isComplete ? <Check /> : <Icon />}</i>
                  <span><small>{label}</small><strong>{getNodeValue(id, automationPackage, property, rooms, lead)}</strong></span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="live-journey__save"><span><Check /></span><div><strong>Saved as you answer</strong><small>You can move back without losing details.</small></div></div>
    </aside>
  );
}
