import React, { Suspense } from 'react';
import LoginFormFields from '@/components/LoginFormFields'; // We'll create this component below

// Fallback UI while Suspense boundary is resolving
function LoginFormLoading() {
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
       <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
         <h1 className="mb-6 text-center text-3xl font-bold text-white">
           Login
         </h1>
         <p className="text-center text-gray-300">Loading...</p>
       </div>
     </div>
  );
}

// This remains the main page component, potentially a Server Component
export default function LoginPage() {
  return (
    // Wrap the part that needs searchParams in Suspense
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormFields />
    </Suspense>
  );
}
