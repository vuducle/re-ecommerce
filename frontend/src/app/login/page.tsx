import LoginForm from '../../components/LoginForm.client';

export default function LoginPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      <LoginForm />
    </div>
  );
}
