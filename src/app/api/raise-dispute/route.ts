// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { mintNFT } from '../../../../utils/functions/mintNFT'
import { createCommercialRemixTerms, NFTContractAddress } from '../../../../utils/utils'
import { client, account, networkInfo } from '../../../../utils/config'
import { Address, parseEther } from 'viem'
import * as sha256 from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
    const { ipId, disputeType } = await request.json()
    const cid = await generateCID()
    // 1. Raise a Dispute
    //
    // Docs: https://docs.story.foundation/sdk-reference/dispute#raisedispute
    const disputeResponse = await client.dispute.raiseDispute({
        targetIpId: ipId,
        cid: cid,
        // you must pick from one of the whitelisted tags here:
        // https://docs.story.foundation/concepts/dispute-module/overview#dispute-tags
        targetTag: disputeType,
        bond: parseEther('0.1'),
        liveness: 2592000,
        txOptions: { waitForTransaction: true },
    })
    console.log(`Dispute raised at transaction hash ${disputeResponse.txHash}, Dispute ID: ${disputeResponse.disputeId}`)
    const disputeID = disputeResponse.disputeId?.toString()
    const txHash = disputeResponse.txHash as `0x${string}`
    return NextResponse.json({ disputeID: disputeID, txHash: txHash, cid: cid })
}

// example function just for demo purposes
const generateCID = async () => {
    // Generate a random 32-byte buffer
    const randomByte = randomBytes(32)
    // Hash the bytes using SHA-256
    const hash = await sha256.sha256.digest(randomByte)
    // Create a CIDv1 in dag-pb format
    const cidv1 = CID.createV1(0x70, hash) // 0x70 = dag-pb codec
    // Convert CIDv1 to CIDv0 (Base58-encoded)
    return cidv1.toV0().toString()
}