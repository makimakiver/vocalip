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
    const { caption } = await request.json();
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x/with-timestamps", {
        method: "POST",
        headers: {
          "Xi-Api-Key": "sk_85ca1aace9637c0d00fc70a6f3c7075eb4ff343422bcdfeb",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "text": caption
        }),
      });
      const body = await response.json();
      console.log("captions calculated");
      // Create speech (POST /v1/text-to-speech/:voice_id)
      const voice_response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x?output_format=mp3_44100_128", {
        method: "POST",
        headers: {
        "Xi-Api-Key": "sk_85ca1aace9637c0d00fc70a6f3c7075eb4ff343422bcdfeb",
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
      const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNGEwYjNiZC1mYjEyLTRjMjUtOTNmMC03YTUyMmQ1ZjE1ZWYiLCJlbWFpbCI6Inl1dGFrYTMyMDlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImQxOWUyYjI4ZTA0ZjJjZmEyNmUyIiwic2NvcGVkS2V5U2VjcmV0IjoiZTNlNTU2MWY5OTU0YWUyNmNjOTU3MTM5YzE0NDA0M2YxMmExMzE5NTdiMzU2NTcyZWE4ZTQ0MGFiYzgzMDZhMSIsImV4cCI6MTc3OTk2NDk4NH0.eVlbcC2-39ibAwQmiHPX0uY3kNRIgIyhImR85dyn3wM";
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
    const PINATA_GATEWAY_TOKEN="ENQNk1o-lof8hP0fSPVQeb7DVGFDnEuzsCq9A4YT0HlJbSOQW1t0vNNqsDE_cJkD";
    const GATEWAY_URL = "lime-adorable-ant-337.mypinata.cloud";
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