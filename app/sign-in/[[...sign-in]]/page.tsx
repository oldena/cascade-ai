import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cascade-dark">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-cascade-card border border-cascade-border',
            headerTitle: 'text-white',
            headerSubtitle: 'text-cascade-muted',
            formButtonPrimary: 'bg-cascade-red hover:bg-red-700',
            formFieldInput: 'bg-cascade-dark border-cascade-border text-white',
            formFieldLabel: 'text-cascade-muted',
            footerActionLink: 'text-cascade-red',
          },
        }}
      />
    </div>
  )
}
