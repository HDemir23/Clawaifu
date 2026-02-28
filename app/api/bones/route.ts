import { NextRequest, NextResponse } from "next/server";
import { getBoneState, setBoneState } from "../../../lib/bone-state-store";

interface BoneCommand {
  bone: string;
  x: number;
  y: number;
  z: number;
}

const commandQueue: BoneCommand[] = [];

const MAX_DELTA_PER_COMMAND = 0.2;

const BONE_LIMITS: Record<
  string,
  { x?: [number, number]; y?: [number, number]; z?: [number, number] }
> = {
  Head_021: { x: [-2.3, -1.0], y: [-1.7, -1.2], z: [-2.4, -1.0] },
  Neck_020: { x: [-0.1, 0.2], y: [-0.15, 0.1], z: [-0.4, -0.1] },
  Spine_018: { x: [-0.3, 0.3], y: [-0.1, 0.15], z: [0.0, 0.5] },
  Spine_1_019: { x: [-0.5, 0.5], y: [-0.3, 0.3], z: [-0.5, 0.3] },
  ShoulderR_043: { x: [1.2, 2.2], y: [-0.2, 0.4], z: [-0.3, 0.5] },
  ShoulderL_067: { x: [0.7, 1.8], y: [-0.2, 0.3], z: [-3.2, 3.2] },
  UpperarmR_044: { x: [-3.2, 3.2], y: [-0.6, 1.5], z: [-3.2, 3.2] },
  UpperarmL_068: { x: [-3.2, 3.2], y: [-1.3, 0.6], z: [-3.2, 3.2] },
  ForearmR_045: { x: [0.0, 2.2], y: [-0.05, 0.05], z: [-0.05, 0.05] },
  ForearmL_069: { x: [0.0, 2.2], y: [-0.05, 0.05], z: [-0.05, 0.05] },
  HandR_046: { x: [-2.8, 0.7], y: [0.2, 1.7], z: [-0.5, 2.8] },
  ThighR_093: { x: [-1.5, 0.8], y: [-0.5, 0.5], z: [-0.5, 0.5] },
  ThighL_099: { x: [-1.5, 0.8], y: [-0.5, 0.5], z: [-0.5, 0.5] },
  CalfR_094: { x: [0.0, 2.2], y: [-0.1, 0.1], z: [-0.1, 0.1] },
  CalfL_0100: { x: [0.0, 2.2], y: [-0.1, 0.1], z: [-0.1, 0.1] },
};

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.max(min, Math.min(max, value));
}

function clampDelta(value: number, maxDelta: number): number {
  return Math.max(-maxDelta, Math.min(maxDelta, value));
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
  const { bone, x, y, z, deltaX, deltaY, deltaZ } = body as {
    bone: string;
    x?: number;
    y?: number;
    z?: number;
    deltaX?: number;
    deltaY?: number;
    deltaZ?: number;
  };

  if (typeof bone !== "string" || !bone) {
    return NextResponse.json(
      { error: "bone must be a non-empty string" },
      { status: 400 },
    );
  }

  const hasRelative =
    deltaX !== undefined || deltaY !== undefined || deltaZ !== undefined;
  const hasAbsolute = x !== undefined || y !== undefined || z !== undefined;

  if (!hasRelative && !hasAbsolute) {
    return NextResponse.json(
      {
        error:
          "Provide either absolute (x, y, z) or relative (deltaX, deltaY, deltaZ) values",
      },
      { status: 400 },
    );
  }

  const currentState = getBoneState(bone);
  let targetX: number;
  let targetY: number;
  let targetZ: number;

  if (hasRelative) {
    if (!currentState) {
      return NextResponse.json(
        {
          error: `No current state for bone "${bone}". Frontend must sync state first.`,
        },
        { status: 400 },
      );
    }
    const dX = typeof deltaX === "number" ? deltaX : 0;
    const dY = typeof deltaY === "number" ? deltaY : 0;
    const dZ = typeof deltaZ === "number" ? deltaZ : 0;
    targetX = currentState.x + dX;
    targetY = currentState.y + dY;
    targetZ = currentState.z + dZ;
  } else {
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      return NextResponse.json(
        { error: "x, y, z must be numbers" },
        { status: 400 },
      );
    }
    targetX = x;
    targetY = y;
    targetZ = z;
  }

  if (currentState) {
    const diffX = targetX - currentState.x;
    const diffY = targetY - currentState.y;
    const diffZ = targetZ - currentState.z;

    const clampedDiffX = clampDelta(diffX, MAX_DELTA_PER_COMMAND);
    const clampedDiffY = clampDelta(diffY, MAX_DELTA_PER_COMMAND);
    const clampedDiffZ = clampDelta(diffZ, MAX_DELTA_PER_COMMAND);

    targetX = currentState.x + clampedDiffX;
    targetY = currentState.y + clampedDiffY;
    targetZ = currentState.z + clampedDiffZ;
  }

  const originalTarget = { x: targetX, y: targetY, z: targetZ };
  const clamped = clampBoneRotation(bone, targetX, targetY, targetZ);

  setBoneState(bone, clamped);

  commandQueue.push({ bone, ...clamped });

  const wasDeltaClamped =
    currentState &&
    (Math.abs(originalTarget.x - currentState.x) > MAX_DELTA_PER_COMMAND ||
      Math.abs(originalTarget.y - currentState.y) > MAX_DELTA_PER_COMMAND ||
      Math.abs(originalTarget.z - currentState.z) > MAX_DELTA_PER_COMMAND);

  return NextResponse.json({
    ok: true,
    queued: commandQueue.length,
    clamped:
      clamped.x !== originalTarget.x ||
      clamped.y !== originalTarget.y ||
      clamped.z !== originalTarget.z,
    deltaClamped: wasDeltaClamped || false,
    target: clamped,
  });
}
