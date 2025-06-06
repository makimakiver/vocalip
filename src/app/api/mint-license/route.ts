import { NextResponse } from 'next/server';
import { client } from '../../../../utils/config';

export async function POST(req: Request) {
  const { parentIpId } = await req.json();
  const response = await client.license.mintLicenseTokens({
  licenseTermsId: "1",
  licensorIpId: parentIpId,
  receiver: "0x072Ecc90fA0Ac2292e760a57304A87Ad6c32bc89", // optional
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
