import { NextResponse } from 'next/server';
import { client } from '../../../../utils/config';

export async function POST(req: Request) {
  const { parentIpId, creatorAddress } = await req.json();
  //fetch the license terms from the request
  const res = await fetch(
    `https://api.storyapis.com/api/v3/licenses/ip/terms/${parentIpId}`,
    {
      method: "GET",
      headers: {
        "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
        "X-Chain": "story-aeneid",
      }
    }
  );
  const data = await res.json();
  const licenseTerms = data.data[0];
  console.log(licenseTerms.licenseTermsId);
  const response = await client.license.mintLicenseTokens({
    licenseTermsId: licenseTerms.licenseTermsId,
    licensorIpId: parentIpId,
    receiver: creatorAddress, // optional
    amount: 1,
    maxMintingFee: BigInt(0), // disabled
    maxRevenueShare: 100, // default
  });
  console.log(response);
  console.log(
    `License Token minted at transaction hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
  );
  return NextResponse.json({ txHash: response.txHash, tokenId: response.licenseTokenIds?.[0] });
}
