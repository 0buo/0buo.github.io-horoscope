precision highp float;

attribute vec3 position;
varying vec3 fragment_position;

uniform mat4 matrix;

void main(){
    fragment_position = position;
    gl_Position = matrix * vec4(position, 1); 
    gl_PointSize = 1.0;
}