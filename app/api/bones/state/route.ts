import { NextRequest, NextResponse } from "next/server";
import {
  BoneState,
  setBoneStates,
  getAllBoneStates,
  getBoneStateCount,
} from "../../../../lib/bone-state-store";

export async function GET() {
  return NextResponse.json({ states: getAllBoneStates() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { states } = body as { states?: Record<string, BoneState> };

  if (!states || typeof states !== "object") {
    return NextResponse.json(
      { error: "states must be an object mapping bone names to { x, y, z }" },
      { status: 400 },
    );
  }

  for (const [boneName, rot] of Object.entries(states)) {
    if (
      typeof rot.x !== "number" ||
      typeof rot.y !== "number" ||
      typeof rot.z !== "number"
    ) {
      return NextResponse.json(
        {
          error: `Invalid rotation for bone "${boneName}": x, y, z must be numbers`,
        },
        { status: 400 },
      );
    }
  }

  setBoneStates(states);
  return NextResponse.json({ ok: true, count: getBoneStateCount() });
}
