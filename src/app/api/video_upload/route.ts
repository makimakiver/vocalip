'use server';
import { bundle } from '@remotion/bundler';
import fsPromises from 'fs/promises';
import fs from 'fs';

import { getCompositions, renderMedia, selectComposition } from '@remotion/renderer';
import FormData from 'form-data';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const { caption, voiceUrl } = await request.json();
    console.log("caption", caption);
    console.log("voiceUrl", voiceUrl);
    const inputProps = { caption: caption, voiceUrl: voiceUrl };
    console.log("inputProps", path.resolve('remotion/index.tsx'), inputProps);
    const bundleLoc = await bundle({
        entryPoint: path.resolve('remotion/index.tsx')
        // webpackOverride: (c) => replaceLoadersWithBabel(c),
      });
    const comps = await getCompositions(bundleLoc, {
        inputProps: { caption: caption, voiceUrl: voiceUrl },
    });
    console.log("comps", comps);
    const comp = await selectComposition({
        serveUrl: bundleLoc,
        id: 'MyComp',
        inputProps: { caption: caption, voiceUrl: voiceUrl }
      });
    // 2) Create a PassThrough to capture the MP4 stream
    // const pass = new PassThrough();
      // 3) Kick off the Pinata upload
      // 1) Render to a real file
    
    const outDir  = path.join(process.cwd(), '.tmp');
    await fsPromises.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, `${Date.now()}.mp4`);
    await renderMedia({
        serveUrl:       bundleLoc,
        composition:    comp,
        codec:          'h264',
        outputLocation: outPath,
        inputProps:     { caption, voiceUrl: voiceUrl },
        enforceAudioTrack: true
    });
    if (!fs.existsSync(outPath)) {
        console.error('File does not exist:', outPath);
        return NextResponse.json({ error: 'Video file not found' }, { status: 404 });
    }
    const stats = fs.statSync(outPath);
    console.log('File stats:', {
        size: stats.size,
        path: outPath,
        extension: path.extname(outPath)
    });
    const form_data = new FormData();
    fs.readFile(outPath, (err, buffer) => {
        if (err) {
          console.error('Failed to read file:', err);
          return;
        }
        // `buffer` is a Buffer
        console.log('Read buffer length:', buffer.length);
    });
    const stream = fs.createReadStream(outPath);
    // form_data.append('file', stream, {
    //     filename: 'remotion.mp4',
    //     contentType: 'video/mp4',
    // });
    // form_data.append('pinataMetadata', JSON.stringify({ name: 'MyVideo.mp4' }));
    // const pinata = new PinataSDK({
    //     pinataJwt: process.env.PINATA_JWT!,
    //     pinataGateway: "example-gateway.mypinata.cloud",
    //   });
    // const file = new File([fs.readFileSync(outPath)], 'remotion.mp4', { type: 'video/mp4' });
    form_data.append('file', fs.readFileSync(outPath), {
        filename: 'remotion.mp4',
        contentType: 'video/mp4',
    });
    form_data.append('network', 'public');
    // form_data.append("file", file, 'remotion.mp4');
    // form_data.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
    // form_data.append('pinataMetadata', JSON.stringify({ name: 'MyVideo.mp4' }));
    const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        form_data,
        {
            headers: {
                'Authorization': `Bearer ${process.env.PINATA_JWT}`,
                ...form_data.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000, // 30 second timeout
        }
    );
    const data = response.data;
    console.log("Pinata response:", data);
    // if (!response.ok) {
    //     console.log('Response status:', response.status);
    //     console.log('Response statusText:', response.statusText);
        
    //     // Get the actual error text
    //     const errorText = await response.text();
    //     console.error('Pinata raw error response:', errorText);
        
    //     // Try to parse as JSON
    //     let errorData;
    //     try {
    //         errorData = JSON.parse(errorText);
    //         console.error('Pinata parsed error:', errorData);
    //     } catch (parseError) {
    //         console.error('Could not parse error as JSON:', parseError);
    //         errorData = { message: errorText };
    //     }
        
    //     return NextResponse.json({ error: errorData }, { status: response.status });
    // }
    const GATEWAY_URL = process.env.GATEWAY_URL;
    const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;
    console.log('link: ', `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
    return NextResponse.json({ link: `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}` });
}