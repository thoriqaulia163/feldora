/**
 * Lanczos3 — Vertical pass (6-tap separable)
 *
 * Input texture:  H-pass output (outWidth × inHeight)
 * Output texture: final upscaled image (outWidth × outHeight)
 *
 * Same Lanczos3 kernel as the H pass, applied along Y.
 */
export const LANCZOS3_V_SHADER = /* wgsl */ `

struct Uniforms {
  inputSize   : vec2<f32>,  // H-pass result size (outW, inH)
  outputHeight: f32,        // target height after V upscale
  _pad        : f32,
}

@group(0) @binding(0) var src : texture_2d<f32>;
@group(0) @binding(1) var dst : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var smp : sampler;
@group(0) @binding(3) var<uniform> uni : Uniforms;

fn lanczos3(x : f32) -> f32 {
  let a = abs(x);
  if (a < 0.0001) { return 1.0; }
  if (a >= 3.0)   { return 0.0; }
  let pa  = 3.14159265358979 * a;
  let pa3 = pa / 3.0;
  return (sin(pa) / pa) * (sin(pa3) / pa3);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let ox   = i32(gid.x);
  let oy   = i32(gid.y);
  let outW = i32(uni.inputSize.x);
  let outH = i32(uni.outputHeight);

  if (ox >= outW || oy >= outH) { return; }

  // Map output y → fractional input y
  let scaleY = uni.outputHeight / uni.inputSize.y;
  let inY    = (f32(oy) + 0.5) / scaleY - 0.5;
  let baseY  = floor(inY);
  let fracY  = inY - baseY;

  let tsY = 1.0 / uni.inputSize.y;
  let xUV = (f32(ox) + 0.5) / uni.inputSize.x;

  var col  = vec4<f32>(0.0);
  var wSum = 0.0;

  // 6 taps: k = −2 … +3
  for (var k : i32 = -2; k <= 3; k++) {
    let dist = f32(k) - fracY;
    let w    = lanczos3(dist);
    let yUV  = (baseY + f32(k) + 0.5) * tsY;
    col  += textureSampleLevel(src, smp, vec2<f32>(xUV, yUV), 0.0) * w;
    wSum += w;
  }

  if (wSum != 0.0) { col /= wSum; }
  textureStore(dst, vec2<i32>(ox, oy),
    clamp(col, vec4<f32>(0.0), vec4<f32>(1.0)));
}
`
