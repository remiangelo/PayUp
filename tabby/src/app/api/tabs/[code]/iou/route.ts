import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { amount, description, split_type = 'even', splits } = await request.json()
    
    if (!amount || !description) {
      return NextResponse.json({ error: 'Amount and description are required' }, { status: 400 })
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

    // Create IOU
    const { data: iou, error: iouError } = await supabase
      .from('ious')
      .insert({
        tab_id: participant.tab_id,
        payer_id: participant.id,
        amount,
        description,
        split_type
      })
      .select()
      .single()

    if (iouError) {
      console.error('Error creating IOU:', iouError)
      return NextResponse.json({ error: 'Failed to create IOU' }, { status: 500 })
    }

    // Handle splits
    let splitData = []
    
    if (split_type === 'even') {
      // Get all participants in the tab
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('id')
        .eq('tab_id', participant.tab_id)

      if (participantsError || !participants) {
        return NextResponse.json({ error: 'Failed to get participants' }, { status: 500 })
      }

      const splitAmount = amount / participants.length
      splitData = participants.map(p => ({
        iou_id: iou.id,
        participant_id: p.id,
        amount: splitAmount
      }))
    } else {
      // Custom splits
      splitData = splits.map((split: { participant_id: string; amount: number }) => ({
        iou_id: iou.id,
        participant_id: split.participant_id,
        amount: split.amount
      }))
    }

    // Insert splits
    const { error: splitsError } = await supabase
      .from('iou_splits')
      .insert(splitData)

    if (splitsError) {
      console.error('Error creating splits:', splitsError)
      return NextResponse.json({ error: 'Failed to create splits' }, { status: 500 })
    }

    return NextResponse.json({ iou, splits: splitData })
  } catch (error) {
    console.error('Error in POST /api/tabs/[code]/iou:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}