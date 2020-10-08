precision mediump float;

varying vec2 Vuv;

uniform sampler2D imgID;
uniform sampler2D filterID;
uniform vec2 mouse;
// uniform float pixelRatio;
// uniform vec4 resolution;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v,2.);
  return mix(m,2.0 - m, step(1.0 ,m));
}

void main(){
    // vec2 uv = pixelRatio * gl_FragCoord.xy / resolution.xy ;
    // vec2 vUv = (uv - vec2(0.5))*resolution.zw + vec2(0.5);
    vec2 vUv = Vuv;
    // 1 - uv.y so that the y is flipped, bc webgl renders texture upside down
    vUv.y = 1. - vUv.y;
    vec4 depth = texture2D(filterID, mirrored(vUv));
    vec2 depth_factor = vec2(vUv.x + (depth.r - 0.5)*mouse.x, vUv.y + (depth.r - 0.5)*mouse.y);
    vec4 texel = texture2D(imgID, mirrored(depth_factor));

    gl_FragColor = texel;
}