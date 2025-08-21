import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the tab by invite code
    const { data: tab, error: tabError } = await supabase
      .from('tabs')
      .select('id')
      .eq('invite_code', code)
      .single()

    if (tabError || !tab) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    // Create participant with access token
    const access_token = nanoid(32)
    
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        tab_id: tab.id,
        name,
        access_token
      })
      .select()
      .single()

    if (participantError) {
      console.error('Error creating participant:', participantError)
      return NextResponse.json({ error: 'Failed to join tab' }, { status: 500 })
    }

    // Set the access token cookie
    const cookieStore = await cookies()
    cookieStore.set('tab_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error in POST /api/tabs/[code]/join:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}