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

interface AddIouDialogProps {
  inviteCode: string
  participants: Array<{ id: string; name: string }>
  onAdd: () => void
}

export function AddIouDialog({ inviteCode, participants, onAdd }: AddIouDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [splitType, setSplitType] = useState<'even' | 'custom'>('even')
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: {
        amount: number
        description: string
        split_type: 'even' | 'custom'
        splits?: Array<{ participant_id: string; amount: number }>
      } = {
        amount: parseFloat(amount),
        description,
        split_type: splitType
      }

      if (splitType === 'custom') {
        payload.splits = Object.entries(customSplits).map(([id, amt]) => ({
          participant_id: id,
          amount: amt
        }))
      }

      const response = await fetch(`/api/tabs/${inviteCode}/iou`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to add IOU')
      
      setOpen(false)
      setAmount('')
      setDescription('')
      setSplitType('even')
      setCustomSplits({})
      onAdd()
    } catch (error) {
      console.error('Error adding IOU:', error)
      alert('Failed to add IOU. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomSplitChange = (participantId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [participantId]: parseFloat(value) || 0
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">Add IOU</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New IOU</DialogTitle>
          <DialogDescription>
            Record an expense you paid for the group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Split Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="even"
                  checked={splitType === 'even'}
                  onChange={(e) => setSplitType(e.target.value as 'even')}
                />
                Split Evenly
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="custom"
                  checked={splitType === 'custom'}
                  onChange={(e) => setSplitType(e.target.value as 'custom')}
                />
                Custom Split
              </label>
            </div>
          </div>
          {splitType === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Amounts</Label>
              {participants.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="flex-1">{p.name}</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-24"
                    value={customSplits[p.id] || ''}
                    onChange={(e) => handleCustomSplitChange(p.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add IOU'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}