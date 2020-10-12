//DIFFUSE AND AMBIENT LIGHT

const canvas = document.createElement(`canvas`);
document.body.appendChild(canvas);
const gl = canvas.getContext(`webgl`);

const vertexGLSL = document.getElementById(`vertex`).textContent;
const fragmentGLSL = document.getElementById(`fragment`).textContent;

if (!gl) {
    throw new Error('WebGL not supported');
}

// F, L, B, R, T, U
const vertexData = [

    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -.5, 0.5, // bottom right
    -.5, 0.5, 0.5, // top left
    -.5, 0.5, 0.5, // top left
    0.5, -.5, 0.5, // bottom right
    -.5, -.5, 0.5, // bottom left

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Underside
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];


// Construct an Array by repeating `pattern` n times
function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}

/* uv is another attribute
repeat 6 times: uv coords is same on all 6 faces
give an array: just like vertex --> 2 triangles 
but instead is 2D, so only (u,v) from 0 to 1 */
const uvData = repeat(6, [
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left

    0, 1, // top left
    1, 0, // bottom right
    0, 0  // bottom left
]);

//normal data
//6 vertices in a face point to the same direction,
// F, L, B, R, T, U (the order of normals must match the order of faces in vertex data)
//length already 1, no need to be normalized
const normalData = [
    ...repeat(6, [0, 0, 1]), //F
    ...repeat(6, [-1, 0, 0]), //L
    ...repeat(6, [0, 0, -1]), //B
    ...repeat(6, [1, 0, 0]), //R
    ...repeat(6, [0, 1, 0]), //T
    ...repeat(6, [0, -1, 0]), //U
];

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

// RESOURCE LOADING
// ================
//check if texture is power of 2
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

function loadTexture(url) {
    //create texture object
    const texture = gl.createTexture();
    //create image
    const image = new Image();

    //initialize texture until the image is fully loaded
    image.onload = e => {
        //bind texture (target: type of texture, texture object)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // (target, level of mipmap (can set to 0 and then use generatemipmap),
        // internalformat:color component in texture, 
        // width, height, border=>must be 0,
        // format: format of texel data(in webgl1, must be same with internalformat, in web2 have combinations),
        // type, pixels) details in MDN doc
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            /*TEXTURE_MIN_FILTER is the setting used when the size you are drawing is smaller than the largest mip. 
            TEXTURE_MAG_FILTER is the setting used when the size you are drawing is larger than the largest mip. 
            For TEXTURE_MAG_FILTER only NEAREST and LINEAR are valid settings. */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        
    };

    image.src = url;
    return texture;
}

const boxTexture = loadTexture(`textures/pig.png`);

//attach texture to a texture slot(sampler2D)
gl.activeTexture(gl.TEXTURE0);
//rebind texture
gl.bindTexture(gl.TEXTURE_2D, boxTexture);



// SHADER PROGRAM
// ==============
let uniformLocations;
(function shaderProgram() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexGLSL);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentGLSL);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    //
    const uvLocation = gl.getAttribLocation(program, `uv`);
    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    const normalLocation = gl.getAttribLocation(program, `normal`);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`),
        normalMatrix: gl.getUniformLocation(program, `normalMatrix`),
        textureID: gl.getUniformLocation(program, 'textureID')
    };

    //uniform 1 int: specify unifrom textureID to 0, bc the texture is in slot 0 of sampler2D
    gl.uniform1i(uniformLocations.textureID, 0);
})();


// MATRICES
// ========
const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix, 
    90 * Math.PI / 180, // vertical field-of-view (angle, radians)
    canvas.width / canvas.height, // aspect W/H
    1e-4, // near cull distance
    1e4 // far cull distance
);

const mvMatrix = glMatrix.mat4.create();
const mvpMatrix = glMatrix.mat4.create();

//create normal matrix
const normalMatrix = glMatrix.mat4.create();

glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0, 1.5]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);


// ANIMATION LOOP
// ==============

function animate() {
    requestAnimationFrame(animate);

    glMatrix.mat4.rotateX(modelMatrix, modelMatrix, Math.PI/120);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI/180);
    glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, Math.PI/240);

    glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    /* update normal matrix:
    first: invert the model-view matrix and store in normal matrix
    then: transpose the normal matrix */
    glMatrix.mat4.invert(normalMatrix, mvMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    //set the val of normalMatrix
    gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}


// RESIZE
// ======
function resize(gl){
    var displayWidth = gl.canvas.clientWidth * window.devicePixelRatio;
    var displayHeight = gl.canvas.clientHeight * window.devicePixelRatio;

    if(canvas.width != displayWidth || canvas.height != displayHeight){
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //need to reset projection matrix bc aspect ratio changes
        glMatrix.mat4.perspective(projectionMatrix,
            90 * Math.PI / 180, //veritical field of view (angle in radians)
            canvas.width / canvas.height, //aspect ratio W/H
            1e-4, //near cull distance (how close can be to camera to go out of sight, HAVE TO BE >=0)
            1e4 //far cull plane (null = infinity)
        );
    }
}

resize(gl);
window.addEventListener('resize', function(){resize(gl);});

animate();