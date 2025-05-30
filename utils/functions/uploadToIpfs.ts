// utils/functions/uploadToIpfs.ts
import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

// Initialize with your API credentials
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_API_KEY!
);

export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    const { IpfsHash } = await pinata.pinJSONToIPFS(jsonMetadata)
    return IpfsHash
}

// could use this to upload music (audio files) to IPFS
export async function uploadFileToIPFS(filePath: string, fileName: string, fileType: string): Promise<string> {
    const fullPath = path.join(process.cwd(), filePath)
    const blob = new Blob([fs.readFileSync(fullPath)])
    const file = new File([blob], fileName, { type: fileType })
    const { IpfsHash } = await pinata.pinFileToIPFS(file)
    return IpfsHash
}
