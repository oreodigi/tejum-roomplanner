'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BedSingle,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  Home,
  House,
  HousePlus,
  IndianRupee,
  Lightbulb,
  Loader2,
  MessageCircle,
  PanelsTopLeft,
  PencilRuler,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  WandSparkles,
  Shield,
  Wrench,
  Award,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileAppShell } from '@/components/mobile/MobileAppShell';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileProgressHeader } from '@/components/mobile/MobileProgressHeader';
import { MobileRoomCarousel } from '@/components/mobile/MobileRoomCarousel';
import { MobileStickyCTA } from '@/components/mobile/MobileStickyCTA';
import { LiveJourneyDiagram } from '@/components/planner/LiveJourneyDiagram';
import { DesktopRoomSetup } from '@/components/visualizer/DesktopRoomSetup';
import { MobileRoomSetup } from '@/components/visualizer/MobileRoomSetup';
import { SyncManager } from '@/components/planner/SyncManager';
import {
  AUTOMATION_PACKAGES,
  SETUP_TIERS,
  VISUAL_PROPERTY_TYPES,
  type SetupTier,
} from '@/lib/constants/visual-planner';
import { ReadinessStage } from '@/components/planner/ReadinessStage';
import { ScenarioStage } from '@/components/planner/ScenarioStage';
import { calculateVisualEstimate, formatCompactCurrency } from '@/lib/engines/visual-estimate-engine';
import { calculateBOQ } from '@/lib/engines/boq/boq-engine';
import { validateSmartHomePlan } from '@/lib/engines/validation/plan-validator';
import { calculateLeadScore } from '@/lib/engines/sales/lead-scorer';
import {
  useVisualPlannerStore,
  type VisualPlannerRoom,
  type VisualPlannerStep,
} from '@/lib/stores/visual-planner-store';
import { trackPlannerEvent } from '@/lib/analytics/planner-events';

const PACKAGE_ICONS = { Sparkles, SlidersHorizontal, Lightbulb, ShieldCheck, WandSparkles };
const PROPERTY_ICONS = { BedSingle, Building2, House, HousePlus, PanelsTopLeft, Home, PencilRuler };

const FLOW_STEPS: Array<{ id: VisualPlannerStep; label: string }> = [
  { id: 'package', label: 'Package' },
  { id: 'property', label: 'Property' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'rooms', label: 'Room map' },
  { id: 'configure', label: 'Room setup' },
  { id: 'scenarios', label: 'Experiences' },
  { id: 'review', label: 'Review' },
  { id: 'estimate', label: 'Estimate' },
  { id: 'contact', label: 'Consultation' },
];

const BACK_STEP: Partial<Record<VisualPlannerStep, VisualPlannerStep>> = {
  package: 'welcome',
  property: 'package',
  readiness: 'property',
  rooms: 'readiness',
  configure: 'rooms',
  scenarios: 'configure',
  review: 'scenarios',
  estimate: 'review',
  contact: 'estimate',
};

function getStepIndex(step: VisualPlannerStep) {
  return FLOW_STEPS.findIndex((item) => item.id === step);
}

function useMobileViewport() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(query.matches);
    const timeoutId = window.setTimeout(update, 0);
    query.addEventListener('change', update);
    return () => {
      window.clearTimeout(timeoutId);
      query.removeEventListener('change', update);
    };
  }, []);

  return mobile;
}

function StepHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="visual-step-heading">
      <span><i />{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function WelcomeStage({ onStart }: { onStart: () => void }) {
  return (
    <section className="visual-welcome">
      <div className="visual-welcome__copy">
        <div className="visual-welcome__eyebrow"><span /><strong>Tejum Smart Planner</strong></div>
        <h1>Plan your smart home in minutes.</h1>
        <p>Build a room-by-room automation plan, see the impact as you design, then bring in a Tejum expert when you are ready.</p>
        <div className="visual-welcome__actions">
          <button type="button" className="visual-primary-action" onClick={onStart}>Start Smart Home Plan <ArrowRight /></button>
          <Link href="/login?redirect=/planner/projects">Continue Existing Plan <ChevronRight /></Link>
        </div>
        <div className="visual-welcome__trust">
          <span><Check /> No account to start</span>
          <span><Check /> Saved on this device</span>
          <span><Check /> India-ready estimates</span>
        </div>
      </div>
      <div className="visual-welcome__room" aria-hidden="true">
        <div className="isometric-room">
          <div className="isometric-room__wall is-back"><span className="smart-panel"><i /><i /><i /></span></div>
          <div className="isometric-room__wall is-side"><span className="window"><i /></span></div>
          <div className="isometric-room__floor">
            <span className="sofa"><i /><i /><i /></span>
            <span className="coffee-table" />
            <span className="floor-light" />
          </div>
          <span className="automation-pulse pulse-one" />
          <span className="automation-pulse pulse-two" />
          <div className="room-status-card"><Sparkles /><span><strong>Living room</strong><small>Premium scene ready</small></span></div>
        </div>
      </div>
    </section>
  );
}

function ResumeDecisionStage({ onContinue, onStartNew }: { onContinue: () => void, onStartNew: () => void }) {
  const store = useVisualPlannerStore();
  
  const totalRooms = store.rooms.length;
  const completedRooms = store.rooms.filter(r => r.completionPct === 100).length;
  const completionPct = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;
  
  const lastUpdated = store.lastUpdatedAt ? new Date(store.lastUpdatedAt).toLocaleDateString('en-IN') : 'Recently';
  
  return (
    <section className="visual-stage" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card-static p-6 sm:p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Continue where you left off?</h1>
        <p className="text-text-secondary text-sm mb-6">You have an unfinished smart-home plan.</p>
        
        <div className="bg-bg-tertiary rounded-xl p-4 mb-6 text-left border border-border-color">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">Draft Plan</span>
            <span className="text-sm text-text-secondary">{lastUpdated}</span>
          </div>
          <div className="text-sm text-text-secondary mb-3">
            {store.property.propertyType.toUpperCase()} • {store.rooms.length} Rooms
          </div>
          <div className="progress-bar !h-1.5 mb-1.5">
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="text-xs text-text-muted text-right">{completionPct}% Complete</div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button type="button" className="btn-primary w-full" onClick={onContinue}>Continue Previous Plan</button>
          <button type="button" className="btn-secondary w-full" onClick={onStartNew}>Start a New Plan</button>
          <Link href="/login?redirect=/account/plans" className="text-sm text-gold hover:text-gold-light font-medium mt-2 block">
            View All Plans
          </Link>
        </div>
      </div>
    </section>
  );
}

function PackageStage() {
  const { automationPackage, setAutomationPackage } = useVisualPlannerStore();

  return (
    <section className="visual-stage visual-stage--choice">
      <StepHeading eyebrow="Start with the experience" title="What should your home do for you?" description="Choose a direction. You can fine-tune every room later." />
      <div className="package-choice-grid">
        {AUTOMATION_PACKAGES.map((item, index) => {
          const Icon = PACKAGE_ICONS[item.icon as keyof typeof PACKAGE_ICONS];
          const selected = automationPackage === item.id;
          return (
            <button type="button" key={item.id} className={`package-choice ${selected ? 'is-selected' : ''}`} onClick={() => setAutomationPackage(item.id)} aria-pressed={selected}>
              <span className="package-choice__number">0{index + 1}</span>
              <span className="package-choice__icon"><Icon /></span>
              <span className="package-choice__content"><small>{item.eyebrow}</small><strong>{item.title}</strong><em>{item.description}</em></span>
              <span className="package-choice__check">{selected ? <Check /> : <span />}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PropertyStage() {
  const { property, updateProperty } = useVisualPlannerStore();

  function selectPropertyType(id: typeof property.propertyType) {
    const option = VISUAL_PROPERTY_TYPES.find((item) => item.id === id);
    if (!option) return;
    updateProperty({ propertyType: id, floors: option.floors, bedrooms: option.bedrooms, bathrooms: option.bathrooms });
  }

  return (
    <section className="visual-stage">
      <StepHeading eyebrow="Shape the room map" title="What are we planning?" description="Pick the closest property, then adjust only what matters." />
      <div className="property-choice-strip">
        {VISUAL_PROPERTY_TYPES.map((item) => {
          const Icon = PROPERTY_ICONS[item.icon as keyof typeof PROPERTY_ICONS];
          const selected = property.propertyType === item.id;
          return <button type="button" key={item.id} className={selected ? 'is-selected' : ''} onClick={() => selectPropertyType(item.id)} aria-pressed={selected}><Icon /><strong>{item.label}</strong><small>{item.compact}</small>{selected && <Check />}</button>;
        })}
      </div>
      <div className="property-essentials">
        <div className="property-essentials__counts">
          {([
            ['floors', 'Floors', 1, 5],
            ['bedrooms', 'Bedrooms', 0, 12],
            ['bathrooms', 'Bathrooms', 1, 12],
            ['balconies', 'Balconies', 0, 8],
          ] as const).map(([key, label, min, max]) => (
            <label key={key}><span>{label}</span><div><button type="button" onClick={() => updateProperty({ [key]: Math.max(min, property[key] - 1) })}>−</button><strong>{property[key]}</strong><button type="button" onClick={() => updateProperty({ [key]: Math.min(max, property[key] + 1) })}>+</button></div></label>
          ))}
        </div>
        <div className="property-essentials__details">
          <label><span>Project stage</span><select value={property.occupancy} onChange={(event) => updateProperty({ occupancy: event.target.value as typeof property.occupancy })}><option value="new_home">New home</option><option value="renovation">Renovation</option><option value="occupied">Already occupied</option></select></label>
          <label><span>City</span><input value={property.city} onChange={(event) => updateProperty({ city: event.target.value })} placeholder="e.g. Hyderabad" /></label>
          <label><span>Comfortable budget</span><select value={property.budgetRange} onChange={(event) => updateProperty({ budgetRange: event.target.value })}><option value="1l_2.5l">₹1L – ₹2.5L</option><option value="2.5l_5l">₹2.5L – ₹5L</option><option value="5l_10l">₹5L – ₹10L</option><option value="10l_25l">₹10L – ₹25L</option><option value="need_recommendation">Recommend for me</option></select></label>
          <label><span>Timeline</span><select value={property.timeline} onChange={(event) => updateProperty({ timeline: event.target.value })}><option value="0_3_months">0–3 months</option><option value="3_6_months">3–6 months</option><option value="6_12_months">6–12 months</option><option value="exploring">Just exploring</option></select></label>
        </div>
      </div>
    </section>
  );
}

function RoomMapStage({ onConfigure }: { onConfigure: (roomId: string) => void }) {
  const { rooms, property, generateRooms, addRoom, renameRoom, deleteRoom, duplicateRoom, moveRoom, setRoomTier } = useVisualPlannerStore();
  const [activeFloor, setActiveFloor] = useState(0);
  const floorNumbers = Array.from(new Set(rooms.map((room) => room.floorNumber))).sort((a, b) => a - b);
  const visibleRooms = rooms.filter((room) => room.floorNumber === activeFloor);

  const handleGenerateRooms = () => {
    generateRooms();
    trackPlannerEvent('room_map_generated', { city: property.city });
  };

  return (
    <section className="visual-stage visual-stage--rooms">
      <div className="room-map-heading">
        <StepHeading eyebrow="Your room map" title={`${rooms.length} spaces, ready to shape.`} description="Rename, duplicate or move rooms before setting up devices." />
        <button type="button" onClick={handleGenerateRooms}><RotateCcw /> Regenerate map</button>
      </div>
      <div className="floor-tabs">
        {floorNumbers.map((floor) => <button type="button" key={floor} className={activeFloor === floor ? 'is-active' : ''} onClick={() => setActiveFloor(floor)}>{floor === 0 ? 'Ground floor' : `Floor ${floor}`}<span>{rooms.filter((room) => room.floorNumber === floor).length}</span></button>)}
      </div>
      <div className="room-map-grid">
        {visibleRooms.map((room, index) => (
          <article className="room-map-card" key={room.id}>
            <div className="room-map-card__blueprint" aria-hidden="true"><span /><span /><span /><i>{room.floorNumber === 0 ? 'G' : room.floorNumber}</i></div>
            <div className="room-map-card__top"><span>{String(index + 1).padStart(2, '0')}</span><div><small>{room.roomType.replaceAll('_', ' ')}</small><input value={room.name} onChange={(event) => renameRoom(room.id, event.target.value)} aria-label="Room name" /></div><div className={`room-completion ${room.completionPct === 100 ? 'is-complete' : ''}`}>{room.completionPct === 100 ? <Check /> : `${room.completionPct}%`}</div></div>
            <div className="room-map-card__recommendation"><WandSparkles /><span><strong>{room.setupTier.replace('_', ' ')}</strong><small>{room.placements.length || (room.roomType.includes('bedroom') ? 5 : 4)} suggested devices</small></span></div>
            <div className="room-map-card__controls">
              <select value={room.setupTier} onChange={(event) => setRoomTier(room.id, event.target.value as SetupTier)} aria-label={`Setup level for ${room.name}`}>{SETUP_TIERS.map((tier) => <option key={tier.id} value={tier.id}>{tier.label}</option>)}</select>
              <select value={room.floorNumber} onChange={(event) => moveRoom(room.id, Number(event.target.value))} aria-label={`Floor for ${room.name}`}>{Array.from({ length: property.floors }, (_, floor) => <option key={floor} value={floor}>{floor === 0 ? 'Ground' : `Floor ${floor}`}</option>)}</select>
              <button type="button" onClick={() => duplicateRoom(room.id)} aria-label={`Duplicate ${room.name}`}><Copy /></button>
              <button type="button" onClick={() => deleteRoom(room.id)} aria-label={`Delete ${room.name}`}><Trash2 /></button>
            </div>
            <button type="button" className="room-map-card__setup" onClick={() => onConfigure(room.id)}>Set up room <ArrowRight /></button>
          </article>
        ))}
        <button type="button" className="room-map-add" onClick={() => addRoom()}><Plus /><strong>Add a room</strong><span>Create a custom space</span></button>
      </div>
    </section>
  );
}

function ConfigureStage({ mobile, onFinishRoom }: { mobile: boolean; onFinishRoom: () => void }) {
  const store = useVisualPlannerStore();
  const [selectedDeviceKey, setSelectedDeviceKey] = useState<string | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [showCeiling, setShowCeiling] = useState(false);
  const room = store.rooms.find((item) => item.id === store.activeRoomId) ?? store.rooms[0];

  if (!room) return <div className="visual-empty-state"><CircleAlert /><h2>No rooms yet</h2><p>Go back and generate your room map first.</p></div>;

  const setupProps = {
    room,
    selectedDeviceKey,
    selectedPlacementId,
    showCeiling,
    onSelectDevice: setSelectedDeviceKey,
    onSelectPlacement: setSelectedPlacementId,
    onPlace: (position: { x: number; y: number; z: number }, wallId?: string | null) => selectedDeviceKey && store.addPlacement(room.id, selectedDeviceKey, position, wallId),
    onUpdatePlacement: (placementId: string, updates: Parameters<typeof store.updatePlacement>[2]) => store.updatePlacement(room.id, placementId, updates),
    onDeletePlacement: (placementId: string) => {
      store.deletePlacement(room.id, placementId);
      setSelectedPlacementId(null);
    },
    onToggleCeiling: () => setShowCeiling((value) => !value),
    onApplyRecommended: () => {
      store.applyRecommendedSetup(room.id);
      setSelectedPlacementId(null);
      setSelectedDeviceKey(null);
    },
    onUpdateDimensions: (dimensions: { width_m?: number; length_m?: number; height_m?: number }) => store.updateRoomLayout(room.id, dimensions),
  };

  return (
    <section className="visual-stage visual-stage--configure">
      {mobile && <MobileRoomCarousel rooms={store.rooms} activeRoomId={room.id} onSelect={store.setActiveRoom} />}
      {mobile ? <MobileRoomSetup {...setupProps} /> : <DesktopRoomSetup {...setupProps} />}
      <div className="desktop-config-actions">
        <div><strong>{room.placements.length} devices</strong><span>Changes are saved on this device</span></div>
        <button type="button" onClick={onFinishRoom}>Save & next room <ArrowRight /></button>
      </div>
    </section>
  );
}

function ReviewStage({ rooms, packageName }: { rooms: VisualPlannerRoom[]; packageName: string }) {
  const store = useVisualPlannerStore();
  const placements = rooms.flatMap((room) => room.placements);
  const configured = rooms.filter((room) => room.completionPct === 100 || room.placements.length > 0).length;
  
  const boq = calculateBOQ(placements, store.property, store.readiness);
  const notices = validateSmartHomePlan(store.property, store.readiness, rooms, store.scenarios, boq);
  const enabledScenarios = store.scenarios.filter(s => s.isEnabled);

  return (
    <section className="visual-stage">
      <StepHeading eyebrow="Your smart-home plan" title="A clear view before we price it." description="See your personalized system architecture, infrastructure requirements, and any critical notes." />
      
      <div className="review-hero">
        <div><span>Plan coverage</span><strong>{rooms.length ? Math.round((configured / rooms.length) * 100) : 0}%</strong><p>{configured} of {rooms.length} rooms configured</p></div>
        <div className="review-hero__ring" style={{ '--review-progress': `${rooms.length ? (configured / rooms.length) * 360 : 0}deg` } as React.CSSProperties}><span>{placements.length}</span><small>devices</small></div>
      </div>

      {notices.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-medium text-neutral-900 dark:text-white">Important Notes</h3>
          {notices.map((notice, i) => (
            <div key={i} className={`p-4 rounded-xl border ${notice.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800' : notice.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800'}`}>
              <div className="flex gap-3">
                <CircleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium mb-1">{notice.message}</strong>
                  {notice.resolution && <p className="text-sm opacity-80">{notice.resolution}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="review-card-grid">
        <article>
          <Sparkles />
          <span>Core Package</span>
          <strong>{packageName}</strong>
          <p>Controls and scenes shaped around your choices.</p>
        </article>
        
        <article>
          <SlidersHorizontal />
          <span>Experiences</span>
          <strong>{enabledScenarios.length} Scenarios</strong>
          <p>Your selected automated routines like Good Morning or Movie Mode.</p>
        </article>
        
        <article>
          <ShieldCheck />
          <span>Infrastructure</span>
          <strong>{boq.items.filter(i => i.category === 'infrastructure').reduce((acc, i) => acc + i.quantity, 0)} Hubs</strong>
          <p>Local processing hubs to keep your home running offline.</p>
        </article>
        
        <article>
          <Lightbulb />
          <span>Networking</span>
          <strong>{boq.items.filter(i => i.category === 'networking').reduce((acc, i) => acc + i.quantity, 0)} Nodes</strong>
          <p>Enterprise-grade mesh WiFi nodes included for stable coverage.</p>
        </article>
      </div>
    </section>
  );
}

function EstimateStage({ rooms }: { rooms: VisualPlannerRoom[] }) {
  const store = useVisualPlannerStore();
  const estimate = calculateVisualEstimate(rooms.flatMap((room) => room.placements), store.automationPackage, store.property, store.readiness);
  const { lead, updateLead } = store;
  const [showSoftLead, setShowSoftLead] = useState(!lead.phone);
  const [softLeadPhone, setSoftLeadPhone] = useState('');

  const handleSoftLeadSubmit = () => {
    if (softLeadPhone.length >= 10) {
      updateLead({ phone: softLeadPhone, preferredContact: 'whatsapp' });
      setShowSoftLead(false);
      trackPlannerEvent('soft_lead_captured', { source: 'estimate_stage' });
    }
  };

  return (
    <section className="visual-stage visual-stage--estimate">
      <StepHeading eyebrow="Preliminary estimate" title="A range you can plan around." description="Built from your actual room devices. A site survey confirms wiring, brands and final quantities." />
      
      {showSoftLead && (
        <div className="soft-lead-capture">
          <div className="soft-lead-capture__content">
            <button type="button" className="soft-lead-capture__close" onClick={() => setShowSoftLead(false)} aria-label="Dismiss"><X /></button>
            <h3>Get this estimate on WhatsApp</h3>
            <p>We can send this breakdown to your phone so you don&apos;t lose it.</p>
            <div className="soft-lead-capture__form">
              <input value={softLeadPhone} onChange={(e) => setSoftLeadPhone(e.target.value.replace(/[^0-9+]/g, ''))} placeholder="10-digit mobile number" inputMode="tel" />
              <button type="button" onClick={handleSoftLeadSubmit}>Send</button>
            </div>
            <small>No spam. Just your smart-home estimate.</small>
          </div>
        </div>
      )}

      <div className="estimate-layout">
        <div className="estimate-range-card"><span>Estimated project range</span><strong>{formatCompactCurrency(estimate.rangeLow)} <i>to</i> {formatCompactCurrency(estimate.rangeHigh)}</strong><p>Inclusive of a practical hardware, installation and integration allowance.</p><div><ShieldCheck /> Final quote after site survey</div></div>
        <div className="estimate-breakdown">
          <div><span>Smart hardware</span><strong>{formatCompactCurrency(estimate.hardwareLow)} – {formatCompactCurrency(estimate.hardwareHigh)}</strong><small>Controls, sensors, security and automation devices</small></div>
          <div><span>Installation</span><strong>{formatCompactCurrency(estimate.installationLow)} – {formatCompactCurrency(estimate.installationHigh)}</strong><small>Mounting, wiring checks and commissioning</small></div>
          <div><span>Programming & integration</span><strong>{formatCompactCurrency(estimate.integrationLow)} – {formatCompactCurrency(estimate.integrationHigh)}</strong><small>Scenes, app setup, voice and handover</small></div>
        </div>
      </div>

      <div className="estimate-trust-section">
        <h3>Why plan with Tejum?</h3>
        <div className="estimate-trust-grid">
          <div className="trust-item"><Shield /><strong>Expert Installation</strong><p>Trained professionals handling your home&apos;s wiring safely.</p></div>
          <div className="trust-item"><Award /><strong>3-Year Warranty</strong><p>Comprehensive coverage on all supplied smart hardware.</p></div>
          <div className="trust-item"><Wrench /><strong>Lifetime Support</strong><p>Dedicated technical assistance whenever you need it.</p></div>
        </div>
      </div>

      <div className="estimate-note"><IndianRupee /><span><strong>This is not a final invoice.</strong><small>Brand selection, site condition and infrastructure can change the final BOQ.</small></span></div>
    </section>
  );
}

function ContactStage({ onSubmit, onBack, submitting, error }: { onSubmit: () => void; onBack: () => void; submitting: boolean; error: string | null }) {
  const { lead, property, updateLead } = useVisualPlannerStore();
  const intents = [
    { id: 'consultation' as const, label: 'Book consultation', description: 'Discuss the plan with a Tejum expert' },
    { id: 'site_visit' as const, label: 'Request site visit', description: 'Check wiring, rooms and infrastructure' },
    { id: 'boq' as const, label: 'Get detailed BOQ', description: 'Prepare a device and quantity breakdown' },
    { id: 'whatsapp' as const, label: 'Talk on WhatsApp', description: 'Continue the conversation quickly' },
  ];

  return (
    <section className="visual-stage visual-stage--contact">
      <StepHeading eyebrow="Bring in a Tejum expert" title="Turn the plan into a real home." description="Share only the essentials. Your room plan and estimate are attached automatically." />
      <button type="button" className="contact-back" onClick={onBack}><ArrowLeft /> Back to estimate</button>
      <div className="contact-layout">
        <div className="contact-intents">{intents.map((intent) => <button type="button" key={intent.id} className={lead.conversionIntent === intent.id ? 'is-selected' : ''} onClick={() => updateLead({ conversionIntent: intent.id })}><span>{lead.conversionIntent === intent.id ? <Check /> : <ChevronRight />}</span><div><strong>{intent.label}</strong><small>{intent.description}</small></div></button>)}</div>
        <div className="contact-form">
          <label><span>Name</span><input value={lead.name} onChange={(event) => updateLead({ name: event.target.value })} placeholder="Your full name" autoComplete="name" /></label>
          <label><span>Phone</span><input value={lead.phone} onChange={(event) => updateLead({ phone: event.target.value.replace(/[^0-9+]/g, '') })} placeholder="10-digit mobile number" inputMode="tel" autoComplete="tel" /></label>
          <label><span>City</span><input value={lead.city || property.city} onChange={(event) => updateLead({ city: event.target.value })} placeholder="Your city" autoComplete="address-level2" /></label>
          <label><span>Email <em>optional</em></span><input value={lead.email} onChange={(event) => updateLead({ email: event.target.value })} placeholder="you@example.com" inputMode="email" autoComplete="email" /></label>
          <label><span>Contact me by</span><select value={lead.preferredContact} onChange={(event) => updateLead({ preferredContact: event.target.value as typeof lead.preferredContact })}><option value="whatsapp">WhatsApp</option><option value="phone">Phone call</option><option value="email">Email</option></select></label>
          {error && <p className="contact-error">{error}</p>}
          <button type="button" className="contact-submit" onClick={onSubmit} disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : <MessageCircle />}<span>{submitting ? 'Saving your plan…' : 'Send plan to Tejum'}</span><ArrowRight /></button>
          <small className="contact-consent">By submitting, you agree that Tejum may contact you about this smart-home plan.</small>
        </div>
      </div>
    </section>
  );
}

function CompleteStage({ projectId, onNewPlan }: { projectId: string | null; onNewPlan: () => void }) {
  return (
    <section className="visual-complete">
      <div className="visual-complete__mark"><CheckCircle2 /></div>
      <span>Plan received</span>
      <h1>Your smart home now has a starting point.</h1>
      <p>A Tejum expert can review your room setup, estimate and preferred next step. Keep this browser open or return later; your local plan stays saved.</p>
      {projectId && <div className="visual-complete__reference"><small>Plan reference</small><strong>{projectId.slice(0, 8).toUpperCase()}</strong></div>}
      <div><button type="button" className="visual-primary-action" onClick={onNewPlan}>Plan another home <RotateCcw /></button><Link href="/">Back to Tejum</Link></div>
    </section>
  );
}

export function VisualPlannerApp() {
  const store = useVisualPlannerStore();
  const mobile = useMobileViewport();
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHydrated(true);
      trackPlannerEvent('planner_started');
      
      // Handle returning user behavior
      if (store.step === 'welcome' && store.lastUpdatedAt !== null && (store.automationPackage !== null || store.rooms.length > 0)) {
        store.setStep('resume_decision');
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!hydrated) return <div className="visual-planner-loading"><Loader2 className="animate-spin" /><span>Opening your planner…</span></div>;

  const stepIndex = getStepIndex(store.step);
  const allPlacements = store.rooms.flatMap((room) => room.placements);
  const estimate = calculateVisualEstimate(allPlacements, store.automationPackage, store.property, store.readiness);
  const packageName = AUTOMATION_PACKAGES.find((item) => item.id === store.automationPackage)?.title ?? 'Guided setup';
  const backStep = BACK_STEP[store.step];

  function navigateTo(nextStep: VisualPlannerStep) {
    const currentIndex = getStepIndex(store.step);
    const nextIndex = getStepIndex(nextStep);
    if (nextStep === 'contact' && !store.lead.city && store.property.city) {
      store.updateLead({ city: store.property.city });
    }
    setTransitionDirection(nextIndex >= currentIndex ? 'forward' : 'backward');
    store.setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (backStep) navigateTo(backStep);
  }

  function goNext() {
    if (store.step === 'package' && store.automationPackage) navigateTo('property');
    else if (store.step === 'property') navigateTo('readiness');
    else if (store.step === 'readiness') {
      if (store.rooms.length === 0) store.generateRooms();
      navigateTo('rooms');
    } else if (store.step === 'rooms') {
      store.setActiveRoom(store.activeRoomId ?? store.rooms[0]?.id ?? null);
      navigateTo('configure');
    } else if (store.step === 'scenarios') navigateTo('review');
    else if (store.step === 'review') navigateTo('estimate');
    else if (store.step === 'estimate') navigateTo('contact');
  }

  function finishRoom() {
    const activeIndex = store.rooms.findIndex((room) => room.id === store.activeRoomId);
    if (store.activeRoomId) store.markRoomComplete(store.activeRoomId);
    const nextRoom = store.rooms[activeIndex + 1];
    if (nextRoom) store.setActiveRoom(nextRoom.id);
    else navigateTo('scenarios');
  }

  async function submitPlan() {
    if (store.lead.name.trim().length < 2) {
      setSubmitError('Please enter your name.');
      return;
    }
    if (store.lead.phone.replace(/\D/g, '').length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const allPlacements = store.rooms.flatMap((room) => room.placements);
      const boq = calculateBOQ(allPlacements, store.property, store.readiness);
      const leadScore = calculateLeadScore(store.property, store.readiness, store.rooms, store.automationPackage, boq);

      const response = await fetch('/api/planner/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationPackage: store.automationPackage,
          property: store.property,
          rooms: store.rooms,
          lead: store.lead,
          estimate: calculateVisualEstimate(allPlacements, store.automationPackage, store.property, store.readiness),
          readiness: store.readiness,
          scenarios: store.scenarios,
          leadScore,
        }),
      });
      const result = await response.json() as { projectId?: string; error?: string };
      if (!response.ok || !result.projectId) throw new Error(result.error || 'Could not save your plan.');
      store.setPersistedProjectId(result.projectId);
      trackPlannerEvent('plan_submitted', { projectId: result.projectId });
      navigateTo('complete');
    } catch (err: unknown) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleMobileNavigation(destination: 'plan' | 'rooms' | 'estimate' | 'finish') {
    if (destination === 'plan') navigateTo(store.automationPackage ? 'property' : 'package');
    if (destination === 'rooms' && store.rooms.length) navigateTo('rooms');
    if (destination === 'estimate' && allPlacements.length) navigateTo('estimate');
    if (destination === 'finish' && allPlacements.length) navigateTo('contact');
  }

  const mobileNavActive = store.step === 'rooms' || store.step === 'configure' || store.step === 'scenarios' ? 'rooms' : store.step === 'estimate' || store.step === 'review' ? 'estimate' : store.step === 'contact' || store.step === 'complete' ? 'finish' : 'plan';
  const showStickyAction = ['package', 'property', 'readiness', 'rooms', 'scenarios', 'review', 'estimate'].includes(store.step);
  const stickyLabel = store.step === 'package' ? 'Use this package' : store.step === 'property' ? 'Next' : store.step === 'readiness' ? 'Create my room map' : store.step === 'rooms' ? 'Start room setup' : store.step === 'scenarios' ? 'See Review' : store.step === 'review' ? 'See estimate' : 'Book expert help';
  const stickyDisabled = (store.step === 'package' && !store.automationPackage) || (store.step === 'readiness' && !(store.readiness.condition && store.readiness.electrical && store.readiness.interior)) || (store.step === 'rooms' && !store.rooms.length);

  return (
    <MobileAppShell>
      <SyncManager />
      <div className={`visual-planner visual-planner--${store.step}`}>
        {store.step !== 'welcome' && store.step !== 'complete' && (
          <>
            <MobileHeader title={FLOW_STEPS[Math.max(0, stepIndex)]?.label ?? 'Smart Planner'} onBack={backStep ? goBack : undefined} />
            <MobileProgressHeader current={Math.max(1, stepIndex + 1)} total={FLOW_STEPS.length} label={FLOW_STEPS[Math.max(0, stepIndex)]?.label ?? 'Plan'} />
          </>
        )}
        <header className="visual-planner__desktop-header">
          <Link href="/" className="visual-brand">
            <img src="/tejum-landing/images/tejum-logo.png" alt="Tejum" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            <div><strong>TEJUM</strong><small>Smart room planner</small></div>
          </Link>
          {store.step !== 'welcome' && store.step !== 'complete' && <div className="visual-header-step"><span>Guided configuration</span><strong>Step {stepIndex + 1} of {FLOW_STEPS.length} · {FLOW_STEPS[stepIndex]?.label}</strong></div>}
          <div className="visual-header-actions">{allPlacements.length > 0 && <span className="live-estimate-chip">Approx. {formatCompactCurrency(estimate.rangeLow)} – {formatCompactCurrency(estimate.rangeHigh)}</span>}<ThemeToggle compact /></div>
        </header>
        <main className="visual-planner__main">
          {store.step === 'welcome' && <WelcomeStage onStart={() => navigateTo('package')} />}
          {store.step === 'resume_decision' && <ResumeDecisionStage onContinue={() => navigateTo('package')} onStartNew={() => { store.reset(); navigateTo('package'); }} />}
          {store.step !== 'welcome' && store.step !== 'resume_decision' && store.step !== 'complete' && (
            <div className={`guided-configurator ${store.step === 'configure' ? 'is-room-setup' : ''}`}>
              <div className={`guided-configurator__content is-${transitionDirection}`} key={store.step}>
                {store.step === 'package' && <PackageStage />}
                {store.step === 'property' && <PropertyStage />}
                {store.step === 'readiness' && <ReadinessStage />}
                {store.step === 'rooms' && <RoomMapStage onConfigure={(roomId) => { store.setActiveRoom(roomId); navigateTo('configure'); }} />}
                {store.step === 'configure' && <ConfigureStage mobile={mobile} onFinishRoom={finishRoom} />}
                {store.step === 'scenarios' && <ScenarioStage />}
                {store.step === 'review' && <ReviewStage rooms={store.rooms} packageName={packageName} />}
                {store.step === 'estimate' && <EstimateStage rooms={store.rooms} />}
                {store.step === 'contact' && <ContactStage onSubmit={submitPlan} onBack={goBack} submitting={submitting} error={submitError} />}
              </div>
              <LiveJourneyDiagram step={store.step} automationPackage={store.automationPackage} property={store.property} rooms={store.rooms} lead={store.lead} onNavigate={navigateTo} />
            </div>
          )}
          {store.step === 'complete' && <CompleteStage projectId={store.persistedProjectId} onNewPlan={store.reset} />}
        </main>
        {store.step !== 'welcome' && store.step !== 'resume_decision' && store.step !== 'complete' && store.step !== 'configure' && store.step !== 'contact' && (
          <div className="visual-planner__desktop-actions">
            <button type="button" onClick={goBack}><ArrowLeft /> Back</button>
            <div><span>Saved on this device</span><button type="button" className="visual-primary-action" onClick={goNext} disabled={stickyDisabled}>{stickyLabel} <ArrowRight /></button></div>
          </div>
        )}
        {store.step === 'configure' && <MobileStickyCTA label="Save & next room" onClick={finishRoom} secondaryLabel="Room map" onSecondary={() => navigateTo('rooms')} />}
        {showStickyAction && <MobileStickyCTA label={stickyLabel} onClick={goNext} disabled={stickyDisabled} secondaryLabel={backStep ? 'Back' : undefined} onSecondary={backStep ? goBack : undefined} />}
        {store.step === 'contact' && <MobileStickyCTA label={submitting ? 'Saving your plan…' : 'Send plan to Tejum'} onClick={submitPlan} loading={submitting} secondaryLabel="Back" onSecondary={goBack} />}
        {store.step !== 'welcome' && store.step !== 'resume_decision' && store.step !== 'complete' && <MobileBottomNav active={mobileNavActive} onNavigate={handleMobileNavigation} />}
      </div>
    </MobileAppShell>
  );
}
