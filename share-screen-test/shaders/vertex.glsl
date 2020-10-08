precision highp float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 Vuv;

uniform mat4 matrix;

void main(){
    Vuv = uv;
    gl_Position = matrix * vec4(position, 1); 
}