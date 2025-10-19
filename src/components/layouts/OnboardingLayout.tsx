import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout for onboarding pages without navbar
export const OnboardingLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};



