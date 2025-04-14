'use client';

// Extremely simplified login page for debugging

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Login Page (Debug)
        </h1>
        <p className="text-center text-gray-300">
          This page loaded successfully. The issue might be in the original form logic or hooks.
        </p>
        {/* Add a link back to root or dashboard if needed for testing */}
        {/* <a href="/" className="mt-4 text-blue-400">Go to Home</a> */}
      </div>
    </div>
  );
}
