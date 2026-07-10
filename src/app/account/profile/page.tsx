'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile(prev => ({ ...prev, email: user.email || '' }));
        const { data } = await supabase.from('customers').select('*').eq('user_id', user.id).single();
        if (data) {
          setProfile(prev => ({
            ...prev,
            full_name: data.full_name || '',
            phone: data.phone || '',
            city: data.city || ''
          }));
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('customers').upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your personal details
        </p>
      </div>

      <div className="glass-card-static p-6 sm:p-8">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="full_name"
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  disabled
                  value={profile.email}
                  className="input-field pl-10 opacity-70 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label htmlFor="phone" className="input-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="+91"
                />
              </div>
            </div>
            <div>
              <label htmlFor="city" className="input-label">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="city"
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="e.g. Mumbai"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-color flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
