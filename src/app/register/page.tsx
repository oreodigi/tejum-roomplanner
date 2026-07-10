'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Home, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (signUpError) throw signUpError;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName,
          role: 'customer',
        });

        if (profileError) throw profileError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/planner/projects');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <Home className="w-5 h-5 text-bg-primary" />
            </div>
            <span className="text-xl font-bold">TEJUM</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-text-secondary text-sm">
            Start planning your smart home today
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-card-static p-6 sm:p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold mb-2">Account Created!</h2>
              <p className="text-text-secondary text-sm">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div>
                <label htmlFor="fullName" className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="input-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error-muted text-error text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-1"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold hover:text-gold-light font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
