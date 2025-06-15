'use server'
import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import { Buffer } from "buffer";
import fetch from 'node-fetch'; 
interface single_word_recording {
    word: string;
    start: number;
    end: number;
}

export async function POST(request: NextRequest) {
    const { caption, assetId } = await request.json();
    const nftMetadata = await fetch(
      `https://api.storyapis.com/api/v3/assets/${assetId}/metadata`,
      {
            method: "GET",
            headers: {
                "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
                "X-Chain": "story-aeneid",
            },
        }
    );
    const nftMetadataJson = await nftMetadata.json();
    console.log("nftMetadataJson", nftMetadataJson);
    const nftMetadataMetadataUri = nftMetadataJson.nftTokenUri;
    console.log("nftMetadataMetadataUri ", nftMetadataMetadataUri);
    const nftMetadataMetadataInJson = await fetch(
      nftMetadataMetadataUri,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      }
    );

    const nftMetadataMetadata = await nftMetadataMetadataInJson.json();
    console.log("nftMetadataMetadata", nftMetadataMetadata);
    const voiceId = nftMetadataMetadata.attributes.find((attribute: any) => attribute.key === "Voice ID")?.value;
    console.log("voiceId", voiceId);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
        method: "POST",
        headers: {
          "Xi-Api-Key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "text": caption
        }),
      });
      const body = await response.json();
      console.log("captions calculated");
      // Create speech (POST /v1/text-to-speech/:voice_id)
      const voice_response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: {
        "Xi-Api-Key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        "text": caption,
        "model_id": "eleven_multilingual_v2"
        }),
      });
      if (!voice_response.ok) {
        const text = await voice_response.text();
        return NextResponse.json(
          { error: `ElevenLabs error ${voice_response.status}: ${text}` },
          { status: 502 }
        );
      }
      console.log("voice generated");
      const PINATA_JWT = process.env.PINATA_JWT!;
      const contentType = voice_response.headers.get('content-type') || '';
      if (!contentType.startsWith('audio/')) {
        throw new Error(`Expected audio/* but got ${contentType}`);
      }
    console.log('Server says this is:', contentType);
    // 2) Read the response as an ArrayBuffer (binary)
    const arrayBuffer = await voice_response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const form_data = new FormData();
    form_data.append("file", buffer, { filename: "Hwlli.mpeg", contentType: "audio/mpeg" });
    form_data.append('pinataOptions',  JSON.stringify({ cidVersion: 1 }));
    form_data.append('pinataMetadata', JSON.stringify({ name: '5s Recording' }));
    // 4️⃣ Forward to Pinata
    const resp = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            ...form_data.getHeaders()
        },
        body: form_data as any,
    }
    );
    const resp_body = await resp.json();
    console.log(resp_body);

    console.log("voice uploaded to pinata");
    const PINATA_GATEWAY_TOKEN=process.env.PINATA_GATEWAY_TOKEN!;
    const GATEWAY_URL = process.env.GATEWAY_URL!;
    console.log(`https://${GATEWAY_URL}/ipfs/${resp_body.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
    const characters = body.alignment.characters;
    const timestamps = body.alignment.character_end_times_seconds;
    const single_word_recordings: single_word_recording[] = [];
    let idx = 0;
    let word = "";
    let start = 0;
    for (const character of characters) {
    if (character === " " && idx > 0) {
        single_word_recordings.push({
            word: word,
            start: start,
            end: timestamps[idx-1]
        });
        word = "";
        start = timestamps[idx];
    } else if (idx === characters.length - 1){
        word += character;
        single_word_recordings.push({
            word: word,
            start: start,
            end: timestamps[idx]
        });
    } else {
        word += character;
    }
    idx++;
    }
    return NextResponse.json({
    single_word_recordings: single_word_recordings, 
    link: `https://${GATEWAY_URL}/ipfs/${resp_body.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`
    });
  }