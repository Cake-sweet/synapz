'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/synapz/LoginForm';
import { AppLayout } from '@/components/synapz/AppLayout';

function LoginPageContent() {
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
    </AppLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-violet-400">Loading...</div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
