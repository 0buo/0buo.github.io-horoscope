precision mediump float; //precision for float numbers--medium p

varying vec3 vColor;

void main(){
    gl_FragColor = vec4(vColor, 1);
}