
function webglNote(){
    const vertexGLSL = document.getElementById(`vertex`).textContent;
    const fragmentGLSL = document.getElementById(`fragment`).textContent;
    
    const canvas = document.createElement(`canvas`);
    document.body.appendChild(canvas);
    const gl = canvas.getContext(`webgl`);
    
    if(!gl){
        throw new Error(`WebGL not supported`);
    }
    
    
    //*******data
    const vertexData  = [
        0, 1, 0,
        1, -1, 0,
        -1, -1, 0
    ]
    
    const colorData = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]
    //*********buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    
    //**********shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexGLSL);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentGLSL);
    gl.compileShader(fragmentShader);
    
    //**********program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //*********enable attributes
    //get generic attr ID of the named attribute `position`
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    //rebind to corresponding buffer to feed in value
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //gl.vertexAttribPointer(id, how-many-to-read-at-a-time, type, is-normalized?, stride, offset)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    //get generic attr ID of the named attribute `color`
    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    //rebind to corresponding buffer to feed in value
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    //*********use program
    gl.useProgram(program);

    /********** matrix*/
    //get uniform's location(id)
    uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`)
    }

    //gl matrix lib
        //mat4: 4 * 4
        //quat: quaternion 
    const matrix = glMatrix.mat4.create(); //create an identity matrix
    /*mat4.traslate(out, in, translate) 
    where out can just be mat4.create() which is a new matrix
    such as: let result = mat4.translate(mat4.create(), matrix, [2, 5, 1]);
    or just use matrix itself as the result --> translate matrix itself: */
    glMatrix.mat4.translate(matrix, matrix, [.2, .5, 0]);
    //can translate again such as:
    //glMatrix.mat4.translate(matrix, matrix, [-1, -3, 0]);

    function animate(){
        requestAnimationFrame(animate);
        glMatrix.mat4.rotate(matrix, matrix, Math.PI/2 / 70, [0, 0, 1]); //usually divide radiant by delta time
        //pass in val -> (location/id, matrix-transpose?, value)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);

        /***********draw */
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    glMatrix.mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

    animate();
}

window.onload = webglNote;
