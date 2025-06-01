// app/api/recording/route.ts
import { NextResponse } from 'next/server';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import FormData from 'form-data';          // npm install form-data
import fetch from 'node-fetch';            // npm install node-fetch
import { Buffer } from 'buffer';

export async function POST(request: Request) {
  try {
    const { voiceCid } = await request.json();
    const url = `https://${process.env.GATEWAY_URL}/ipfs/${voiceCid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`
    console.log('url: ', url)
    const elevenlabs = new ElevenLabsClient();
    const res = await fetch(url);
    const fileStream = res.body!;
    if (fileStream !== null) {
      const voice = await elevenlabs.voices.ivc.create({
          name: "My Voice Clone",
          // Replace with the paths to your audio files.
          // The more files you add, the better the clone will be.
          files: [fileStream],
      });
      console.log(voice);
      return NextResponse.json({ cid: voice.voiceId });
    }
    return NextResponse.json({ error: 'No file stream' }, { status: 500 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
