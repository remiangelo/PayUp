'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Edge {
  from_id: string
  from_name: string
  to_id: string
  to_name: string
  amount: number
}

interface BalancesListProps {
  edges: Edge[]
  currentParticipantId: string
  currency: string
}

export function BalancesList({ edges, currentParticipantId, currency }: BalancesListProps) {
  const youOwe = edges.filter(e => e.from_id === currentParticipantId)
  const owedToYou = edges.filter(e => e.to_id === currentParticipantId)

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

  if (edges.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">All settled up!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {youOwe.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">You Owe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {youOwe.map((edge, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{edge.to_name}</span>
                <Badge variant="destructive">{formatAmount(edge.amount)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {owedToYou.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owed to You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {owedToYou.map((edge, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span>{edge.from_name}</span>
                <Badge variant="default" className="bg-green-600">{formatAmount(edge.amount)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {youOwe.length === 0 && owedToYou.length === 0 && edges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Group Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {edges.map((edge, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {edge.from_name} → {edge.to_name}
                  </span>
                  <Badge variant="outline">{formatAmount(edge.amount)}</Badge>
                </div>
                {idx < edges.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}