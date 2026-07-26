import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const NAVY = '#032759';
const DARK_NAVY = '#06162f';
const YELLOW = '#ffc400';
const WHITE = '#ffffff';
const MUTED = '#66768a';

const packageContent = {
  start: {
    name: 'SMART START',
    subtitle: 'Smarter living. Essential automation. Complete peace of mind.',
    accent: YELLOW,
    priceText: { 2: '₹1 LAKH*', 3: '₹1.5 LAKH*', 4: '₹2 LAKH*' },
    hero: '/tejum-landing/images/interior-living.webp',
    dark: false,
    groups: [
      ['SMART CONTROLS', 'Smart touch switches', 'Mobile app control', 'Voice control'],
      ['SMART LIGHTS', 'Dimmable LED lighting', 'Basic scene control', 'Schedules & timers'],
      ['SMART SECURITY', 'Video door phone', 'Door / window sensor', 'PIR motion sensor'],
    ],
  },
  plus: {
    name: 'SMART PLUS',
    subtitle: 'Enhanced comfort. Intelligent control. Better safety.',
    accent: '#45a62a',
    priceText: { 2: '₹1.8 LAKH*', 3: '₹2.5 LAKH*', 4: '₹3.2 LAKH*' },
    hero: '/tejum-landing/images/03_evening_time.jpg',
    dark: false,
    groups: [
      ['SMART CONTROLS', 'Smart touch switches', 'Curtain control', 'Appliance control', 'App & voice control'],
      ['SMART LIGHTS', 'Dimmable LED lighting', 'RGBW mood lighting', 'Scene automation', 'Motion-based lighting'],
      ['SMART SECURITY', 'Video door phone', 'CCTV camera', 'Door / window sensor', 'PIR motion sensor'],
    ],
  },
  premium: {
    name: 'SMART PREMIUM',
    subtitle: 'Advanced living. Smart security. Premium comfort.',
    accent: '#0b5dbb',
    priceText: { 2: '₹3 LAKH*', 3: '₹4 LAKH*', 4: '₹5 LAKH*' },
    hero: '/tejum-landing/images/01_morning_time.jpg',
    dark: false,
    groups: [
      ['SMART CONTROLS', 'Touch switches', 'Curtain & appliance control', 'Scene automation', 'Energy monitoring'],
      ['SMART LIGHTS', 'Dimmable LED lighting', 'RGBW & CCT lighting', 'Dynamic scenes', 'Schedules & routines'],
      ['SMART SECURITY', 'Video door phone', 'CCTV cameras', 'Smart door lock', 'Gas / smoke / leak alerts'],
      ['SMART AUTOMATION', 'AI routines & voice control', 'Smart scenes', 'Integrated control', 'All devices in one app'],
    ],
  },
  luxury: {
    name: 'SMART LUXURY',
    subtitle: 'Ultimate experience. Intelligent luxury. Full-home integration.',
    accent: '#d3a64b',
    priceText: { 2: '₹4.5 LAKH*', 3: '₹6 LAKH*', 4: '₹7.5 LAKH*' },
    hero: '/tejum-landing/images/hero-home.webp',
    dark: true,
    groups: [
      ['SMART CONTROLS', 'Designer touch panels', 'Multi-room scene control', 'Curtain & blind automation', 'Advanced energy monitoring'],
      ['SMART LIGHTS', 'Premium dimming', 'Tunable white & RGB lighting', 'Architectural mood scenes', 'Adaptive lighting'],
      ['SMART SECURITY', 'Smart door lock', 'HD CCTV coverage', 'Video door phone', 'Multi-sensor safety alerts'],
      ['SMART AUTOMATION', 'AI-powered scenes', 'Voice + app + panel control', 'Personalised routines', 'Integrated home experience'],
    ],
  },
} as const;

type PackageKey = keyof typeof packageContent;
type CatalogueItem = { bhk: 2 | 3 | 4; packageKey: PackageKey };

const catalogue: Record<string, CatalogueItem> = {};
for (const bhk of [2, 3, 4] as const) {
  for (const packageKey of Object.keys(packageContent) as PackageKey[]) {
    catalogue[`tejum-${bhk}bhk-smart-${packageKey}.png`] = { bhk, packageKey };
  }
}

const productTiles = [
  { label: 'Smart controls', image: '/tejum-landing/images/smart-controls.jpg' },
  { label: 'Smart lighting', image: '/tejum-landing/images/smart-lights.jpg' },
  { label: 'Smart security', image: '/tejum-landing/images/smart-security.jpg' },
];

