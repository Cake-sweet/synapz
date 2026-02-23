'use client';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/synapz/RegisterForm';
import { AppLayout } from '@/components/synapz/AppLayout';

function RegisterPageContent() {
  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <RegisterForm />
      </div>
    </AppLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-violet-400">Loading...</div></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
