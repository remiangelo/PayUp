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
import { Loader2, Users, Copy, CheckCircle2 } from 'lucide-react'

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

  const [copied, setCopied] = useState(false)
  
  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading tab...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 fade-in">
          <JoinTabForm inviteCode={code} onJoin={fetchData} />
        </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-blue-50 opacity-50"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="glass-card fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl gradient-text">{data.tab.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Logged in as: {currentParticipant?.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1 shimmer">
                  {data.tab.currency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  className="flex-1 group"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                      Share Invite Link
                    </>
                  )}
                </Button>
                <Badge variant="secondary" className="px-3 py-1.5">
                  {code}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card fade-in" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({data.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.participants.map((p, i) => (
                  <Badge 
                    key={p.id} 
                    variant={p.id === data.current_participant_id ? 'default' : 'secondary'}
                    className="fade-in"
                    style={{animationDelay: `${0.1 + i * 0.05}s`}}
                  >
                    {p.name}
                    {p.id === data.current_participant_id && ' (You)'}
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