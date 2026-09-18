import { NextResponse } from "next/server";
import { STRIPE_ENABLED } from "@/lib/payments";

export async function GET() {
  return NextResponse.json({ stripeEnabled: STRIPE_ENABLED });
}
