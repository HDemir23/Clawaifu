export interface BoneState {
  x: number;
  y: number;
  z: number;
}

const boneStates: Map<string, BoneState> = new Map();

export function getBoneState(boneName: string): BoneState | undefined {
  return boneStates.get(boneName);
}

export function setBoneState(boneName: string, state: BoneState): void {
  boneStates.set(boneName, state);
}

export function setBoneStates(states: Record<string, BoneState>): void {
  for (const [boneName, rot] of Object.entries(states)) {
    boneStates.set(boneName, rot);
  }
}

export function getAllBoneStates(): Record<string, BoneState> {
  const states: Record<string, BoneState> = {};
  boneStates.forEach((value, key) => {
    states[key] = value;
  });
  return states;
}

export function getBoneStateCount(): number {
  return boneStates.size;
}
