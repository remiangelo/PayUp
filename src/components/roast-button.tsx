'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface RoastButtonProps {
  edges: Array<{
    from_id: string
    from_name: string
    to_id: string
    to_name: string
    amount: number
  }>
  currency: string
}

export function RoastButton({ edges, currency }: RoastButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<typeof edges[0] | null>(null)
  const [roastText, setRoastText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateRoast = async (edge: typeof edges[0]) => {
    setSelectedEdge(edge)
    setLoading(true)

    try {
      const response = await fetch('/api/ai/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: edge.to_name,
          toName: edge.from_name,
          amount: edge.amount,
          currency,
          context: 'group expenses'
        })
      })

      if (!response.ok) throw new Error('Failed to generate roast')
      
      const data = await response.json()
      setRoastText(data.text)
    } catch (error) {
      console.error('Error generating roast:', error)
      setRoastText(`Hey ${edge.from_name}, time to pay ${edge.to_name} back! 💸`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(roastText)
    alert('Copied to clipboard!')
  }

  if (edges.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">AI Roast Reminder</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Playful Reminder</DialogTitle>
          <DialogDescription>
            AI will create a friendly nudge to settle up
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedEdge ? (
            <>
              <p className="text-sm text-muted-foreground">Select a balance to roast:</p>
              <div className="space-y-2">
                {edges.map((edge, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleGenerateRoast(edge)}
                    disabled={loading}
                  >
                    {edge.from_name} owes {edge.to_name} {currency}{edge.amount}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              {loading ? (
                <p className="text-center py-4">Generating witty reminder...</p>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{roastText}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} className="flex-1">
                      Copy to Clipboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEdge(null)
                        setRoastText('')
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}