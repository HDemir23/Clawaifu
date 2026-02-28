# /clawbot — LLM Bone Control Skill

You are controlling a 3D anime character (Chiku) in a Next.js app running at `http://localhost:3000`.

## Your job

Given a pose description (e.g. "make her wave", "hands on hips", "look left"), you will:

1. **Discover available bones** — GET `http://localhost:3000/api/bones/register`
2. **Interpret the pose** — map the description to specific bone names and rotation values
3. **Send commands** — POST one command per bone to `http://localhost:3000/api/bones`

The model polls every 150ms, so bones will move almost immediately.

---

## API Reference

### GET /api/bones/register
Returns available bone names from the loaded model.
```json
{ "bones": ["Head_021", "Neck_020", "UpperarmR_044", ...] }
```

### POST /api/bones
Enqueues a rotation command for one bone. Two modes:

**Absolute** — set exact rotation:
```json
{ "bone": "Head_021", "x": -1.5, "y": -1.4, "z": -1.8 }
```

**Relative (delta)** — offset from current state (requires frontend to have synced state first):
```json
{ "bone": "Head_021", "deltaX": 0.1, "deltaY": 0.0, "deltaZ": -0.05 }
```

**Response:**
```json
{
  "ok": true,
  "queued": 1,
  "clamped": false,
  "deltaClamped": false,
  "target": { "x": -1.5, "y": -1.4, "z": -1.8 }
}
```
- `target` — the rotation **actually applied** (after clamping) — use this to know where the bone ended up
- `clamped: true` — values hit bone limits; check `target` to see what was allowed
- `deltaClamped: true` — change was too large (max **0.2 rad per command**); send multiple commands to reach distant targets

### GET /api/bones/state
Returns the server's current known rotation for all bones.
```json
{ "states": { "Head_021": { "x": -1.5, "y": -1.4, "z": -1.8 }, ... } }
```
Use this to check where bones are before sending deltas.

### Reset a bone
Send `x: 0, y: 0, z: 0` to return it to rest pose.

---

## Chiku bone map with limits

These are the actual bones and their clamped rotation ranges (radians). Values outside these ranges will be silently clamped.

| Bone name | X range | Y range | Z range |
|-----------|---------|---------|---------|
| `Head_021` | −2.3 → −1.0 | −1.7 → −1.2 | −2.4 → −1.0 |
| `Neck_020` | −0.1 → 0.2 | −0.15 → 0.1 | −0.4 → −0.1 |
| `Spine_018` | −0.3 → 0.3 | −0.1 → 0.15 | 0.0 → 0.5 |
| `Spine_1_019` | −0.5 → 0.5 | −0.3 → 0.3 | −0.5 → 0.3 |
| `ShoulderR_043` | 1.2 → 2.2 | −0.2 → 0.4 | −0.3 → 0.5 |
| `ShoulderL_067` | 0.7 → 1.8 | −0.2 → 0.3 | −3.2 → 3.2 |
| `UpperarmR_044` | −3.2 → 3.2 | −0.6 → 1.5 | −3.2 → 3.2 |
| `UpperarmL_068` | −3.2 → 3.2 | −1.3 → 0.6 | −3.2 → 3.2 |
| `ForearmR_045` | 0.0 → 2.2 | −0.05 → 0.05 | −0.05 → 0.05 |
| `ForearmL_069` | 0.0 → 2.2 | −0.05 → 0.05 | −0.05 → 0.05 |
| `HandR_046` | −2.8 → 0.7 | 0.2 → 1.7 | −0.5 → 2.8 |
| `ThighR_093` | −1.5 → 0.8 | −0.5 → 0.5 | −0.5 → 0.5 |
| `ThighL_099` | −1.5 → 0.8 | −0.5 → 0.5 | −0.5 → 0.5 |
| `CalfR_094` | 0.0 → 2.2 | −0.1 → 0.1 | −0.1 → 0.1 |
| `CalfL_0100` | 0.0 → 2.2 | −0.1 → 0.1 | −0.1 → 0.1 |

Bones not in this table have no limits enforced. Always use exact names from `/api/bones/register`.

---

## Example workflow: "make her wave"

```bash
# 1. Discover bones
curl http://localhost:3000/api/bones/register

# 2. Find right arm bones in the response, then send wave commands
curl -X POST http://localhost:3000/api/bones \
  -H "Content-Type: application/json" \
  -d '{"bone":"J_Bip_R_UpperArm","x":0,"y":0,"z":-1.4}'

curl -X POST http://localhost:3000/api/bones \
  -H "Content-Type: application/json" \
  -d '{"bone":"J_Bip_R_LowerArm","x":0,"y":0,"z":-0.8}'
```

---

## Tips

- Send multiple POSTs in sequence to pose multiple bones
- Use small incremental values (0.1–0.5 rad) for subtle movements
- Use larger values (1.0–1.5 rad) for dramatic poses
- Unknown bone names are logged as warnings in the browser console but don't crash anything
- The user's argument (e.g. `$ARGUMENTS`) is the pose description — interpret it creatively

## Arguments

The user's request: **$ARGUMENTS**
