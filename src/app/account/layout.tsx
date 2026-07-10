'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  LifeBuoy, 
  User, 
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

const ACCOUNT_NAV = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard },
  { label: 'My Plans', href: '/account/plans', icon: FolderOpen },
  { label: 'Documents', href: '/account/documents', icon: FileText },
  { label: 'Support', href: '/account/support', icon: LifeBuoy },
  { label: 'Profile', href: '/account/profile', icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('customers').select('full_name').eq('user_id', user.id).single();
        if (data) {
          setUserName(data.full_name);
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }
      }
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-bg-tertiary border-b border-border-color flex items-center justify-between px-4 h-16 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/tejum-landing/images/tejum-logo.png" alt="TEJUM" width={100} height={42} className="h-8 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut} className="p-2 text-text-secondary hover:text-error" aria-label="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gold-muted flex items-center justify-center text-gold font-bold text-sm">
            {userName.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 bg-bg-tertiary border-r border-border-color flex-col w-64 lg:w-72">
        <div className="h-20 flex items-center px-6 border-b border-border-color">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/tejum-landing/images/tejum-logo.png" alt="TEJUM" width={120} height={50} className="h-10 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="p-6 border-b border-border-color">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-muted flex items-center justify-center text-gold font-bold">
              {userName.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName || 'Loading...'}</p>
              <p className="text-xs text-text-muted">Customer Account</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          {ACCOUNT_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-gold-muted text-gold font-medium' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-color">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-text-secondary hover:text-error transition-colors rounded-xl hover:bg-error-muted"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 lg:ml-72">
        <div className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-tertiary border-t border-border-color flex items-center justify-around px-2 h-16 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        {ACCOUNT_NAV.slice(0, 4).map((item) => { // Show 4 items on mobile nav
          const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
