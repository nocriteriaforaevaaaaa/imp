import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-gray-800">Welcome to Our Platform!</h1>
        <p className="mt-2 text-center text-gray-600">
          Sign up and start your journey with us.
        </p>
        <div className="mt-6">
          <SignUp />
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <a href="/sign-in" className="font-medium text-indigo-600 hover:underline">Sign in here</a>.
        </p>
      </div>
    </div>
  );
}
