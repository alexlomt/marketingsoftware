// src/components/RegisterFormFields.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import Link from 'next/link';

export default function RegisterFormFields() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState(''); // New state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic password validation (add more rules as needed)
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Added organization_name
        body: JSON.stringify({ name, email, password, organization_name: organizationName }), 
      });

      if (response.ok) {
        // Registration successful - typically redirect to login or maybe dashboard
        console.log('Registration successful, redirecting to login...');
        router.push('/login?registered=true'); // Redirect to login with a success indicator
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed. Please try again.');
        console.error('Registration failed:', data.error);
      }
    } catch (err) {
      console.error('Registration request error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create Account
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Sign up to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Full Name"
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your Name"
            disabled={isLoading}
            className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
          />
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
            className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
          />
          <FormField
            label="Password"
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="•••••••• (min. 8 characters)"
            disabled={isLoading}
            className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
          />
          {/* ADD THIS FIELD */}
           <FormField
             label="Organization Name"
             type="text"
             id="organizationName"
             name="organizationName"
             value={organizationName}
             onChange={(e) => setOrganizationName(e.target.value)}
             required
             placeholder="Your Organization's Name"
             disabled={isLoading}
             className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
           />

          {error && (
            <p className="text-center text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={isLoading} variant="primary" size="lg">
            {isLoading ? (
              <span className="flex items-center justify-center">
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Creating Account...
              </span>
             ) : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
