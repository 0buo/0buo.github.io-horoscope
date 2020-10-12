precision mediump float; //precision for float numbers--medium p

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main(){
    vColor = color;
    /*can simply do dot multuplication of matrix with vec bc of glsl
    !this order matters!*/
    gl_Position = matrix * vec4(position, 1); 
}