'use client';

import { useEffect, useState, useRef } from 'react';
import { useVisualPlannerStore } from '@/lib/stores/visual-planner-store';
import { createClient } from '@/lib/supabase/client';
import { Save } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SyncManager() {
  const store = useVisualPlannerStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showAnonymousPrompt, setShowAnonymousPrompt] = useState(false);
  const pathname = usePathname();
  
  const lastSavedAtRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check auth status
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  // Sync logic
  useEffect(() => {
    // Only run if there is actual draft content
    if (!store.lastUpdatedAt || (store.automationPackage === null && store.rooms.length === 0)) {
      return;
    }

    // Skip if no new changes since last save
    if (store.lastUpdatedAt <= lastSavedAtRef.current) {
      return;
    }

    if (isAuthenticated) {
      // Debounced save for authenticated users
      setSyncStatus('saving');
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Compute room count and completion
          const totalRooms = store.rooms.length;
          const completedRooms = store.rooms.filter(r => r.completionPct === 100).length;
          const completionPct = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;
          
          const draftData = {
            automationPackage: store.automationPackage,
            property: store.property,
            readiness: store.readiness,
            rooms: store.rooms,
            scenarios: store.scenarios,
          };

          const projectPayload = {
            name: `${store.property.propertyType.toUpperCase()} Smart Home`,
            created_by: user.id,
            property_type: store.property.propertyType,
            room_count: totalRooms,
            completion_pct: completionPct,
            status: 'draft',
            draft_data: draftData,
            updated_at: new Date().toISOString()
          };

          if (store.persistedProjectId) {
            // Update existing project
            const { error } = await supabase
              .from('projects')
              .update(projectPayload)
              .eq('id', store.persistedProjectId);
            if (error) throw error;
          } else {
            // Insert new project
            const { data, error } = await supabase
              .from('projects')
              .insert(projectPayload)
              .select('id')
              .single();
            if (error) throw error;
            if (data) {
              store.setPersistedProjectId(data.id);
            }
          }

          lastSavedAtRef.current = store.lastUpdatedAt!;
          setSyncStatus('saved');
          setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (err) {
          console.error('Failed to sync draft:', err);
          setSyncStatus('error');
        }
      }, 2000); // 2 second debounce

    } else {
      // Show persistent prompt for anonymous users if they have made significant progress
      if (store.rooms.length > 0 && !showAnonymousPrompt) {
        setShowAnonymousPrompt(true);
      }
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [store.lastUpdatedAt, isAuthenticated, store, showAnonymousPrompt]);

  // Don't render anything if we're not actively in the planner
  if (!pathname?.startsWith('/planner/new')) {
    return null;
  }

  return (
    <>
      {/* Authenticated Sync Status Indicator */}
      {isAuthenticated && syncStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 z-50 bg-bg-tertiary border border-border-color shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-2">
          {syncStatus === 'saving' && (
            <>
              <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-text-secondary">Saving...</span>
            </>
          )}
          {syncStatus === 'saved' && (
            <>
              <Save className="w-3.5 h-3.5 text-success" />
              <span className="text-success">Saved to account</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="text-error">Save failed</span>
            </>
          )}
        </div>
      )}

      {/* Anonymous Save Prompt */}
      {!isAuthenticated && showAnonymousPrompt && (
        <div className="fixed top-20 right-4 z-50 bg-bg-tertiary border border-gold/30 shadow-2xl rounded-xl p-4 max-w-sm animate-in slide-in-from-right-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 text-gold">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">Save your progress</h4>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                Create an account to save this plan and access your estimate across all your devices.
              </p>
              <div className="flex items-center gap-2">
                <Link href="/register?redirect=/planner/new" className="btn-primary py-1.5 px-3 text-xs w-full text-center">
                  Save Plan
                </Link>
                <button onClick={() => setShowAnonymousPrompt(false)} className="btn-secondary py-1.5 px-3 text-xs w-full">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
