"use server";
import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";
import { createHash } from "crypto";
import { client } from "../../../../utils/config";
import { uploadJSONToIPFS } from "../../../../utils/functions/uploadToIpfs";
import { IpMetadata } from "@story-protocol/core-sdk";
import { SPGNFTContractAddress } from "../../../../utils/utils";

export async function POST(request: NextRequest) {
  try {
    const {
      caption,
      voiceUrl,
      voiceId,
      title,
      description,
      licenseTermsId,
      creatorName,
      creatorAddress,
    } = await request.json();

    console.log("Starting Shotstack video generation...");

    //Create video with Shotstack
    const shotstackResponse = await fetch(
      "https://api.shotstack.io/stage/render",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.SHOTSTACK_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeline: {
            background: "#000000",
            tracks: [
              // Audio track - MUST be first
              {
                clips: [
                  {
                    asset: {
                      type: "audio",
                      src: voiceUrl,
                    },
                    start: 0,
                    length: null, // Auto-detect length
                  },
                ],
              },
              // Text/Caption track
              {
                clips: caption.map((word: any) => ({
                  asset: {
                    type: "title",
                    text: word.word,
                    style: "blockbuster",
                    color: "#ffffff",
                    size: "x-large",
                    background: "transparent",
                    position: "center",
                  },
                  start: word.start,
                  length: Math.max(0.1, word.end - word.start), // Minimum 0.1s length
                  transition: {
                    in: "fade",
                    out: "fade",
                  },
                  effect: "zoomIn",
                })),
              },
            ],
          },
          output: {
            format: "mp4",
            resolution: "mobile",
            fps: 25,
            scaleTo: "preview",
          },
          merge: [
            {
              find: "audio",
              replace: voiceUrl,
            },
          ],
        }),
      }
    );

    if (!shotstackResponse.ok) {
      const error = await shotstackResponse.text();
      console.error("Shotstack error:", error);
      throw new Error(`Shotstack API error: ${error}`);
    }

    const renderData = await shotstackResponse.json();
    const renderId = renderData.response.id;
    console.log("Render started with ID:", renderId);

    // Poll for completion
    let attempts = 0;
    let videoUrl = null;
    const maxAttempts = 30; // 60 seconds max wait

    while (attempts < maxAttempts && !videoUrl) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.shotstack.io/stage/render/${renderId}`,
        {
          headers: {
            "x-api-key": process.env.SHOTSTACK_API_KEY!,
            "Content-Type": "application/json",
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error("Failed to check render status");
      }

      const statusData = await statusResponse.json();
      const status = statusData.response.status;

      console.log(`Render status (attempt ${attempts + 1}): ${status}`);

      if (status === "done") {
        videoUrl = statusData.response.url;
        break;
      } else if (status === "failed") {
        console.error("Render failed:", statusData.response);
        throw new Error(
          "Video rendering failed: " + JSON.stringify(statusData.response.error)
        );
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("Video rendering timeout - took too long");
    }

    console.log("Video rendered successfully:", videoUrl);

    // Download the video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error("Failed to download video from Shotstack");
    }

    const videoArrayBuffer = await videoResponse.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);

    console.log("Video downloaded, size:", videoBuffer.length);

    // Upload to Pinata
    const form_data = new FormData();
    form_data.append("file", videoBuffer, {
      filename: "video.mp4",
      contentType: "video/mp4",
    });

    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...form_data.getHeaders(),
        },
        body: form_data as any,
      }
    );

    if (!pinataResponse.ok) {
      const error = await pinataResponse.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const pinataData = await pinataResponse.json();
    console.log("Video uploaded to IPFS:", pinataData.IpfsHash);

    // Create the final video URL
    const GATEWAY_URL = process.env.GATEWAY_URL;
    const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;
    const finalVideoUrl = `https://${GATEWAY_URL}/ipfs/${pinataData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;

    // Create metadata for Story Protocol
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
      mediaUrl: finalVideoUrl,
      mediaHash: pinataData.IpfsHash,
      mediaType: "video/mp4",
    });

    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
    const ipHash = createHash("sha256")
      .update(JSON.stringify(ipMetadata))
      .digest("hex");

    const nftMetadata = {
      name: title,
      description: "Video created with voice IP on VocalIP platform.",
    };
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);
    const nftHash = createHash("sha256")
      .update(JSON.stringify(nftMetadata))
      .digest("hex");

    //  Register as derivative on Story Protocol
    console.log("Registering on Story Protocol...");
    const childIp = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
      spgNftContract: SPGNFTContractAddress,
      derivData: {
        parentIpIds: [voiceId],
        licenseTermsIds: [licenseTermsId],
      },
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
        ipMetadataHash: `0x${ipHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
        nftMetadataHash: `0x${nftHash}`,
      },
      txOptions: { waitForTransaction: true },
    });

    console.log("Video IP registered:", childIp.ipId);

    return NextResponse.json({
      link: finalVideoUrl,
      ipId: childIp.ipId,
      success: true,
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        error: "Video generation failed",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}
