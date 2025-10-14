import React from 'react';
import RegisterForm from '../../components/RegisterForm.client';

export const metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </main>
  );
}
