'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'

export function CreateTabForm() {
  const [name, setName] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currency, creator_name: creatorName })
      })

      if (!response.ok) throw new Error('Failed to create tab')
      
      const data = await response.json()
      router.push(`/t/${data.invite_code}`)
    } catch (error) {
      console.error('Error creating tab:', error)
      alert('Failed to create tab. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Create a New Tab
        </CardTitle>
        <CardDescription>Start tracking IOUs with your group</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tab Name</Label>
            <Input
              id="name"
              placeholder="e.g., Roommates, Japan Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creatorName">Your Name</Label>
            <Input
              id="creatorName"
              placeholder="Enter your name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              className="w-full px-3 py-2 border rounded-md bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-primary/50 focus:border-primary"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <Button type="submit" className="w-full group" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Tab
                <Sparkles className="w-4 h-4 ml-1 transition-transform group-hover:rotate-12" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}