
import { NextResponse } from "next/server";
// @ts-ignore
import compositions from "@ifct2017/compositions";

export async function POST(request: Request) {
    try {
        const { foodName } = await request.json();

        if (!foodName) {
            return NextResponse.json({ error: "Food name is required" }, { status: 400 });
        }

        await (compositions as any).load();
        const allFoods = await (compositions as any).all();

        // Simple fuzzy search
        const match = allFoods.find((f: any) =>
            f.name.toLowerCase().includes(foodName.toLowerCase())
        );

        if (match) {
            return NextResponse.json({ verified: true, data: match });
        } else {
            return NextResponse.json({ verified: false });
        }
    } catch (error) {
        console.error("IFCT Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
