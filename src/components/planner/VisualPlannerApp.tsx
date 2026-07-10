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
  LayoutGrid,
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
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileAppShell } from '@/components/mobile/MobileAppShell';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileProgressHeader } from '@/components/mobile/MobileProgressHeader';
import { MobileRoomCarousel } from '@/components/mobile/MobileRoomCarousel';
import { MobileStickyCTA } from '@/components/mobile/MobileStickyCTA';
import { DesktopRoomSetup } from '@/components/visualizer/DesktopRoomSetup';
import { MobileRoomSetup } from '@/components/visualizer/MobileRoomSetup';
import {
  AUTOMATION_PACKAGES,
  SETUP_TIERS,
  VISUAL_PROPERTY_TYPES,
  type SetupTier,
} from '@/lib/constants/visual-planner';
import { calculateVisualEstimate, formatCompactCurrency } from '@/lib/engines/visual-estimate-engine';
import {
  useVisualPlannerStore,
  type VisualPlannerRoom,
  type VisualPlannerStep,
} from '@/lib/stores/visual-planner-store';

const PACKAGE_ICONS = { Sparkles, SlidersHorizontal, Lightbulb, ShieldCheck, WandSparkles };
const PROPERTY_ICONS = { BedSingle, Building2, House, HousePlus, PanelsTopLeft, Home, PencilRuler };

const FLOW_STEPS: Array<{ id: VisualPlannerStep; label: string }> = [
  { id: 'package', label: 'Package' },
  { id: 'property', label: 'Property' },
  { id: 'rooms', label: 'Room map' },
  { id: 'configure', label: 'Room setup' },
  { id: 'review', label: 'Review' },
  { id: 'estimate', label: 'Estimate' },
  { id: 'contact', label: 'Consultation' },
];

