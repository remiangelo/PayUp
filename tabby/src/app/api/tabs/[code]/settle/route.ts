import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { to_id, amount } = await request.json()
    
    if (!to_id || !amount) {
      return NextResponse.json({ error: 'Recipient and amount are required' }, { status: 400 })
    }

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
      .select('id')
      .eq('invite_code', code)
      .eq('id', participant.tab_id)
      .single()

    if (tabError || !tab) {
      return NextResponse.json({ error: 'Tab not found' }, { status: 404 })
    }

    // Create settlement
    const { data: settlement, error: settlementError } = await supabase
      .from('settlements')
      .insert({
        tab_id: participant.tab_id,
        from_id: participant.id,
        to_id,
        amount
      })
      .select()
      .single()

    if (settlementError) {
      console.error('Error creating settlement:', settlementError)
      return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 })
    }

    return NextResponse.json(settlement)
  } catch (error) {
    console.error('Error in POST /api/tabs/[code]/settle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}