function bullet(text: string, colour: string, textColour: string) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 20, lineHeight: 1.25, color: textColour }}>
      <span style={{ marginTop: 8, width: 7, height: 7, borderRadius: 99, background: colour, flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const item = catalogue[filename];
  if (!item) return new Response('Catalogue image not found', { status: 404 });

  const config = packageContent[item.packageKey];
  const origin = request.nextUrl.origin;
  const background = config.dark ? DARK_NAVY : WHITE;
  const primaryText = config.dark ? WHITE : NAVY;
  const secondaryText = config.dark ? '#d7dfeb' : MUTED;
  const panelBackground = config.dark ? '#0a2242' : '#f5f7fa';
  const cardBorder = config.dark ? '#315277' : '#e0e6ed';
  const logo = `${origin}/tejum-landing/images/${config.dark ? 'tejum-logo-light.png' : 'tejum-logo-dark.png'}`;
  const ctaText = config.accent === YELLOW || config.dark ? DARK_NAVY : WHITE;

  return new ImageResponse(
    <div style={{ width: 1080, height: 1350, display: 'flex', flexDirection: 'column', background, color: primaryText, fontFamily: 'Arial, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: 535, position: 'relative' }}>
        <div style={{ width: 610, padding: '44px 42px 30px 54px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, background: config.dark ? 'linear-gradient(90deg, #06162f 0%, #06162f 78%, rgba(6,22,47,0.25) 100%)' : 'linear-gradient(90deg, #ffffff 0%, #ffffff 78%, rgba(255,255,255,0.22) 100%)' }}>
          <img src={logo} width={330} height={120} style={{ objectFit: 'contain', objectPosition: 'left center' }} />
          <div style={{ display: 'flex', marginTop: 24 }}>
            <div style={{ display: 'flex', padding: '10px 22px', borderRadius: 12, background: config.accent, color: config.dark ? DARK_NAVY : NAVY, fontWeight: 800, fontSize: 30, letterSpacing: 1 }}>{item.bhk} BHK</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16, fontSize: 58, fontWeight: 900, lineHeight: 0.93, letterSpacing: -2 }}>
            <span>SMART HOME</span><span>PACKAGE</span>
          </div>
          <div style={{ display: 'flex', alignSelf: 'flex-start', marginTop: 20, padding: '10px 20px', borderRadius: 10, background: config.accent, color: ctaText, fontWeight: 900, fontSize: 30 }}>{config.name}</div>
          <div style={{ marginTop: 14, width: 430, fontSize: 20, lineHeight: 1.35, fontWeight: 700, textTransform: 'uppercase', color: secondaryText }}>{config.subtitle}</div>
        </div>

        <div style={{ position: 'absolute', inset: '0 0 0 440px', display: 'flex' }}>
          <img src={`${origin}${config.hero}`} width={640} height={535} style={{ width: 640, height: 535, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: config.dark ? 'linear-gradient(90deg, #06162f 0%, rgba(6,22,47,0.3) 38%, rgba(6,22,47,0.02) 100%)' : 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.34) 34%, rgba(255,255,255,0.01) 100%)' }} />
        </div>

        <div style={{ position: 'absolute', left: 54, bottom: 18, display: 'flex', padding: '13px 28px', borderRadius: 18, background: config.accent, color: ctaText, fontSize: 50, fontWeight: 900, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', zIndex: 4 }}>{config.priceText[item.bhk]}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '22px 38px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ height: 2, background: config.accent, flex: 1 }} /><div style={{ fontSize: 28, fontWeight: 900 }}>WHAT'S INCLUDED</div><div style={{ height: 2, background: config.accent, flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
          {config.groups.map((group) => (
            <div key={group[0]} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 210, borderRadius: 18, padding: '20px 18px', background: panelBackground, border: `1px solid ${cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13 }}>
                <span style={{ width: 32, height: 32, borderRadius: 99, background: config.accent, display: 'flex' }} /><span style={{ fontSize: 20, fontWeight: 900, color: primaryText }}>{group[0]}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{group.slice(1).map((line) => bullet(line, config.accent, primaryText))}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18 }}>
          <div style={{ height: 2, background: config.accent, flex: 1 }} /><div style={{ fontSize: 25, fontWeight: 900 }}>POPULAR SYSTEMS INCLUDED</div><div style={{ height: 2, background: config.accent, flex: 1 }} />
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {productTiles.map((product) => (
            <div key={product.label} style={{ display: 'flex', alignItems: 'center', flex: 1, height: 122, borderRadius: 18, overflow: 'hidden', background: panelBackground, border: `1px solid ${cardBorder}` }}>
              <img src={`${origin}${product.image}`} width={150} height={122} style={{ width: 150, height: 122, objectFit: 'cover' }} />
              <div style={{ display: 'flex', padding: '0 15px', fontSize: 21, fontWeight: 800, color: primaryText }}>{product.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {[
            ['24/7', 'REMOTE SUPPORT*'],
            ['12-HOUR', 'ON-SITE SUPPORT*'],
            ['UP TO 10 YEARS', 'WARRANTY*'],
            ['EXPERT', 'INSTALLATION'],
          ].map(([value, label]) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 82, padding: '12px 15px', borderRadius: 16, background: config.dark ? '#081d38' : '#ffffff', border: `1px solid ${cardBorder}` }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: config.accent }}>{value}</div><div style={{ marginTop: 3, fontSize: 15, fontWeight: 800, color: primaryText }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '17px 24px', borderRadius: 18, background: config.accent, color: ctaText }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 28, fontWeight: 900 }}>BOOK A SMART HOME CONSULTATION</span><span style={{ marginTop: 4, fontSize: 16, fontWeight: 700 }}>Start with the property, priorities, budget and timeline.</span></div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 900 }}>→</div>
        </div>

        <div style={{ display: 'flex', marginTop: 10, justifyContent: 'center', fontSize: 13, lineHeight: 1.25, color: secondaryText }}>
          *Starting price. Final scope and cost follow consultation, site survey and approved proposal. Support, response and warranty depend on eligible plans, cities, products, service windows and exclusions.
        </div>
      </div>
    </div>,
    { width: 1080, height: 1350, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400' } },
  );
}
