export default function AuthErrorPage() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-red-600">Authentication Error</h1>
        <p className="mt-3 text-gray-700">
          We could not complete the authentication process. This can happen if the redirect URL is not
          allowlisted in Supabase or the link has expired.
        </p>
        <ul className="mt-4 text-left list-disc list-inside text-gray-700">
          <li>Confirm the app URL is allowlisted in Supabase (Authentication &gt; URL Configuration).</li>
          <li>Try requesting a new sign-in or password reset link.</li>
          <li>Return to the login page and try again.</li>
        </ul>
        <a className="inline-block mt-6 text-blue-700 hover:underline" href="/login">
          Back to Login
        </a>
      </div>
    </div>
  );
}
