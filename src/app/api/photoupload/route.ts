import { NextResponse } from "next/server";
import FormData from "form-data";
import fetch from "node-fetch";
import { Buffer, File } from "buffer";

export async function POST(request: Request) {
  try {
    // 1️⃣ Parse the incoming multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2️⃣ Read its bytes & metadata
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;   // e.g. "image/png"
    const fileName = file.name;   // original filename

    // 3️⃣ Build a new multipart form for Pinata
    const pinataForm = new FormData();
    pinataForm.append("file", buffer, {
      filename:    fileName,
      contentType: mimeType,
    });
    
    // 4️⃣ Forward to Pinata
    const resp = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT!}`,
          ...pinataForm.getHeaders(),
        },
        body: pinataForm as any,
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Pinata error ${resp.status}: ${err}`);
    }
    console.log('resp', resp)
    const { IpfsHash } = await resp.json();
    return NextResponse.json({ cid: IpfsHash });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
