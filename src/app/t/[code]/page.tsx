'use client'

import { useState, useEffect, use } from 'react'
import { JoinTabForm } from '@/components/join-tab-form'
import { BalancesList } from '@/components/balances-list'
import { AddIouDialog } from '@/components/add-iou-dialog'
import { SettleDialog } from '@/components/settle-dialog'
import { RoastButton } from '@/components/roast-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Tab {
  id: string
  name: string
  currency: string
  invite_code: string
}

interface Participant {
  id: string
  name: string
  tab_id: string
}

interface Edge {
  from_id: string
  from_name: string
  to_id: string
  to_name: string
  amount: number
}

interface Balance {
  participant_id: string
  participant_name: string
  net_balance: number
}

interface TabData {
  tab: Tab
  current_participant_id: string
  participants: Participant[]
  edges: Edge[]
  balances: Balance[]
}

export default function TabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [data, setData] = useState<TabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/tabs/${code}/balances`)
      if (response.ok) {
        const tabData = await response.json()
        setData(tabData)
        setHasAccess(true)
      } else if (response.status === 401) {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error fetching tab data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  useEffect(() => {
    if (!hasAccess || !data) return

    const supabase = createClient()
    
    const channel = supabase
      .channel(`tab:${data.tab.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ious',
          filter: `tab_id=eq.${data.tab.id}`
        },
        () => {
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements',
          filter: `tab_id=eq.${data.tab.id}`
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.tab?.id, hasAccess])

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Invite link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <JoinTabForm inviteCode={code} onJoin={fetchData} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Tab not found</p>
      </div>
    )
  }

  const currentParticipant = data.participants.find(p => p.id === data.current_participant_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{data.tab.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Logged in as: {currentParticipant?.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {data.tab.currency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  Share Invite Link
                </Button>
                <p className="text-xs text-muted-foreground flex items-center">
                  Code: {code}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Participants ({data.participants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.participants.map(p => (
                  <Badge key={p.id} variant={p.id === data.current_participant_id ? 'default' : 'secondary'}>
                    {p.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <BalancesList 
            edges={data.edges} 
            currentParticipantId={data.current_participant_id}
            currency={data.tab.currency}
          />

          <div className="space-y-3">
            <AddIouDialog 
              inviteCode={code}
              participants={data.participants}
              onAdd={fetchData}
            />
            <SettleDialog
              inviteCode={code}
              participants={data.participants}
              currentParticipantId={data.current_participant_id}
              onSettle={fetchData}
            />
            <RoastButton 
              edges={data.edges}
              currency={data.tab.currency}
            />
          </div>
        </div>
      </div>
    </div>
  )
}