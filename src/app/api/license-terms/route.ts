import { NextResponse } from 'next/server';
import { client } from '../../../../utils/config';

export async function POST(req: Request) {
    const { ipId } = await req.json();
    const response = await client.license.attachLicenseTerms({
    licenseTermsId: "1",
    ipId,
    });

    if (response.success) {
    console.log(
    `Attached License Terms to IPA at transaction hash ${response.txHash}.`
    );
    } else {
    console.log(`License Terms already attached to this IPA.`);
    }
    return NextResponse.json({ txHash: response.txHash });
}
