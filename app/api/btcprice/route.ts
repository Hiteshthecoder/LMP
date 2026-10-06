import { NextResponse } from "next/server";
import {
    getBitcoinEurPrice,
} from "@/lib/bitcoin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const price = await getBitcoinEurPrice();

    if (price == null) {
        return NextResponse.json(null,
            {
                status: 503,
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    }

    return NextResponse.json(
        price
        ,
        {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=60, stale-while-revalidate=240",
            },
        },
    );
}
