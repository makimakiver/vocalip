// app/api/recording/route.ts
import { NextResponse } from 'next/server';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import FormData from 'form-data';          // npm install form-data
import fetch from 'node-fetch';            // npm install node-fetch
import { Buffer } from 'buffer';
import OpenAI from 'openai';

export async function POST(request: Request) {
    try {
        const elevenlabs = new ElevenLabsClient();
        const { voiceCid } = await request.json();
      
        const url = `https://${process.env.GATEWAY_URL}/ipfs/${voiceCid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`
        console.log(url);
        const response = await fetch(url);
        const audioBlob = new Blob([await response.arrayBuffer()], { type: "audio/mp3" });
        const transcription = await elevenlabs.speechToText.convert({
            file: audioBlob,
            modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported.
            tagAudioEvents: true, // Tag audio events like laughter, applause, etc.
            languageCode: "eng", // Language of the audio file. If set to null, the model will detect the language automatically.
            diarize: true, // Whether to annotate who is speaking
        });
        console.log(transcription.text);
        const inputText = transcription.text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9\s]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        const compareText = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9\s]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        const similarity_score = similarity(inputText, compareText)
        console.log(similarity_score);

        return NextResponse.json({ text: transcription.text, similarity_score: similarity_score });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }

}

function similarity(inputText: string, compareText: string) {
    const inputWords = inputText.split(' ')
    const compareWords = compareText.split(' ')
    console.log(inputWords, compareWords)
    const similarity = inputWords.filter(word => compareWords.includes(word)).length / inputWords.length
    return similarity
}