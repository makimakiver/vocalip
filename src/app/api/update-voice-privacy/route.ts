import { NextRequest, NextResponse } from "next/server";

// Temporary in-memory storage for privacy settings
// In production, this would be stored in a database
const voicePrivacySettings = new Map<string, boolean>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, isPublic, userAddress } = body;

    // Validate required fields
    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean value" },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Verify the user owns this asset by checking on-chain or in database
    // 2. Store in a persistent database instead of memory
    // 3. Add authentication to ensure only the owner can update

    // For now, we'll use in-memory storage
    voicePrivacySettings.set(assetId, isPublic);

    // Log for debugging
    console.log(
      `Updated privacy for asset ${assetId}: ${isPublic ? "Public" : "Private"}`
    );

    return NextResponse.json({
      success: true,
      assetId,
      isPublic,
      message: `Voice privacy updated to ${isPublic ? "public" : "private"}`,
      // In production, you might return additional data like:
      // updatedAt: new Date().toISOString(),
      // updatedBy: userAddress
    });
  } catch (error) {
    console.error("Error updating voice privacy:", error);
    return NextResponse.json(
      { error: "Failed to update voice privacy" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve privacy status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Default to public if not set
    const isPublic = voicePrivacySettings.get(assetId) ?? true;

    return NextResponse.json({
      assetId,
      isPublic,
    });
  } catch (error) {
    console.error("Error fetching voice privacy:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice privacy" },
      { status: 500 }
    );
  }
}

// Optional: Add a DELETE endpoint to reset privacy settings
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    voicePrivacySettings.delete(assetId);

    return NextResponse.json({
      success: true,
      message: "Privacy settings reset to default (public)",
    });
  } catch (error) {
    console.error("Error deleting voice privacy:", error);
    return NextResponse.json(
      { error: "Failed to delete voice privacy" },
      { status: 500 }
    );
  }
}