const BACK_STEP: Partial<Record<VisualPlannerStep, VisualPlannerStep>> = {
  package: 'welcome',
  property: 'package',
  rooms: 'property',
  configure: 'rooms',
  review: 'configure',
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
      <span>{eyebrow}</span>
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
              <span className="package-choice__check">{selected ? <Check /> : <ArrowRight />}</span>
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

  return (
    <section className="visual-stage visual-stage--rooms">
      <div className="room-map-heading">
        <StepHeading eyebrow="Your room map" title={`${rooms.length} spaces, ready to shape.`} description="Rename, duplicate or move rooms before setting up devices." />
        <button type="button" onClick={generateRooms}><RotateCcw /> Regenerate map</button>
      </div>
      <div className="floor-tabs">
        {floorNumbers.map((floor) => <button type="button" key={floor} className={activeFloor === floor ? 'is-active' : ''} onClick={() => setActiveFloor(floor)}>{floor === 0 ? 'Ground floor' : `Floor ${floor}`}<span>{rooms.filter((room) => room.floorNumber === floor).length}</span></button>)}
      </div>
      <div className="room-map-grid">
        {visibleRooms.map((room, index) => (
          <article className="room-map-card" key={room.id}>
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
  const placements = rooms.flatMap((room) => room.placements);
  const configured = rooms.filter((room) => room.completionPct === 100 || room.placements.length > 0).length;
  const securityDevices = placements.filter((placement) => ['smart_lock', 'video_doorbell', 'cctv', 'motion_sensor'].includes(placement.device_key)).length;
  const unconfigured = rooms.length - configured;

  return (
    <section className="visual-stage">
      <StepHeading eyebrow="Your smart-home plan" title="A clear view before we price it." description="See coverage, gaps and high-impact upgrades without a technical spreadsheet." />
      <div className="review-hero">
        <div><span>Plan completion</span><strong>{rooms.length ? Math.round((configured / rooms.length) * 100) : 0}%</strong><p>{configured} of {rooms.length} rooms configured</p></div>
        <div className="review-hero__ring" style={{ '--review-progress': `${rooms.length ? (configured / rooms.length) * 360 : 0}deg` } as React.CSSProperties}><span>{placements.length}</span><small>devices</small></div>
      </div>
      <div className="review-card-grid">
        <article><Sparkles /><span>Automation package</span><strong>{packageName}</strong><p>Controls, scenes and room routines shaped around your choices.</p></article>
        <article><LayoutGrid /><span>Room coverage</span><strong>{configured}/{rooms.length} configured</strong><p>{unconfigured > 0 ? `${unconfigured} rooms still need a setup.` : 'Every room has a device plan.'}</p></article>
        <article><ShieldCheck /><span>Security coverage</span><strong>{securityDevices} safety devices</strong><p>{securityDevices > 0 ? 'Entry and sensor coverage is included.' : 'Add entry or sensor protection before the estimate.'}</p></article>
        <article><Lightbulb /><span>High-impact upgrade</span><strong>Mood scenes + curtains</strong><p>Premium living spaces benefit most from layered lighting.</p></article>
      </div>
      {unconfigured > 0 && <div className="plan-guidance"><CircleAlert /><span><strong>{unconfigured} rooms are still open.</strong><small>You can estimate now or configure them for a more accurate range.</small></span></div>}
    </section>
  );
}

function EstimateStage({ rooms }: { rooms: VisualPlannerRoom[] }) {
  const automationPackage = useVisualPlannerStore((state) => state.automationPackage);
  const estimate = calculateVisualEstimate(rooms.flatMap((room) => room.placements), automationPackage);
  return (
    <section className="visual-stage visual-stage--estimate">
      <StepHeading eyebrow="Preliminary estimate" title="A range you can plan around." description="Built from your actual room devices. A site survey confirms wiring, brands and final quantities." />
      <div className="estimate-layout">
        <div className="estimate-range-card"><span>Estimated project range</span><strong>{formatCompactCurrency(estimate.rangeLow)} <i>to</i> {formatCompactCurrency(estimate.rangeHigh)}</strong><p>Inclusive of a practical hardware, installation and integration allowance.</p><div><ShieldCheck /> Final quote after site survey</div></div>
        <div className="estimate-breakdown">
          <div><span>Smart hardware</span><strong>{formatCompactCurrency(estimate.hardwareLow)} – {formatCompactCurrency(estimate.hardwareHigh)}</strong><small>Controls, sensors, security and automation devices</small></div>
          <div><span>Installation</span><strong>{formatCompactCurrency(estimate.installationLow)} – {formatCompactCurrency(estimate.installationHigh)}</strong><small>Mounting, wiring checks and commissioning</small></div>
          <div><span>Programming & integration</span><strong>{formatCompactCurrency(estimate.integrationLow)} – {formatCompactCurrency(estimate.integrationHigh)}</strong><small>Scenes, app setup, voice and handover</small></div>
        </div>
      </div>
      <div className="estimate-note"><IndianRupee /><span><strong>This is not a final invoice.</strong><small>Brand selection, site condition and infrastructure can change the final BOQ.</small></span></div>
    </section>
  );
}

function ContactStage({ onSubmit, submitting, error }: { onSubmit: () => void; submitting: boolean; error: string | null }) {
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!hydrated) return <div className="visual-planner-loading"><Loader2 className="animate-spin" /><span>Opening your planner…</span></div>;

  const stepIndex = getStepIndex(store.step);
  const allPlacements = store.rooms.flatMap((room) => room.placements);
  const estimate = calculateVisualEstimate(allPlacements, store.automationPackage);
  const packageName = AUTOMATION_PACKAGES.find((item) => item.id === store.automationPackage)?.title ?? 'Guided setup';
  const backStep = BACK_STEP[store.step];

  function goBack() {
    if (backStep) store.setStep(backStep);
  }

  function goNext() {
    if (store.step === 'package' && store.automationPackage) store.setStep('property');
    else if (store.step === 'property') {
      store.generateRooms();
      store.setStep('rooms');
    } else if (store.step === 'rooms') {
      store.setActiveRoom(store.activeRoomId ?? store.rooms[0]?.id ?? null);
      store.setStep('configure');
    } else if (store.step === 'review') store.setStep('estimate');
    else if (store.step === 'estimate') store.setStep('contact');
  }

  function finishRoom() {
    const activeIndex = store.rooms.findIndex((room) => room.id === store.activeRoomId);
    if (store.activeRoomId) store.markRoomComplete(store.activeRoomId);
    const nextRoom = store.rooms[activeIndex + 1];
    if (nextRoom) store.setActiveRoom(nextRoom.id);
    else store.setStep('review');
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
    setSubmitError(null);
    try {
      const response = await fetch('/api/planner/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationPackage: store.automationPackage,
          property: store.property,
          rooms: store.rooms,
          lead: { ...store.lead, city: store.lead.city || store.property.city },
          estimate,
        }),
      });
      const result = await response.json() as { projectId?: string; error?: string };
      if (!response.ok || !result.projectId) throw new Error(result.error || 'Could not save your plan.');
      store.setPersistedProjectId(result.projectId);
      store.setStep('complete');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save your plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleMobileNavigation(destination: 'plan' | 'rooms' | 'estimate' | 'finish') {
    if (destination === 'plan') store.setStep(store.automationPackage ? 'property' : 'package');
    if (destination === 'rooms' && store.rooms.length) store.setStep('rooms');
    if (destination === 'estimate' && allPlacements.length) store.setStep('estimate');
    if (destination === 'finish' && allPlacements.length) store.setStep('contact');
  }

  const mobileNavActive = store.step === 'rooms' || store.step === 'configure' ? 'rooms' : store.step === 'estimate' || store.step === 'review' ? 'estimate' : store.step === 'contact' || store.step === 'complete' ? 'finish' : 'plan';
  const showStickyAction = ['package', 'property', 'rooms', 'review', 'estimate'].includes(store.step);
  const stickyLabel = store.step === 'package' ? 'Use this package' : store.step === 'property' ? 'Create my room map' : store.step === 'rooms' ? 'Start room setup' : store.step === 'review' ? 'See estimate' : 'Book expert help';
  const stickyDisabled = (store.step === 'package' && !store.automationPackage) || (store.step === 'rooms' && !store.rooms.length);

  return (
    <MobileAppShell>
      <div className={`visual-planner visual-planner--${store.step}`}>
        {store.step !== 'welcome' && store.step !== 'complete' && (
          <>
            <MobileHeader title={FLOW_STEPS[Math.max(0, stepIndex)]?.label ?? 'Smart Planner'} onBack={backStep ? goBack : undefined} />
            <MobileProgressHeader current={Math.max(1, stepIndex + 1)} total={FLOW_STEPS.length} label={FLOW_STEPS[Math.max(0, stepIndex)]?.label ?? 'Plan'} />
          </>
        )}
        <header className="visual-planner__desktop-header">
          <Link href="/" className="visual-brand"><span><Home /></span><div><strong>TEJUM</strong><small>Smart room planner</small></div></Link>
          {store.step !== 'welcome' && store.step !== 'complete' && <nav>{FLOW_STEPS.map((step, index) => <span key={step.id} className={index === stepIndex ? 'is-active' : index < stepIndex ? 'is-complete' : ''}><i>{index < stepIndex ? <Check /> : index + 1}</i>{step.label}</span>)}</nav>}
          <div className="visual-header-actions">{allPlacements.length > 0 && <span className="live-estimate-chip">Approx. {formatCompactCurrency(estimate.rangeLow)} – {formatCompactCurrency(estimate.rangeHigh)}</span>}<ThemeToggle compact /></div>
        </header>
        <main className="visual-planner__main">
          {store.step === 'welcome' && <WelcomeStage onStart={() => store.setStep('package')} />}
          {store.step === 'package' && <PackageStage />}
          {store.step === 'property' && <PropertyStage />}
          {store.step === 'rooms' && <RoomMapStage onConfigure={(roomId) => { store.setActiveRoom(roomId); store.setStep('configure'); }} />}
          {store.step === 'configure' && <ConfigureStage mobile={mobile} onFinishRoom={finishRoom} />}
          {store.step === 'review' && <ReviewStage rooms={store.rooms} packageName={packageName} />}
          {store.step === 'estimate' && <EstimateStage rooms={store.rooms} />}
          {store.step === 'contact' && <ContactStage onSubmit={submitPlan} submitting={submitting} error={submitError} />}
          {store.step === 'complete' && <CompleteStage projectId={store.persistedProjectId} onNewPlan={store.reset} />}
        </main>
        {store.step !== 'welcome' && store.step !== 'complete' && store.step !== 'configure' && store.step !== 'contact' && (
          <div className="visual-planner__desktop-actions">
            <button type="button" onClick={goBack}><ArrowLeft /> Back</button>
            <div><span>Saved on this device</span><button type="button" className="visual-primary-action" onClick={goNext} disabled={stickyDisabled}>{stickyLabel} <ArrowRight /></button></div>
          </div>
        )}
        {store.step === 'configure' && <MobileStickyCTA label="Save & next room" onClick={finishRoom} secondaryLabel="Room map" onSecondary={() => store.setStep('rooms')} />}
        {showStickyAction && <MobileStickyCTA label={stickyLabel} onClick={goNext} disabled={stickyDisabled} secondaryLabel={backStep ? 'Back' : undefined} onSecondary={backStep ? goBack : undefined} />}
        {store.step === 'contact' && <MobileStickyCTA label={submitting ? 'Saving your plan…' : 'Send plan to Tejum'} onClick={submitPlan} loading={submitting} secondaryLabel="Back" onSecondary={goBack} />}
        {store.step !== 'welcome' && store.step !== 'complete' && <MobileBottomNav active={mobileNavActive} onNavigate={handleMobileNavigation} />}
      </div>
    </MobileAppShell>
  );
}
