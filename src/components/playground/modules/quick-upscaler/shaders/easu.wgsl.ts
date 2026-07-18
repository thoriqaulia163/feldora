/**
 * FSR1 EASU — Edge-Adaptive Spatial Upsampling (fixed)
 *
 * Fixes vs v1:
 *   - Lanczos2 (negative lobes → ringing) replaced with quadratic B-spline
 *     (always non-negative → no ringing artifacts)
 *   - Max kernel stretch reduced 2.5× → 1.5× (less aggressive anisotropy)
 *   - Edge strength multiplier toned down
 *
 * Based on AMD FidelityFX Super Resolution 1.x concept (MIT License).
 */
export const EASU_SHADER = /* wgsl */ `

struct Uniforms {
  inputSize  : vec2<f32>,
  outputSize : vec2<f32>,
}

@group(0) @binding(0) var src  : texture_2d<f32>;
@group(0) @binding(1) var dst  : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var smp  : sampler;
@group(0) @binding(3) var<uniform> uni : Uniforms;

fn luma(c : vec3<f32>) -> f32 {
  return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

fn sampleColor(uv : vec2<f32>) -> vec4<f32> {
  return textureSampleLevel(src, smp, uv, 0.0);
}

fn sampleLuma(uv : vec2<f32>) -> f32 {
  return luma(textureSampleLevel(src, smp, uv, 0.0).rgb);
}

// Quadratic B-spline: smooth, always >= 0, support [-1.5, 1.5]
// Replaces Lanczos2 to eliminate ringing artifacts.
fn bspline2(x : f32) -> f32 {
  let a = abs(x);
  if (a >= 1.5) { return 0.0; }
  if (a >= 0.5) { return 0.5 * (1.5 - a) * (1.5 - a); }
  return 0.75 - a * a;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let outCoord = vec2<i32>(i32(gid.x), i32(gid.y));
  let outDim   = vec2<i32>(i32(uni.outputSize.x), i32(uni.outputSize.y));
  if (outCoord.x >= outDim.x || outCoord.y >= outDim.y) { return; }

  let uv      = (vec2<f32>(outCoord) + 0.5) / uni.outputSize;
  let ts      = 1.0 / uni.inputSize;
  let ipPos   = uv * uni.inputSize - 0.5;
  let iBase   = floor(ipPos);
  let frc     = ipPos - iBase;
  let baseUV  = (iBase + 0.5) * ts;

  // ── Edge detection (Sobel 3×3) ────────────────────────────────────
  let la = sampleLuma(baseUV + ts * vec2<f32>(-1.0, -1.0));
  let lb = sampleLuma(baseUV + ts * vec2<f32>( 0.0, -1.0));
  let lc = sampleLuma(baseUV + ts * vec2<f32>( 1.0, -1.0));
  let ld = sampleLuma(baseUV + ts * vec2<f32>(-1.0,  0.0));
  let lf = sampleLuma(baseUV + ts * vec2<f32>( 1.0,  0.0));
  let lg = sampleLuma(baseUV + ts * vec2<f32>(-1.0,  1.0));
  let lh = sampleLuma(baseUV + ts * vec2<f32>( 0.0,  1.0));
  let li = sampleLuma(baseUV + ts * vec2<f32>( 1.0,  1.0));

  let gx   = (lc + 2.0*lf + li) - (la + 2.0*ld + lg);
  let gy   = (lg + 2.0*lh + li) - (la + 2.0*lb + lc);
  let gLen = length(vec2<f32>(gx, gy));

  // Edge direction (along edge) and perpendicular
  var edgeDir = vec2<f32>(1.0, 0.0);
  if (gLen > 0.001) {
    edgeDir = normalize(vec2<f32>(-gy, gx));
  }
  let perpDir = vec2<f32>(-edgeDir.y, edgeDir.x);

  // Stretch factor — max 1.5× (was 2.5×, reduced to avoid over-anisotropy)
  let edgeStrength  = clamp(gLen * 3.0, 0.0, 1.0);
  let stretchFactor = mix(1.0, 1.5, edgeStrength);

  // ── Reconstruction (3×3 neighbourhood with B-spline weights) ─────
  var colSum = vec4<f32>(0.0);
  var wSum   = 0.0;

  for (var dy : i32 = -1; dy <= 1; dy++) {
    for (var dx : i32 = -1; dx <= 1; dx++) {
      let sOff    = vec2<f32>(f32(dx) - frc.x, f32(dy) - frc.y);
      let alongE  = dot(sOff, edgeDir);
      let acrossE = dot(sOff, perpDir);

      // Wider along edge, narrower across (controlled stretch)
      let wx = bspline2(acrossE * stretchFactor);
      let wy = bspline2(alongE);
      let w  = wx * wy;

      let sUV = baseUV + ts * vec2<f32>(f32(dx), f32(dy));
      colSum += sampleColor(sUV) * w;
      wSum   += w;
    }
  }

  var result : vec4<f32>;
  if (wSum > 0.0001) {
    result = colSum / wSum;
  } else {
    result = sampleColor(uv);
  }

  textureStore(dst, outCoord, clamp(result, vec4<f32>(0.0), vec4<f32>(1.0)));
}
`
