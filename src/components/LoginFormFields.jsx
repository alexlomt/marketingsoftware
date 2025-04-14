// src/components/LoginFormFields.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import Link from 'next/link';

export default function LoginFormFields() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook requires Suspense boundary
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Email"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            disabled={isLoading}
          />
          <FormField
            label="Password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
          />

          {error && (
            <p className="text-center text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

           <div className="mt-4 text-center text-sm text-gray-400">
             {/* Optional Links */}
           </div>
        </form>
      </div>
    </div>
  );
}
