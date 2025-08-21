import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const { name, currency = 'USD' } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Tab name is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const invite_code = nanoid(8)

    const { data, error } = await supabase
      .from('tabs')
      .insert({ name, currency, invite_code })
      .select()
      .single()

    if (error) {
      console.error('Error creating tab:', error)
      return NextResponse.json({ error: 'Failed to create tab' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/tabs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}