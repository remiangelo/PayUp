import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const { name, currency = 'USD', creator_name } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Tab name is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const invite_code = nanoid(8)

    // Create the tab
    const { data: tab, error: tabError } = await supabase
      .from('tabs')
      .insert({ name, currency, invite_code })
      .select()
      .single()

    if (tabError) {
      console.error('Error creating tab:', tabError)
      return NextResponse.json({ error: 'Failed to create tab' }, { status: 500 })
    }

    // If creator name provided, create them as first participant
    if (creator_name) {
      const access_token = nanoid(32)
      
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          tab_id: tab.id,
          name: creator_name,
          access_token
        })
        .select()
        .single()

      if (participantError) {
        console.error('Error creating participant:', participantError)
        // Still return the tab even if participant creation fails
      } else {
        // Set the access token cookie
        const cookieStore = await cookies()
        cookieStore.set('tab_access_token', access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/'
        })
      }
    }

    return NextResponse.json(tab)
  } catch (error) {
    console.error('Error in POST /api/tabs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}