'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Extracted form component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      // Login successful, redirect
      console.log('Login successful:', data);
      // Redirect to the page the user was trying to access, or dashboard
      const fromPath = searchParams.get('from') || '/dashboard';
      router.push(fromPath);
      // router.refresh(); // Optional: force refresh to update layout/data based on new auth state

    } catch (err) {
      console.error('Login API call error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Login
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          />
        </div>

        <div>
          <label 
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-900 p-3 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      {/* Optional: Add links for registration or password reset here */}
      {/* Example:
      <div className="mt-4 text-center text-sm">
        <a href="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
          Forgot your password?
        </a>
      </div>
      <div className="mt-2 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <a href="/register" className="font-medium text-blue-400 hover:text-blue-300">
          Sign up
        </a>
      </div>
      */}
    </div>
  );
}

// Main page component wraps the form in Suspense
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
       <Suspense fallback={<div className="text-white">Loading login form...</div>}>
         <LoginForm />
       </Suspense>
    </div>
  );
}
