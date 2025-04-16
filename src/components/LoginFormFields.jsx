// src/components/LoginFormFields.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const fromPath = searchParams.get('from') || '/dashboard';
        console.log(`Login successful, redirecting to: ${fromPath}`);
        router.replace(fromPath);
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed. Please check your credentials.');
        console.error('Login failed:', data.error);
      }
    } catch (err) {
      console.error('Login request error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field using shadcn Input and Label */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Password Field using shadcn Input and Label */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isLoading} size="lg" className="w-full"> 
            {isLoading ? (
              <span className="flex items-center justify-center">
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Logging in...
              </span>
             ) : 'Login'}
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/register" className="font-medium text-blue-500 hover:text-blue-400">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
