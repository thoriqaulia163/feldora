/**
 * Lanczos3 — Horizontal pass (6-tap separable)
 *
 * Output texture size: (outWidth × inputHeight)
 * Reads the original image, writes horizontally upscaled intermediate.
 *
 * Lanczos3 kernel: sinc(x) · sinc(x/3), support |x| < 3
 * 6 taps per output pixel: offsets −2 … +3 from floor(inputX)
 */
export const LANCZOS3_H_SHADER = /* wgsl */ `

struct Uniforms {
  inputSize  : vec2<f32>,  // original (inW, inH)
  outputWidth: f32,        // target width after H upscale
  _pad       : f32,
}

@group(0) @binding(0) var src : texture_2d<f32>;
@group(0) @binding(1) var dst : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var smp : sampler;
@group(0) @binding(3) var<uniform> uni : Uniforms;

fn lanczos3(x : f32) -> f32 {
  let a = abs(x);
  if (a < 0.0001) { return 1.0; }
  if (a >= 3.0)   { return 0.0; }
  let pa    = 3.14159265358979 * a;
  let pa3   = pa / 3.0;
  return (sin(pa) / pa) * (sin(pa3) / pa3);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let ox   = i32(gid.x);
  let iy   = i32(gid.y);
  let outW = i32(uni.outputWidth);
  let inH  = i32(uni.inputSize.y);

  if (ox >= outW || iy >= inH) { return; }

  // Map output x → fractional input x
  let scaleX = uni.outputWidth / uni.inputSize.x;
  let inX    = (f32(ox) + 0.5) / scaleX - 0.5;
  let baseX  = floor(inX);
  let fracX  = inX - baseX;

  let tsX = 1.0 / uni.inputSize.x;
  let yUV = (f32(iy) + 0.5) / uni.inputSize.y;

  var col  = vec4<f32>(0.0);
  var wSum = 0.0;

  // 6 taps: k = −2 … +3
  for (var k : i32 = -2; k <= 3; k++) {
    // Distance from sample centre to reconstruction point
    let dist = f32(k) - fracX;
    let w    = lanczos3(dist);
    let xUV  = (baseX + f32(k) + 0.5) * tsX;
    col  += textureSampleLevel(src, smp, vec2<f32>(xUV, yUV), 0.0) * w;
    wSum += w;
  }

  if (wSum != 0.0) { col /= wSum; }
  textureStore(dst, vec2<i32>(ox, iy),
    clamp(col, vec4<f32>(0.0), vec4<f32>(1.0)));
}
`
