'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, Users, FolderKanban, ShoppingBag,
  LogOut, Loader2, ShieldAlert, Home, Menu
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      setUserEmail(user.email || '');

      // Check role in database
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && (profile.role === 'admin' || profile.role === 'sales' || profile.role === 'dealer')) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
      setLoading(false);
    }
    checkRole();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <span className="text-text-secondary text-sm">Authenticating admin session...</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="glass-card-static w-full max-w-md p-6 text-center">
          <ShieldAlert className="w-14 h-14 text-error mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-text-secondary mb-6">
            You do not have permissions to view this admin panel. 
            Logged in as: <strong className="text-text-primary">{userEmail}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/planner/projects" className="btn-secondary text-sm">
              Go to Planner
            </Link>
            <button onClick={handleLogout} className="btn-primary text-sm !bg-error hover:!bg-error/80 !text-white">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-64 border-r border-glass-border bg-bg-secondary/40 shrink-0 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-glass-border">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shrink-0">
            <Home className="w-4 h-4 text-bg-primary" />
          </div>
          <span className="text-lg font-bold tracking-wider">TEJUM ADMIN</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5">
          {[
            { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { label: 'Leads Pipeline', href: '/leads', icon: <Users className="w-4 h-4" /> },
            { label: 'All Projects', href: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
            { label: 'Product Catalog', href: '/catalogue/products', icon: <ShoppingBag className="w-4 h-4" /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-glass transition-all"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-glass-border flex flex-col gap-2">
          <div className="text-xs text-text-muted truncate px-3">
            Admin: {userEmail}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error-muted transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-glass-border flex items-center justify-between px-6 md:px-8 shrink-0">
          <button className="md:hidden p-2 rounded-lg hover:bg-glass">
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="text-sm font-semibold hidden md:block">
            Internal Sales Workspace
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <Link href="/planner/projects" className="btn-secondary !py-1.5 !px-3.5 text-xs">
              Open Customer Planner
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
