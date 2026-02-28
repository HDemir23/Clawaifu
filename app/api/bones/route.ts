import { NextRequest, NextResponse } from "next/server";

interface BoneCommand {
  bone: string;
  x: number;
  y: number;
  z: number;
}

const commandQueue: BoneCommand[] = [];

const BONE_LIMITS: Record<
  string,
  { x?: [number, number]; y?: [number, number]; z?: [number, number] }
> = {
  Head_021: { x: [-0.87, 0.87], y: [-1.4, 1.4], z: [-0.7, 0.7] },
  Neck_020: { x: [-0.7, 0.7], y: [-1.05, 1.05], z: [-0.52, 0.52] },
  Spine_018: { x: [-0.35, 0.35], y: [-0.26, 0.26], z: [-0.35, 0.35] },
  Spine_1_019: { x: [-0.52, 0.52], y: [-0.52, 0.52], z: [-0.52, 0.52] },
  ShoulderR_043: { x: [-1.57, 1.57], y: [-1.57, 1.57], z: [-3.14, 0.35] },
  ShoulderL_067: { x: [-1.57, 1.57], y: [-1.57, 1.57], z: [-0.35, 3.14] },
  UpperarmR_044: { x: [-2.5, 0.17], y: [-0.35, 0.35], z: [-1.57, 1.57] },
  UpperarmL_068: { x: [-2.5, 0.17], y: [-0.35, 0.35], z: [-1.57, 1.57] },
  ForearmR_045: { x: [0, 2.53], y: [-0.17, 0.17], z: [-1.57, 1.57] },
  ForearmL_069: { x: [0, 2.53], y: [-0.17, 0.17], z: [-1.57, 1.57] },
  HandR_046: { x: [-1.22, 1.22], y: [-0.44, 0.44], z: [-1.57, 1.57] },
  HandL_070: { x: [-1.22, 1.22], y: [-0.44, 0.44], z: [-1.57, 1.57] },
  ThighR_093: { x: [-2.09, 1.22], y: [-0.79, 0.79], z: [-0.79, 0.79] },
  ThighL_099: { x: [-2.09, 1.22], y: [-0.79, 0.79], z: [-0.79, 0.79] },
  CalfR_094: { x: [0, 2.44], y: [-0.17, 0.17], z: [-0.17, 0.17] },
  CalfL_0100: { x: [0, 2.44], y: [-0.17, 0.17], z: [-0.17, 0.17] },
  FootR_095: { x: [-0.79, 0.79], y: [-0.35, 0.35], z: [-0.52, 0.52] },
  FootL_0101: { x: [-0.79, 0.79], y: [-0.35, 0.35], z: [-0.52, 0.52] },
  ToeR_00: { x: [-0.52, 0.79], y: [-0.17, 0.17], z: [-0.26, 0.26] },
  ToeL_0102: { x: [-0.52, 0.79], y: [-0.17, 0.17], z: [-0.26, 0.26] },
  ThumbR_047: { x: [-0.52, 0.52], y: [-0.52, 0.52], z: [-0.52, 0.52] },
  ThumbL_071: { x: [-0.52, 0.52], y: [-0.52, 0.52], z: [-0.52, 0.52] },
  PointerR_050: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  PointerL_074: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  MiddleR_053: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  MiddleL_077: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  RingR_056: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  RingL_080: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  PinkyR_059: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
  PinkyL_083: { x: [-1.05, 0.17], y: [-0.17, 0.17], z: [-0.35, 0.35] },
};

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.max(min, Math.min(max, value));
}

function clampBoneRotation(
  bone: string,
  x: number,
  y: number,
  z: number,
): { x: number; y: number; z: number } {
  const limits = BONE_LIMITS[bone];
  if (!limits) return { x, y, z };
  return {
    x: limits.x ? clamp(x, limits.x) : x,
    y: limits.y ? clamp(y, limits.y) : y,
    z: limits.z ? clamp(z, limits.z) : z,
  };
}

export async function GET() {
  const commands = commandQueue.splice(0, commandQueue.length);
  return NextResponse.json({ commands });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bone, x, y, z } = body;

  if (typeof bone !== "string" || !bone) {
    return NextResponse.json(
      { error: "bone must be a non-empty string" },
      { status: 400 },
    );
  }
  if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
    return NextResponse.json(
      { error: "x, y, z must be numbers" },
      { status: 400 },
    );
  }

  const clamped = clampBoneRotation(bone, x, y, z);
  commandQueue.push({ bone, ...clamped });
  return NextResponse.json({
    ok: true,
    queued: commandQueue.length,
    clamped: clamped.x !== x || clamped.y !== y || clamped.z !== z,
  });
}
