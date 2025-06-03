// app/api/recording/route.ts
import { NextResponse } from 'next/server';
import FormData from 'form-data';          // npm install form-data
import fetch from 'node-fetch';            // npm install node-fetch
import { Buffer } from 'buffer';

export async function POST(request: Request) {
  try {
    // 1) Read raw bytes from the request
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2) Build a Node multipart form
    const form = new FormData();
    form.append('file', buffer, {
      filename:    'voice.webm',    // name on IPFS
      contentType: 'audio/webm',    // correct MIME
    });
    form.append('pinataOptions',  JSON.stringify({ cidVersion: 1 }));
    form.append('pinataMetadata', JSON.stringify({ name: '5s Recording' }));

    // 3) Send to Pinata
    const resp = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT!}`,
        // spread in the multipart headers (boundary, content-type)
        ...form.getHeaders(),
      },
      body: form as any,
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Pinata error ${resp.status}: ${err}`);
    }
    const json = await resp.json();
    return NextResponse.json({ cid: json.IpfsHash, link: `https://${process.env.GATEWAY_URL}/ipfs/${json.IpfsHash}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}` });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
