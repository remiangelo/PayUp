import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

interface Balance {
  participant_id: string
  participant_name: string
  net_balance: number
}

interface Edge {
  from_id: string
  from_name: string
  to_id: string
  to_name: string
  amount: number
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const cookieStore = await cookies()
    const access_token = cookieStore.get('tab_access_token')?.value

    if (!access_token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get participant by access token
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id, tab_id')
      .eq('access_token', access_token)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
    }

    // Verify the tab matches the code
    const { data: tab, error: tabError } = await supabase
      .from('tabs')
      .select('*')
      .eq('invite_code', code)
      .eq('id', participant.tab_id)
      .single()

    if (tabError || !tab) {
      return NextResponse.json({ error: 'Tab not found' }, { status: 404 })
    }

    // Get net balances from the view
    const { data: balances, error: balancesError } = await supabase
      .from('net_balances')
      .select('*')
      .eq('tab_id', participant.tab_id)

    if (balancesError) {
      console.error('Error getting balances:', balancesError)
      return NextResponse.json({ error: 'Failed to get balances' }, { status: 500 })
    }

    // Build edges by matching debtors to creditors
    const edges: Edge[] = []
    const debtors = (balances as Balance[]).filter(b => b.net_balance < 0)
      .map(b => ({ ...b, amount_owed: Math.abs(b.net_balance) }))
    const creditors = (balances as Balance[]).filter(b => b.net_balance > 0)
      .map(b => ({ ...b, amount_owed_to: b.net_balance }))

    // Greedy matching algorithm
    for (const debtor of debtors) {
      let remaining = debtor.amount_owed
      
      for (const creditor of creditors) {
        if (remaining <= 0) break
        if (creditor.amount_owed_to <= 0) continue
        
        const amount = Math.min(remaining, creditor.amount_owed_to)
        
        edges.push({
          from_id: debtor.participant_id,
          from_name: debtor.participant_name,
          to_id: creditor.participant_id,
          to_name: creditor.participant_name,
          amount: Math.round(amount * 100) / 100
        })
        
        remaining -= amount
        creditor.amount_owed_to -= amount
      }
    }

    // Get all participants for the tab
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .eq('tab_id', participant.tab_id)

    if (participantsError) {
      console.error('Error getting participants:', participantsError)
      return NextResponse.json({ error: 'Failed to get participants' }, { status: 500 })
    }

    return NextResponse.json({
      tab,
      current_participant_id: participant.id,
      participants,
      edges,
      balances
    })
  } catch (error) {
    console.error('Error in GET /api/tabs/[code]/balances:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}