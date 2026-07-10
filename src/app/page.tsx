'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Check, ChevronRight, Menu, Play, X } from 'lucide-react';
import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';

const ASSET_ROOT = '/tejum-landing';

const SCENES = [
  { id: 'morning', label: 'Morning', detail: 'Wake gently', image: `${ASSET_ROOT}/images/01_morning_time.jpg` },
  { id: 'evening', label: 'Evening', detail: 'Warm arrival', image: `${ASSET_ROOT}/images/03_evening_time.jpg` },
  { id: 'night', label: 'Night', detail: 'Full glow', image: `${ASSET_ROOT}/images/04_night_time.jpg` },
  { id: 'privacy', label: 'Privacy', detail: 'Curtains closed', image: `${ASSET_ROOT}/images/08_night_time_curtains_closed.jpg` },
] as const;

const SYSTEMS = [
  {
    title: 'Smart Controls',
    detail: 'Touch panel · App · Scenes',
    copy: 'One refined control layer for every room, device and daily routine.',
    image: `${ASSET_ROOT}/images/smart-controls.jpg`,
  },
  {
    title: 'Smart Lights',
    detail: 'Facade glow · Mood layers · Landscape',
    copy: 'Architectural lighting that shifts naturally from morning to night.',
    image: `${ASSET_ROOT}/images/smart-lights.jpg`,
  },
  {
    title: 'Smart Security',
    detail: 'Cameras · Access · Perimeter safety',
    copy: 'Discreet protection that watches the home without interrupting it.',
    image: `${ASSET_ROOT}/images/smart-security.jpg`,
  },
] as const;

