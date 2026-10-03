import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppStateProvider } from './contexts/AppStateContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <LanguageProvider>
      <AppStateProvider>
        <div className="bg-gray-200 min-h-screen flex items-center justify-center font-sans">
          <div className="w-full max-w-md bg-white h-screen sm:h-[870px] sm:max-h-[870px] sm:rounded-[3rem] sm:shadow-2xl sm:border-[10px] sm:border-gray-900 overflow-hidden relative sm:my-8 flex flex-col">
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors closeButton />
          </div>
        </div>
      </AppStateProvider>
    </LanguageProvider>
  );
}
