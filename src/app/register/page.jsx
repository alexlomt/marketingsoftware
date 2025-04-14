// src/app/register/page.jsx
import React, { Suspense } from 'react';
import RegisterFormFields from '@/components/RegisterFormFields'; // To be created

// Fallback UI for Registration
function RegisterFormLoading() {
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
       <div className="w-full max-w-md rounded-xl bg-gray-800/80 p-8 shadow-2xl backdrop-blur-sm animate-pulse">
         <div className="mb-6 h-8 bg-gray-700 rounded w-3/4 mx-auto"></div> {/* Title */}
         <div className="mb-8 h-4 bg-gray-700 rounded w-1/2 mx-auto"></div> {/* Subtitle */}
         <div className="space-y-6">
           <div className="h-16 bg-gray-700 rounded"></div> {/* Name field */}
           <div className="h-16 bg-gray-700 rounded"></div> {/* Email field */}
           <div className="h-16 bg-gray-700 rounded"></div> {/* Password field */}
           <div className="h-10 bg-gray-700 rounded"></div> {/* Button */}
         </div>
         <div className="mt-6 h-4 bg-gray-700 rounded w-1/3 mx-auto"></div> {/* Login link */}
       </div>
     </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormLoading />}>
      <RegisterFormFields />
    </Suspense>
  );
}
