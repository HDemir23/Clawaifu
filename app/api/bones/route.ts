import { NextRequest, NextResponse } from "next/server";

interface BoneCommand {
  bone: string;
  x: number;
  y: number;
  z: number;
}

const commandQueue: BoneCommand[] = [];

export async function GET() {
  const commands = commandQueue.splice(0, commandQueue.length);
  return NextResponse.json({ commands });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bone, x, y, z } = body;

  if (typeof bone !== "string" || !bone) {
    return NextResponse.json({ error: "bone must be a non-empty string" }, { status: 400 });
  }
  if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
    return NextResponse.json({ error: "x, y, z must be numbers" }, { status: 400 });
  }

  commandQueue.push({ bone, x, y, z });
  return NextResponse.json({ ok: true, queued: commandQueue.length });
}
