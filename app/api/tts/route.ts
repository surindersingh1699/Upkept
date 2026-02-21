import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const apiKey = process.env.MAXMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'MAXMINI_API_KEY not configured' }, { status: 500 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing "text" field' }, { status: 400 });
  }

  const response = await fetch('https://api.minimax.io/v1/t2a_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'speech-02-hd',
      text,
      voice_setting: {
        voice_id: 'Friendly_Person',
        speed: 1.0,
      },
      audio_setting: {
        format: 'mp3',
        sample_rate: 24000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('[TTS] MiniMax error:', response.status, errorText.slice(0, 300));
    return NextResponse.json(
      { error: `MiniMax TTS failed: ${response.status}` },
      { status: 502 },
    );
  }

  const data = await response.json();

  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
    console.error('[TTS] MiniMax API error:', data.base_resp);
    return NextResponse.json(
      { error: data.base_resp?.status_msg || 'MiniMax TTS error' },
      { status: 502 },
    );
  }

  // MiniMax returns audio as hex-encoded data in data.audio_file
  const hexAudio = data.audio_file;
  if (!hexAudio) {
    return NextResponse.json({ error: 'No audio data in response' }, { status: 502 });
  }

  const audioBuffer = Buffer.from(hexAudio, 'hex');

  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    },
  });
}
