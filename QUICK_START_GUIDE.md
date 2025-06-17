# FemTracker Database Quick Start Guide

## Immediate Setup (1-2 Days)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project: "femtracker-db"
3. Choose region closest to your users
4. Wait for project initialization (~2 minutes)

### Step 2: Configure Environment Variables
Add to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis Configuration (optional for now)
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Blob Storage (optional for now)
BLOB_READ_WRITE_TOKEN=your-blob-token
```

### Step 3: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @tanstack/react-query zod
```

### Step 4: Create Database Schema
In Supabase SQL Editor, run this minimal schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menstrual cycles (core feature)
CREATE TABLE menstrual_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Period flow tracking
CREATE TABLE period_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID REFERENCES menstrual_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  flow_intensity TEXT CHECK (flow_intensity IN ('Light', 'Medium', 'Heavy', 'Spotting')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptoms tracking
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom_type TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_type TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own cycles" ON menstrual_cycles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own period data" ON period_days
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM menstrual_cycles WHERE id = cycle_id
  ));

CREATE POLICY "Users can manage own symptoms" ON symptoms
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own moods" ON moods
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_cycles_user_date ON menstrual_cycles(user_id, start_date DESC);
CREATE INDEX idx_symptoms_user_date ON symptoms(user_id, date DESC);
CREATE INDEX idx_moods_user_date ON moods(user_id, date DESC);
```

### Step 5: Create Supabase Client
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  age?: number
  created_at: string
  updated_at: string
}

export interface MenstrualCycle {
  id: string
  user_id: string
  start_date: string
  end_date?: string
  cycle_length?: number
  notes?: string
  created_at: string
}

export interface PeriodDay {
  id: string
  cycle_id: string
  date: string
  flow_intensity: 'Light' | 'Medium' | 'Heavy' | 'Spotting'
  created_at: string
}

export interface Symptom {
  id: string
  user_id: string
  date: string
  symptom_type: string
  severity: number
  created_at: string
}

export interface Mood {
  id: string
  user_id: string
  date: string
  mood_type: string
  intensity: number
  created_at: string
}
```

### Step 6: Create Authentication Hook
Create `src/hooks/useAuth.ts`:

```typescript
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
```

### Step 7: Create Cycles Hook (Example)
Create `src/hooks/useCycles.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase, MenstrualCycle } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useCycles() {
  const { user } = useAuth()
  const [cycles, setCycles] = useState<MenstrualCycle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    fetchCycles()
  }, [user])

  const fetchCycles = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching cycles:', error)
    } else {
      setCycles(data || [])
    }
    setLoading(false)
  }

  const addCycle = async (cycleData: Omit<MenstrualCycle, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('menstrual_cycles')
      .insert([{ ...cycleData, user_id: user.id }])
      .select()

    if (error) {
      console.error('Error adding cycle:', error)
      return { error }
    } else {
      setCycles(prev => [data[0], ...prev])
      return { data }
    }
  }

  const updateCycle = async (id: string, updates: Partial<MenstrualCycle>) => {
    const { data, error } = await supabase
      .from('menstrual_cycles')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating cycle:', error)
      return { error }
    } else {
      setCycles(prev => prev.map(cycle => 
        cycle.id === id ? { ...cycle, ...data[0] } : cycle
      ))
      return { data }
    }
  }

  return {
    cycles,
    loading,
    addCycle,
    updateCycle,
    refetch: fetchCycles,
  }
}
```

### Step 8: Update Main Layout with Auth
Update `src/app/layout.tsx`:

```typescript
'use client'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/LoginForm'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
```

### Step 9: Create Login Component
Create `src/components/LoginForm.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      alert(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'} to FemTracker
        </h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
        
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-pink-600 hover:text-pink-700"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </form>
    </div>
  )
}
```

## Next Steps (Week 1-2)

1. **Test the basic setup**: Make sure authentication works
2. **Replace useState in one component**: Start with cycle tracking
3. **Add real-time updates**: Use Supabase's realtime features
4. **Add error handling**: Toast notifications for errors
5. **Implement data export**: Allow users to export their data

## Verification Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Authentication working (sign up/in/out)
- [ ] At least one data type (cycles) persisting to database
- [ ] Data survives page refresh
- [ ] Row Level Security protecting user data

This quick start gets you from zero to a working database in 1-2 days. Focus on the cycle tracking first since it's your core feature, then gradually migrate other components. 