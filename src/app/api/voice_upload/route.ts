"use server";
import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

interface single_word_recording {
  word: string;
  start: number;
  end: number;
}

export async function POST(request: NextRequest) {
  try {
    const { caption, assetId } = await request.json();

    // Get NFT metadata
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

    if (!nftMetadata.ok) {
      throw new Error("Failed to fetch NFT metadata");
    }

    const nftMetadataJson = await nftMetadata.json();
    const nftMetadataMetadataUri = nftMetadataJson.nftTokenUri;

    const nftMetadataMetadataInJson = await fetch(nftMetadataMetadataUri, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!nftMetadataMetadataInJson.ok) {
      throw new Error("Failed to fetch metadata URI");
    }

    const nftMetadataMetadata = await nftMetadataMetadataInJson.json();
    const voiceIdAttribute = nftMetadataMetadata.attributes?.find(
      (attribute: any) => attribute.key === "Voice ID"
    );

    if (!voiceIdAttribute) {
      throw new Error("Voice ID not found in metadata");
    }

    const voiceId = voiceIdAttribute.value;
    console.log("Voice ID:", voiceId);

    // Get text-to-speech with timestamps
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: caption,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    const body = await response.json();
    console.log("Captions calculated");

    // Generate speech audio
    const voice_response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: caption,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!voice_response.ok) {
      const text = await voice_response.text();
      return NextResponse.json(
        { error: `ElevenLabs error ${voice_response.status}: ${text}` },
        { status: 502 }
      );
    }

    console.log("Voice generated");

    // Upload to Pinata
    const PINATA_JWT = process.env.PINATA_JWT!;
    const arrayBuffer = await voice_response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a proper FormData for the browser's fetch API
    const formData = new FormData();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: "audio/mpeg" });

    // Append the blob as a file
    formData.append("file", blob, "voice_audio.mp3");

    // Add Pinata metadata
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    formData.append(
      "pinataMetadata",
      JSON.stringify({ name: "Voice Recording" })
    );

    const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        // Don't set Content-Type header - let fetch set it with boundary
      },
      body: formData,
    });

    if (!resp.ok) {
      const error = await resp.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const resp_body = await resp.json();
    console.log("Voice uploaded to Pinata:", resp_body.IpfsHash);

    const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN!;
    const GATEWAY_URL = process.env.GATEWAY_URL!;

    // Process timestamps
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
          end: timestamps[idx - 1],
        });
        word = "";
        start = timestamps[idx];
      } else if (idx === characters.length - 1) {
        word += character;
        single_word_recordings.push({
          word: word,
          start: start,
          end: timestamps[idx],
        });
      } else {
        word += character;
      }
      idx++;
    }

    return NextResponse.json({
      single_word_recordings: single_word_recordings,
      link: `https://${GATEWAY_URL}/ipfs/${resp_body.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`,
      success: true,
    });
  } catch (error) {
    console.error("Voice upload error:", error);
    return NextResponse.json(
      {
        error: "Voice processing failed",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}
