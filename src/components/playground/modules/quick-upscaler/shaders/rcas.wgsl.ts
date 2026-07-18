/**
 * RCAS — Robust Contrast Adaptive Sharpening
 *
 * WebGPU compute shader port of AMD FidelityFX Super Resolution 1.x RCAS pass.
 * MIT License (original AMD FSR): https://github.com/GPUOpen-Effects/FidelityFX-FSR
 *
 * Algorithm:
 *   For each pixel, sample center and 4 NSEW neighbours.
 *   Compute local min/max contrast, then apply an unsharp-mask style sharpening
 *   that is inversely proportional to local contrast — strong in smooth areas,
 *   weaker at already-sharp edges to prevent halo artifacts.
 *
 *   strength: 0.0 = maximum sharpening, 1.0 = minimum (matches AMD convention
 *   where the parameter is an attenuation, not an amount).
 */
export const RCAS_SHADER = /* wgsl */ `

struct Uniforms {
  texSize  : vec2<f32>,   // width, height of the texture being sharpened
  strength : f32,         // 0.0 = max sharpening … 1.0 = no sharpening
  _pad     : f32,
}

@group(0) @binding(0) var src : texture_2d<f32>;
@group(0) @binding(1) var dst : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> uni : Uniforms;

fn luma(c : vec3<f32>) -> f32 {
  return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

fn sampleColor(coord : vec2<i32>) -> vec4<f32> {
  // Clamp to texture bounds
  let sz = vec2<i32>(i32(uni.texSize.x), i32(uni.texSize.y));
  let c  = clamp(coord, vec2<i32>(0), sz - vec2<i32>(1));
  return textureLoad(src, c, 0);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let coord = vec2<i32>(i32(gid.x), i32(gid.y));
  let sz    = vec2<i32>(i32(uni.texSize.x), i32(uni.texSize.y));
  if (coord.x >= sz.x || coord.y >= sz.y) { return; }

  // Sample centre and 4 NSEW neighbours
  let cC = sampleColor(coord);
  let cN = sampleColor(coord + vec2<i32>( 0, -1));
  let cS = sampleColor(coord + vec2<i32>( 0,  1));
  let cE = sampleColor(coord + vec2<i32>( 1,  0));
  let cW = sampleColor(coord + vec2<i32>(-1,  0));

  let lC = luma(cC.rgb);
  let lN = luma(cN.rgb);
  let lS = luma(cS.rgb);
  let lE = luma(cE.rgb);
  let lW = luma(cW.rgb);

  // Local contrast
  let maxL    = max(max(lN, lS), max(lE, max(lW, lC)));
  let minL    = min(min(lN, lS), min(lE, min(lW, lC)));
  let range   = maxL - minL;

  // Avoid sharpening flat regions that are effectively noise floor
  if (range < 0.004) {
    textureStore(dst, coord, cC);
    return;
  }

  // AMD RCAS weight: w = -rcp(contrast * 8 * amplify)
  // We simplify: sharpen_amount = (1 - strength) / (range * 8 + eps)
  let amplify = 1.0 - uni.strength;           // 0 when strength=1, 1 when strength=0
  let w       = -amplify / (range * 8.0 + 0.001);
  // Clamp so we don't over-sharpen
  let wClamped = clamp(w, -0.25, 0.0);

  // Unsharp mask: out = (C - w*(N+S+E+W)) / (1 - 4w)
  let denom  = 1.0 - 4.0 * wClamped;
  let result = (cC.rgb - wClamped * (cN.rgb + cS.rgb + cE.rgb + cW.rgb)) / denom;

  textureStore(dst, coord,
    vec4<f32>(clamp(result, vec3<f32>(0.0), vec3<f32>(1.0)), cC.a));
}
`
