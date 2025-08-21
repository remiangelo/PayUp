'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SettleDialogProps {
  inviteCode: string
  participants: Array<{ id: string; name: string }>
  currentParticipantId: string
  onSettle: () => void
}

export function SettleDialog({ inviteCode, participants, currentParticipantId, onSettle }: SettleDialogProps) {
  const [open, setOpen] = useState(false)
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const otherParticipants = participants.filter(p => p.id !== currentParticipantId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tabs/${inviteCode}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_id: toId,
          amount: parseFloat(amount)
        })
      })

      if (!response.ok) throw new Error('Failed to settle')
      
      setOpen(false)
      setToId('')
      setAmount('')
      onSettle()
    } catch (error) {
      console.error('Error settling:', error)
      alert('Failed to record settlement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Settle Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Settlement</DialogTitle>
          <DialogDescription>
            Mark a payment as settled
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Paid To</Label>
            <select
              id="recipient"
              className="w-full px-3 py-2 border rounded-md"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              required
            >
              <option value="">Select recipient</option>
              {otherParticipants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Recording...' : 'Record Settlement'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}