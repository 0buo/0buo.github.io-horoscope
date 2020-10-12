precision mediump float;

varying vec2 Vuv;

uniform sampler2D imgID;
uniform sampler2D filterID;
uniform vec2 mouse;
uniform vec2 textureSize;

// uniform float motionBlurConst;
uniform float kernel[9];
uniform float kernelWeight;
uniform float flipY;

uniform float alpha;
// uniform float pixelRatio;
// uniform vec4 resolution;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v,2.);
  return mix(m,2.0 - m, step(1.0 ,m));
}


void main(){
  // compute 1 pixel in texture coordinates.
  vec2 onePixel = vec2(1.0, 1.0) / textureSize;

  float depth_bias = 0.5;
  vec2 vUv = Vuv;
  // 1 - uv.y so that the y is flipped, bc webgl renders texture upside down
  
  if(flipY < -0.99){
    vUv.y = 1. - vUv.y;
    vUv = mirrored(vUv);
  }
  
  vec4 depth = texture2D(filterID, vUv);
  vec2 depth_uv = vec2(vUv.x + (depth.r - depth_bias)*mouse.x, vUv.y + (depth.r - depth_bias)*mouse.y);

  //if(flipY < -0.99){
     //depth_uv = mirrored(depth_uv);
  //}

  vec4 sum = 
       texture2D(imgID, depth_uv + onePixel * vec2(-1, -1)) * kernel[0] +
       texture2D(imgID, depth_uv + onePixel * vec2( 0, -1)) * kernel[1] +
       texture2D(imgID, depth_uv + onePixel * vec2( 1, -1)) * kernel[2] +
       texture2D(imgID, depth_uv + onePixel * vec2(-1,  0)) * kernel[3] +
       texture2D(imgID, depth_uv + onePixel * vec2( 0,  0)) * kernel[4] +
       texture2D(imgID, depth_uv + onePixel * vec2( 1,  0)) * kernel[5] +
       texture2D(imgID, depth_uv + onePixel * vec2(-1,  1)) * kernel[6] +
       texture2D(imgID, depth_uv + onePixel * vec2( 0,  1)) * kernel[7] +
       texture2D(imgID, depth_uv + onePixel * vec2( 1,  1)) * kernel[8] ;

  vec4 texel = vec4((sum / kernelWeight).rgb, alpha);

  gl_FragColor = texel;
}