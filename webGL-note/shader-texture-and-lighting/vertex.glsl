precision highp float;

const vec3 lightDirection = normalize(vec3(0 , 1.0, 1.0));
const float ambient = 0.1;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

varying vec2 vUV;
varying float vBrightness;

uniform mat4 matrix;
uniform mat4 normalMatrix; //for transformation happened

void main(){
    vec3 worldNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
    //dot can return negative num (means the angle is less than 90, render black)
    //-> use max function
    float diffuse = max(0.0, dot(worldNormal, lightDirection));
    
    //just ambient to diffuse
    vBrightness = diffuse + ambient;
    vUV = uv;
    gl_Position = matrix * vec4(position, 1); 
}