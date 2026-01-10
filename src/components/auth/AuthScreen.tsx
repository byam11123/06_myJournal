'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
interface AuthScreenProps {
  onLogin: () => void
  setActiveTab?: (tab: string) => void
}

export function AuthScreen({ onLogin, setActiveTab }: AuthScreenProps) {
  // For now, use window.location to reload after login
  // This will be refactored to use context later
  const [showSignup, setShowSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    try {
      // If demo user, initialize demo data first
      if (username === 'demo') {
        await fetch('/api/init-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'demo' })
        })
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Login failed',
          description: data.error || 'Invalid credentials',
          variant: 'destructive'
        })
        return
      }

      localStorage.setItem('goalTracker_user', JSON.stringify(data.user))
      if (setActiveTab) setActiveTab('goals')
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      })
      // Reload to update the page with authenticated state
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleSignup = async () => {
    if (!username || !email || !name || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, name, password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Signup failed',
          description: data.error || 'An error occurred',
          variant: 'destructive'
        })
        return
      }

      // Clear form
      setUsername('')
      setEmail('')
      setName('')
      setPassword('')

      // Show success message and switch to login
      toast({
        title: 'Account created successfully!',
        description: 'Please login with your credentials',
      })
      setShowSignup(false)
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: 'An error occurred',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">myJournal</CardTitle>
          <CardDescription>
            {showSignup ? 'Create your account to get started' : 'Login to continue your journey'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {showSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder={showSignup ? 'johndoe' : 'demo'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={showSignup ? '••••••' : 'demo123'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={showSignup ? handleSignup : handleLogin}
            >
              {showSignup ? 'Sign Up' : 'Login'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {showSignup ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowSignup(false)}
                    className="text-primary hover:underline"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setShowSignup(true)}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
            {!showSignup && (
              <div className="text-center text-xs text-muted-foreground bg-muted p-3 rounded">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>Username: <code>demo</code></p>
                <p>Password: <code>demo123</code></p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

