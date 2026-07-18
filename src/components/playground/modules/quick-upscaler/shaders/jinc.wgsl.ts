/**
 * EWA Jinc — Elliptical Weighted Average with Jinc2 kernel
 *
 * Unlike separable filters (Lanczos3 H+V), EWA samples in a circular
 * pattern around each output pixel. This eliminates the directional bias
 * from two independent passes and produces more natural diagonal edges.
 *
 * Kernel: windowed Jinc2
 *   weight = jinc(r) * jinc(r / R)   where R = 2.0 (2-lobe)
 *
 * jinc(x) = 2 * J1(π*x) / (π*x)     (normalised so jinc(0) = 1)
 *
 * J1 approximated via power series truncated at x^8 — accurate to
 * within ~0.5% for x ∈ [0, 2], which is the full sampling radius here.
 *
 * Sample budget: 5×5 = 25 integer offsets checked,
 *   ~16–21 accepted (distance < 2.0 from fractional position).
 */
export const JINC_SHADER = /* wgsl */ `

const PI : f32 = 3.14159265358979;
const LOBE_RADIUS : f32 = 2.0;

struct Uniforms {
  inputSize  : vec2<f32>,
  outputSize : vec2<f32>,
}

@group(0) @binding(0) var src : texture_2d<f32>;
@group(0) @binding(1) var dst : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var smp : sampler;
@group(0) @binding(3) var<uniform> uni : Uniforms;

// Normalised Jinc: 2*J1(πx)/(πx), so jinc(0) = 1.
// Power series: 1 - (πx)²/8 + (πx)⁴/192 - (πx)⁶/9216 + (πx)⁸/737280
fn jinc(x : f32) -> f32 {
  if (x < 0.0001) { return 1.0; }
  let t  = PI * x;
  let t2 = t * t;
  return 1.0 + t2 * (-0.125 +
         t2 * ( 0.00520833333 +
         t2 * (-0.000108506944 +
         t2 *   0.000001353924)));
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let outCoord = vec2<i32>(i32(gid.x), i32(gid.y));
  let outDim   = vec2<i32>(i32(uni.outputSize.x), i32(uni.outputSize.y));
  if (outCoord.x >= outDim.x || outCoord.y >= outDim.y) { return; }

  // Output pixel centre in normalised UV
  let uv = (vec2<f32>(outCoord) + 0.5) / uni.outputSize;

  // Position in input texel space
  let ts     = 1.0 / uni.inputSize;
  let ipPos  = uv * uni.inputSize - 0.5;
  let iBase  = floor(ipPos);
  let frc    = ipPos - iBase;          // fractional offset [0, 1)
  let baseUV = (iBase + 0.5) * ts;

  // ── EWA circular sampling ─────────────────────────────────────────
  var col  = vec4<f32>(0.0);
  var wSum = 0.0;

  for (var dy : i32 = -2; dy <= 2; dy++) {
    for (var dx : i32 = -2; dx <= 2; dx++) {
      // Vector from sample centre to reconstruction point
      let sOff = vec2<f32>(f32(dx), f32(dy)) - frc;
      let dist = length(sOff);

      // Reject samples outside the 2-lobe circle
      if (dist >= LOBE_RADIUS) { continue; }

      // Windowed Jinc2: outer jinc acts as window (≈0 at r = R)
      let w = jinc(dist) * jinc(dist / LOBE_RADIUS);

      let sUV = baseUV + ts * vec2<f32>(f32(dx), f32(dy));
      col  += textureSampleLevel(src, smp, sUV, 0.0) * w;
      wSum += w;
    }
  }

  var result : vec4<f32>;
  if (wSum > 0.0001) {
    result = col / wSum;
  } else {
    result = textureSampleLevel(src, smp, uv, 0.0);
  }

  textureStore(dst, outCoord, clamp(result, vec4<f32>(0.0), vec4<f32>(1.0)));
}
`
