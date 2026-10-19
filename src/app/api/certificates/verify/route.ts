import { NextRequest, NextResponse } from "next/server";
import { verifyCertificateRecord } from "@/lib/services/certificate.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || searchParams.get("cert") || searchParams.get("token");

    if (!query || !query.trim()) {
      return NextResponse.json(
        { status: "invalid", error: "Please provide a certificate number or verification token." },
        { status: 400 }
      );
    }

    const result = await verifyCertificateRecord(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Certificate public verification error:", error);
    return NextResponse.json(
      { status: "invalid", error: "Unable to verify certificate at this time." },
      { status: 500 }
    );
  }
}