export default function LandingPage() {
  const [activeScene, setActiveScene] = useState<(typeof SCENES)[number]['id']>('evening');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const store = useVisualPlannerStore();
  
  useEffect(() => {
    setHydrated(true);
  }, []);

  const scene = SCENES.find((item) => item.id === activeScene) ?? SCENES[1];
  const hasDraft = hydrated && !bannerDismissed && store.lastUpdatedAt !== null && (store.automationPackage !== null || store.rooms.length > 0);

  return (
    <div className="brand-landing">
      {hasDraft && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-tertiary border-t border-border-color p-4 shadow-xl flex items-center justify-between gap-4 md:px-8">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary truncate">You have an unfinished smart-home plan.</h4>
            <p className="text-xs text-text-secondary truncate">Pick up exactly where you left off.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/planner/new" className="btn-primary py-1.5 px-3 text-sm whitespace-nowrap">Continue Plan</Link>
            <Link href="/login?redirect=/account/plans" className="btn-secondary py-1.5 px-3 text-sm hidden sm:inline-flex whitespace-nowrap">View Plans</Link>
            <button type="button" onClick={() => setBannerDismissed(true)} className="p-1 text-text-muted hover:text-text-primary rounded-lg transition-colors" aria-label="Dismiss">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <header className="brand-header">
        <Link href="/" className="brand-header__logo" aria-label="TEJUM home">
          <Image src={`${ASSET_ROOT}/images/tejum-logo-dark.png`} alt="TEJUM - Where your home meets its spark" width={400} height={170} className="dark:hidden" priority />
          <Image src={`${ASSET_ROOT}/images/tejum-logo-light.png`} alt="TEJUM - Where your home meets its spark" width={400} height={170} className="hidden dark:block" priority />
        </Link>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="Primary navigation">
          <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
          <a href="#ecosystem" onClick={() => setMenuOpen(false)}>Ecosystem</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
        </nav>
        <Link href="/planner/new" className="brand-header__cta">Plan your home <ArrowRight /></Link>
        <button type="button" className="brand-header__menu" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section className="brand-hero" aria-labelledby="brand-hero-title">
          <Image className="brand-hero__image" src={`${ASSET_ROOT}/images/hero-home.webp`} alt="A TEJUM-controlled luxury home illuminated at night" fill priority sizes="100vw" />
          <div className="brand-hero__shade" />
          <div className="brand-shell brand-hero__content">
            <div className="brand-hero__copy">
              <span className="brand-eyebrow"><i /> Smart Home Automation</span>
              <h1 id="brand-hero-title">Intelligence that <em>illuminates.</em></h1>
              <p>TEJUM brings elegance, comfort and control together. A smarter way to live, built for the way you dream.</p>
              <div className="brand-hero__actions">
                <Link href="/planner/new" className="brand-button is-primary">Start your smart home plan <ArrowRight /></Link>
                <a href="#experience" className="brand-button is-quiet"><Play /> Explore the experience</a>
              </div>
              <div className="brand-hero__proof">
                <span><Check /> No account to start</span>
                <span><Check /> Room-by-room planning</span>
                <span><Check /> Live estimate</span>
              </div>
            </div>

            <aside className="brand-plan-preview" aria-label="Planner preview">
              <div className="brand-plan-preview__head">
                <span>TEJUM Planner</span>
                <strong>From vision to a clear plan</strong>
              </div>
              <ol>
                <li className="is-done"><i><Check /></i><span><small>01</small><strong>Choose your experience</strong></span></li>
                <li className="is-done"><i><Check /></i><span><small>02</small><strong>Map every room</strong></span></li>
                <li className="is-active"><i>03</i><span><small>Configure</small><strong>Place controls and devices</strong></span></li>
                <li><i>04</i><span><small>Review</small><strong>See coverage and estimate</strong></span></li>
              </ol>
              <Link href="/planner/new">Open the interactive planner <ChevronRight /></Link>
            </aside>
          </div>
          <div className="brand-hero__scroll"><span /> Scroll to experience</div>
        </section>

        <section className="brand-scene" id="experience" aria-labelledby="scene-title">
          <div className="brand-shell brand-scene__heading">
            <div>
              <span className="brand-section-label">True visual control</span>
              <h2 id="scene-title">Your home changes with your life.</h2>
            </div>
            <p>Move from a bright morning to a private night scene with coordinated lighting, curtains and security. One command changes the whole atmosphere.</p>
          </div>
          <div className="brand-shell brand-scene__stage">
            <div className="brand-scene__visual">
              {SCENES.map((item) => (
                <Image
                  key={item.id}
                  className={item.id === scene.id ? 'is-active' : ''}
                  src={item.image}
                  alt={`${item.label} smart home scene`}
                  fill
                  sizes="(max-width: 900px) 100vw, 72vw"
                />
              ))}
              <div className="brand-scene__status"><span /><div><small>Active visual</small><strong>{scene.detail}</strong></div></div>
            </div>
            <div className="brand-scene__controls" role="group" aria-label="Smart home scenes">
              <div><span>Scene presets</span><strong>Select a mood</strong></div>
              {SCENES.map((item, index) => (
                <button type="button" key={item.id} className={item.id === activeScene ? 'is-active' : ''} onClick={() => setActiveScene(item.id)} aria-pressed={item.id === activeScene}>
                  <i>0{index + 1}</i><span><strong>{item.label}</strong><small>{item.detail}</small></span><ChevronRight />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="brand-control-story" aria-labelledby="control-story-title">
          <div className="brand-control-story__image">
            <Image src={`${ASSET_ROOT}/images/interior-living.webp`} alt="Premium living room connected by TEJUM smart controls" fill sizes="(max-width: 900px) 100vw, 58vw" />
          </div>
          <div className="brand-control-story__copy">
            <span className="brand-section-label">Remote control story</span>
            <h2 id="control-story-title">One Phone.<br />Total Control.</h2>
            <p>TEJUM moves from command to response across lighting, curtains, climate and connected comfort in one seamless living-room experience.</p>
            <div className="brand-control-list">
              {[
                ['remote.svg', 'Every room', 'Control spaces without switching between apps'],
                ['automation.svg', 'Coordinated scenes', 'Devices respond together, not one at a time'],
                ['security.svg', 'Always aware', 'See access, sensors and security at a glance'],
              ].map(([icon, title, copy]) => (
                <article key={title}>
                  <Image src={`${ASSET_ROOT}/icons/${icon}`} alt="" width={28} height={28} />
                  <span><strong>{title}</strong><small>{copy}</small></span>
                </article>
              ))}
            </div>
            <Link href="/planner/new">Plan room by room <ArrowRight /></Link>
          </div>
        </section>

        <section className="brand-ecosystem brand-shell" id="ecosystem" aria-labelledby="ecosystem-title">
          <div className="brand-ecosystem__heading">
            <span className="brand-section-label">One ecosystem</span>
            <h2 id="ecosystem-title">Three premium systems.<br />One intelligent TEJUM experience.</h2>
            <p>From centralised control to architectural lighting and discreet protection, every essential smart-home layer works through one refined interface.</p>
          </div>
          <div className="brand-system-grid">
            {SYSTEMS.map((system, index) => (
              <article key={system.title}>
                <div><Image src={system.image} alt={`${system.title} in a premium home`} fill sizes="(max-width: 760px) 100vw, 33vw" /></div>
                <span>0{index + 1}</span>
                <h3>{system.title}</h3>
                <strong>{system.detail}</strong>
                <p>{system.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="brand-process" id="how-it-works" aria-labelledby="process-title">
          <div className="brand-shell">
            <div className="brand-process__heading">
              <span className="brand-section-label">Interactive planning</span>
              <h2 id="process-title">See the plan before the site visit.</h2>
              <p>Turn an idea into a room-by-room brief, visual device map and practical investment range in minutes.</p>
            </div>
            <div className="brand-process__steps">
              {[
                ['01', 'Shape your home', 'Choose the property and generate a room map.'],
                ['02', 'Configure each room', 'Place real controls, lighting and security devices.'],
                ['03', 'Review the system', 'See room coverage, priorities and upgrade opportunities.'],
                ['04', 'Talk to TEJUM', 'Share the plan for consultation, site visit or detailed BOQ.'],
              ].map(([number, title, copy]) => (
                <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        <section className="brand-final-cta">
          <Image src={`${ASSET_ROOT}/images/bedroom-scene.webp`} alt="A calm TEJUM-controlled bedroom scene" fill sizes="100vw" />
          <div className="brand-final-cta__shade" />
          <div className="brand-shell brand-final-cta__content">
            <span className="brand-section-label">Start with your rooms</span>
            <h2>Build the smart home around how you live.</h2>
            <p>No account is required to begin. Your choices stay saved on this device while you explore.</p>
            <div>
              <Link href="/planner/new" className="brand-button is-primary">Start planning <ArrowRight /></Link>
              <Link href="/login" className="brand-button is-quiet">Continue an existing plan</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="brand-footer brand-shell">
        <Image src={`${ASSET_ROOT}/images/tejum-logo-dark.png`} alt="TEJUM" width={400} height={170} className="dark:hidden" />
        <Image src={`${ASSET_ROOT}/images/tejum-logo-light.png`} alt="TEJUM" width={400} height={170} className="hidden dark:block" />
        <p>Where your home meets its spark.</p>
        <span>© {new Date().getFullYear()} TEJUM. All rights reserved.</span>
      </footer>
    </div>
  );
}
