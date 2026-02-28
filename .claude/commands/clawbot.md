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
Returns the list of bone names available in the loaded model.
```json
{ "bones": ["Bone", "Bone.001", "J_Bip_L_UpperArm", ...] }
```

### POST /api/bones
Enqueues a rotation command for one bone.
```json
{ "bone": "J_Bip_L_UpperArm", "x": 0.0, "y": 0.0, "z": 1.2 }
```
- `bone`: exact bone name from the registry (case-sensitive)
- `x`, `y`, `z`: rotation in **radians** — range roughly `-π` to `π` (about `-3.14` to `3.14`)
- Returns `{ "ok": true, "queued": N }`

### Reset a bone
Send `x: 0, y: 0, z: 0` to return it to its rest pose.

---

## Anatomy guide (common VRM/humanoid bones)

| Body part | Likely bone name patterns |
|-----------|--------------------------|
| Upper arm L | `J_Bip_L_UpperArm`, `UpperArm_L`, `mixamorig:LeftArm` |
| Lower arm L | `J_Bip_L_LowerArm`, `ForeArm_L`, `mixamorig:LeftForeArm` |
| Hand L | `J_Bip_L_Hand`, `Hand_L` |
| Upper arm R | `J_Bip_R_UpperArm`, `UpperArm_R`, `mixamorig:RightArm` |
| Lower arm R | `J_Bip_R_LowerArm`, `ForeArm_R`, `mixamorig:RightForeArm` |
| Hand R | `J_Bip_R_Hand`, `Hand_R` |
| Spine | `J_Bip_C_Spine`, `Spine`, `mixamorig:Spine` |
| Chest | `J_Bip_C_Chest`, `Chest` |
| Neck | `J_Bip_C_Neck`, `Neck` |
| Head | `J_Bip_C_Head`, `Head` |
| Upper leg L | `J_Bip_L_UpperLeg`, `UpLeg_L` |
| Upper leg R | `J_Bip_R_UpperLeg`, `UpLeg_R` |

Always use the exact names from the registry — these are illustrative patterns only.

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
