export default function Verify() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-widest">CHECK EMAIL</h1>
        <div className="border border-white/20 p-6 space-y-3">
          <p className="text-sm">A sign in link has been sent to your email address.</p>
          <p className="text-xs text-white/60">Click the link in the email to sign in. You can close this tab.</p>
        </div>
      </div>
    </div>
  )
}
