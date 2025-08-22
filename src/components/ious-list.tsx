'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Receipt } from 'lucide-react'

interface IOU {
  id: string
  description: string
  amount: number
  created_at: string
  payer: {
    name: string
  }
}

interface IOUsListProps {
  tabId: string
  currency: string
}

export function IOUsList({ tabId, currency }: IOUsListProps) {
  const [ious, setIOUs] = useState<IOU[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIOUs = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('ious')
        .select(`
          id,
          description,
          amount,
          created_at,
          participants!ious_payer_id_fkey(name)
        `)
        .eq('tab_id', tabId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching IOUs:', error)
      } else if (data) {
        const formattedData: IOU[] = data.map((item) => ({
          id: item.id || '',
          description: item.description || '',
          amount: item.amount || 0,
          created_at: item.created_at || '',
          payer: {
            name: (item as { participants?: { name?: string } }).participants?.name || 'Unknown'
          }
        }))
        setIOUs(formattedData)
      }
    } catch (error) {
      console.error('Error fetching IOUs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIOUs()
    
    // Set up realtime subscription
    const setupSubscription = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const channel = supabase
        .channel(`ious:${tabId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ious',
            filter: `tab_id=eq.${tabId}`
          },
          () => {
            fetchIOUs()
          }
        )
        .subscribe()
      
      return () => {
        supabase.removeChannel(channel)
      }
    }
    
    const cleanup = setupSubscription()
    return () => {
      cleanup.then(fn => fn())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId])

  const formatAmount = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
    }
    const symbol = currencySymbols[currency] || currency
    return `${symbol}${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground animate-pulse">Loading IOUs...</p>
        </CardContent>
      </Card>
    )
  }

  if (ious.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent IOUs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No IOUs yet. Add one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card fade-in" style={{animationDelay: '0.2s'}}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Recent IOUs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ious.map((iou, idx) => (
          <div key={iou.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium">{iou.description}</p>
                <p className="text-sm text-muted-foreground">
                  Paid by {iou.payer.name} • {formatDate(iou.created_at)}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {formatAmount(iou.amount)}
              </Badge>
            </div>
            {idx < ious.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}