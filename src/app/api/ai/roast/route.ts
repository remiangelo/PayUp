import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fromName, toName, amount, currency, context } = await request.json()
    
    if (!fromName || !toName || !amount || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        text: `Hey ${toName}, ${fromName} says you owe ${currency}${amount} — time to settle up! 💸` 
      })
    }

    const prompt = `Write a short, playful reminder message for a friend to settle a small IOU. Keep it kind, witty, and shareable in chat. Avoid shaming, politics, sensitive topics. Use one line + one emoji. Details:
- From: ${fromName}
- To: ${toName}
- Amount: ${amount} ${currency}
- Context: ${context || 'General expense'}
Tone: breezy, Gen-Z, 12–18 words, e.g. 'Ken, you owe me ¥600 for lattes — my wallet misses you 🧋'

Respond with ONLY the message text, nothing else.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return NextResponse.json({ 
        text: `Hey ${toName}, ${fromName} says you owe ${currency}${amount} — time to settle up! 💸` 
      })
    }

    const data = await response.json()
    const text = data.content[0].text

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Error in POST /api/ai/roast:', error)
    return NextResponse.json({ 
      text: `Time to settle that IOU! 💰` 
    })
  }
}