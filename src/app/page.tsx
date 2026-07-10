import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Lightbulb, Brain, Home } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg-primary/80 border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
              <Home className="w-4 h-4 text-bg-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">TEJUM</span>
            <span className="text-xs text-text-muted hidden sm:inline">Smart Home Planner</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link href="/planner/new" className="btn-primary text-sm !py-2 !px-4">
              Start Planning <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-muted text-gold text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Premium Smart Home Planning
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Design Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">
                Intelligent Home
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Plan your complete smart home room-by-room. From lighting and security to 
              AI automation — get a detailed requirement plan, BOQ, and estimate in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/planner/new" className="btn-primary text-base !py-3 !px-8">
                Start Your Smart Home Plan <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn-secondary text-base !py-3 !px-8">
                Continue Existing Plan
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">One Planner. Complete Automation.</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Everything you need to plan, estimate, and execute a smart home project.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Smart Controls',
                desc: 'Touch panels, app control, voice commands, and scene keypads',
                color: 'text-gold',
                bg: 'bg-gold-muted',
              },
              {
                icon: <Lightbulb className="w-6 h-6" />,
                title: 'Smart Lighting',
                desc: 'Mood scenes, dimming, RGB, motion-based and scheduled lighting',
                color: 'text-blue-400',
                bg: 'bg-info-muted',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Smart Security',
                desc: 'Locks, cameras, sensors, access control, and emergency alerts',
                color: 'text-emerald-400',
                bg: 'bg-success-muted',
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: 'AI Automation',
                desc: 'Arrival routines, bedtime scenes, energy optimization, and more',
                color: 'text-purple-400',
                bg: 'bg-[rgba(168,85,247,0.15)]',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-text-secondary">Plan your smart home in four simple stages</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Tell Us About You', desc: 'Your details and what you want to automate' },
              { step: '02', title: 'Configure Property', desc: 'Property type, rooms, and floor details' },
              { step: '03', title: 'Plan Each Room', desc: 'Devices, switchboards, controls, and scenes' },
              { step: '04', title: 'Get Your Plan', desc: 'Recommendations, estimates, and BOQ' },
            ].map((item) => (
              <div key={item.step} className="text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gold-muted border-2 border-gold/30 flex items-center justify-center text-gold font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full text-center">
          <div className="glass-card-static p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Build Your Smart Home?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Start planning for free. No account required for your first plan.
              Save and continue anytime.
            </p>
            <Link href="/planner/new" className="btn-primary text-base !py-3 !px-8 inline-flex">
              Begin Smart Home Planning <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-glass-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gold flex items-center justify-center">
              <Home className="w-3 h-3 text-bg-primary" />
            </div>
            <span className="text-sm font-semibold">TEJUM</span>
            <span className="text-xs text-text-muted">Where your home meets its spark.</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Tejum Smart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
