// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { mintNFT } from '../../../../utils/functions/mintNFT'
import { createCommercialRemixTerms, NFTContractAddress } from '../../../../utils/utils'
import { client, account, networkInfo } from '../../../../utils/config'
import { uploadJSONToIPFS } from '../../../../utils/functions/uploadToIpfs'
import { createHash } from 'crypto'
import { IpMetadata } from '@story-protocol/core-sdk'

export async function POST(request: Request) {
        // 1. Set up your IP Metadata
        //
        // Docs: https://docs.story.foundation/concepts/ip-asset/ipa-metadata-standard
    // you should already have a client set up (prerequisite
    const { imageCid, voiceCid, name, description, commercialShare, derivativeAttribution } = await request.json()
    const imageUri = `https://${process.env.GATEWAY_URL}/ipfs/${imageCid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`
    const voiceUri = `https://${process.env.GATEWAY_URL}/ipfs/${voiceCid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`
    const ipMetadata = {
        title: name,
        description: description,
        image: imageUri,
        imageHash: "0x21937ba9d821cb0306c7f1a1a2cc5a257509f228ea6abccc9af1a67dd754af6e",
        mediaUrl: voiceUri,
        mediaHash: "0x21937ba9d821cb0306c7f1a1a2cc5a257509f228ea6abccc9af1a67dd754af6e",
        mediaType: "audio/mpeg",
        creators: [
        {
            name: "Voice Training data",
            address: "0x67ee74EE04A0E6d14Ca6C27428B27F3EFd5CD084",
            description: "Registering the voice data as an IP Asset",
            contributionPercent: 100,
        },
        ],
    };

    // 2. Set up your NFT Metadata
    //
    // Docs: https://docs.opensea.io/docs/metadata-standards#metadata-structure
    const nftMetadata = {
        name: name,
        description: description,
        image: imageUri,
        attributes: [
            {
                key: 'Read text',
                value: 'whatever text he read',
            }, 
            {
                key: 'Voice ID',
                value: 'tAAxBOXRjFQgiLI7Xsmq',
            }
            // {
            //     key: 'Source',
            //     value: 'Suno.com',
            // },
        ],
    }

    // 3. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 4. Mint an NFT
    const tokenId = await mintNFT(account.address, `https://ipfs.io/ipfs/${nftIpfsHash}`)
    console.log(`NFT minted with tokenId ${tokenId}`)

    // 5. Register an IP Asset
    //
    // Docs: https://docs.story.foundation/sdk-reference/ip-asset#register
    const response = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: NFTContractAddress,
        tokenId: tokenId!,
        licenseTermsData: [
            {
                terms: createCommercialRemixTerms({ defaultMintingFee: 1, commercialRevShare: commercialShare }),
            },
        ],
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
            ipMetadataHash: `0x${ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
            nftMetadataHash: `0x${nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    console.log('Root IPA created:', {
        'Transaction Hash': response.txHash,
        'IPA ID': response.ipId,
    })
    console.log(`View on the explorer: ${networkInfo.protocolExplorer}/ipa/${response.ipId}`)
    return NextResponse.json({ link: `${networkInfo.protocolExplorer}/ipa/${response.ipId}`, txHash: response.txHash, ipId: response.ipId })
}
