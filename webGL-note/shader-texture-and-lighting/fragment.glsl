precision mediump float;

varying vec2 vUV;
varying float vBrightness;

// type is sampler2D -> a number (can only have 96 of sampler2D at a time)
uniform sampler2D textureID;

void main(){
    //take input texture and calculate the pixel color at that coordinate => called texel
    vec4 texel = texture2D(textureID, vUV);
    //only change the rgb with brightness
    texel.xyz *= vBrightness;
    gl_FragColor = texel;
}