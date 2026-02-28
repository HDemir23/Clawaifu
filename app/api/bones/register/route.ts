import { NextRequest, NextResponse } from "next/server";

let boneRegistry: string[] = [];

export async function GET() {
  return NextResponse.json({ bones: boneRegistry });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bones } = body;

  if (!Array.isArray(bones) || !bones.every((b) => typeof b === "string")) {
    return NextResponse.json({ error: "bones must be an array of strings" }, { status: 400 });
  }

  boneRegistry = bones;
  return NextResponse.json({ ok: true, count: boneRegistry.length });
}
