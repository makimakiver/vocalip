'use server';
import { bundle } from '@remotion/bundler';
import fsPromises from 'fs/promises';
import fs from 'fs';

import { getCompositions, renderMedia, selectComposition } from '@remotion/renderer';
import FormData from 'form-data';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createHash } from 'crypto';
import { client } from '../../../../utils/config';
import { uploadJSONToIPFS } from '../../../../utils/functions/uploadToIpfs';
import { IpMetadata } from '@story-protocol/core-sdk';
import { SPGNFTContractAddress } from '../../../../utils/utils';
import os from 'os';

export async function POST(request: NextRequest) {
    const { caption, voiceUrl, voiceId, title, description, licenseTermsId, creatorName, creatorAddress } = await request.json();
    console.log("caption", caption);
    console.log("voiceUrl", voiceUrl);
    const inputProps = { caption: caption, voiceUrl: voiceUrl };
    let bundleLoc = null;
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
        console.log("Running in production");
        const tmpOut = path.join(os.tmpdir(), `${Date.now()}.mp4`);
        await fsPromises.mkdir(tmpOut, { recursive: true });
        console.log("os.tmpdir()", os.tmpdir());
        console.log("tmpOut", tmpOut);
        const serveUrl = 'https://vocalip-4s7p-git-main-makimakivers-projects.vercel.app/api/video_upload';
        const comp = await selectComposition({
            serveUrl: serveUrl,
            id: 'MyComp',
            inputProps: { caption: caption, voiceUrl: voiceUrl }
          });
        await renderMedia({
            serveUrl:       serveUrl,
            composition:    comp,
            codec:          'h264',
            outputLocation: tmpOut,
            inputProps:     { caption, voiceUrl: voiceUrl },
            enforceAudioTrack: true
        });
        const outPath = tmpOut;
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
        const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
            title: title,
            description: description,
            createdAt: Date.now().toString(),
            creators: [
                {
                    name: creatorName,
                    address: creatorAddress,
                    contributionPercent: 100,
                },
            ],
            mediaUrl: `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`,
            mediaHash: data.IpfsHash,
            mediaType: 'video/mp4',
        })
        const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
        const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
        const nftMetadata = {
            name: title,
            description: 'This is a test voice NFT. This NFT represents ownership of the IP Asset.'
        }
        const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
        const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')
        // 1. Mint and Register IP asset and make it a derivative of the parent IP Asset
        //
        // You will be paying for the License Token using $WIP:
        // https://aeneid.storyscan.xyz/address/0x1514000000000000000000000000000000000000
        // If you don't have enough $WIP, the function will auto wrap an equivalent amount of $IP into
        // $WIP for you.
        //
        // Docs: https://docs.story.foundation/sdk-reference/ip-asset#mintandregisteripandmakederivative
        const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
            spgNftContract: SPGNFTContractAddress,
            derivData: {
                parentIpIds: [voiceId],
                licenseTermsIds: [licenseTermsId],
            },
            // NOTE: The below metadata is not configured properly. It is just to make things simple.
            // See `simpleMintAndRegister.ts` for a proper example.
            ipMetadata: {
                ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
                ipMetadataHash: `0x${ipHash}`,
                nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
                nftMetadataHash: `0x${nftHash}`,
            },
            txOptions: { waitForTransaction: true },
        })
        console.log('Derivative IPA created and linked:', {
            'Transaction Hash': childIp.txHash,
            'IPA ID': childIp.ipId,
        })
    
        // 2. Parent Claim Revenue
        //
        // // Docs: https://docs.story.foundation/sdk-reference/royalty#claimallrevenue
        // const parentClaimRevenue = await client.royalty.claimAllRevenue({
        //     ancestorIpId: PARENT_IP_ID,
        //     claimer: PARENT_IP_ID,
        //     childIpIds: [childIp.ipId as Address],
        //     royaltyPolicies: [RoyaltyPolicyLRP],
        //     currencyTokens: [WIP_TOKEN_ADDRESS],
        // })
        //console.log('Parent claimed revenue receipt:', parentClaimRevenue)
        console.log('link: ', `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
        return NextResponse.json({ link: `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`, ipId: childIp.ipId });
    } 
    bundleLoc = await bundle({
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
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: title,
        description: description,
        createdAt: Date.now().toString(),
        creators: [
            {
                name: creatorName,
                address: creatorAddress,
                contributionPercent: 100,
            },
        ],
        mediaUrl: `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`,
        mediaHash: data.IpfsHash,
        mediaType: 'video/mp4',
    })
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftMetadata = {
        name: title,
        description: 'This is a test voice NFT. This NFT represents ownership of the IP Asset.'
    }
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')
    // 1. Mint and Register IP asset and make it a derivative of the parent IP Asset
    //
    // You will be paying for the License Token using $WIP:
    // https://aeneid.storyscan.xyz/address/0x1514000000000000000000000000000000000000
    // If you don't have enough $WIP, the function will auto wrap an equivalent amount of $IP into
    // $WIP for you.
    //
    // Docs: https://docs.story.foundation/sdk-reference/ip-asset#mintandregisteripandmakederivative
    const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
        spgNftContract: SPGNFTContractAddress,
        derivData: {
            parentIpIds: [voiceId],
            licenseTermsIds: [licenseTermsId],
        },
        // NOTE: The below metadata is not configured properly. It is just to make things simple.
        // See `simpleMintAndRegister.ts` for a proper example.
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    console.log('Derivative IPA created and linked:', {
        'Transaction Hash': childIp.txHash,
        'IPA ID': childIp.ipId,
    })

    // 2. Parent Claim Revenue
    //
    // // Docs: https://docs.story.foundation/sdk-reference/royalty#claimallrevenue
    // const parentClaimRevenue = await client.royalty.claimAllRevenue({
    //     ancestorIpId: PARENT_IP_ID,
    //     claimer: PARENT_IP_ID,
    //     childIpIds: [childIp.ipId as Address],
    //     royaltyPolicies: [RoyaltyPolicyLRP],
    //     currencyTokens: [WIP_TOKEN_ADDRESS],
    // })
    //console.log('Parent claimed revenue receipt:', parentClaimRevenue)
    console.log('link: ', `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`);
    return NextResponse.json({ link: `https://${GATEWAY_URL}/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`, ipId: childIp.ipId });
}