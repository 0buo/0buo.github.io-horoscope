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
    //box has 6 faces (each 2 triangles) in one vertex 
    const vertexData  = [
        /*can start with 4 corners of a face and then find triangles, like:
          v1
          v2
          v3

          v3
          v2
          v4 
          
          shape:
          3            1
          
          


          4            2
          */

        // Front
        0.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        -.5, 0.5, 0.5,
        -.5, 0.5, 0.5,
        0.5, -.5, 0.5,
        -.5, -.5, 0.5,

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

        // Bottom
        0.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, 0.5,
        -.5, -.5, 0.5,
        0.5, -.5, -.5,
        -.5, -.5, -.5,
    ]

    function randomColor(){
        return [Math.random(), Math.random(), Math.random()];
    }

    //run colordata through for loops to get 6*6 colors for vertexes
    let colorData = [];
    for (let face = 0; face < 6; face++){
        let faceColor = randomColor();
        for (let vertex = 0; vertex < 6; vertex++){
            colorData.push(...faceColor);
        }
    }

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
    //rebind to corresponding buffer to feed value bc at this point it is bind to most recent buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //gl.vertexAttribPointer(id, how-many-to-read-at-a-time, type, is-normalized?, stride, offset)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    //get generic attr ID of the named attribute `color`
    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    //rebind to corresponding buffer to feed value bc at this point it is bind to most recent buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    //*********use program
    gl.useProgram(program);

    // ! test depth so that the most recent draw vertex is still shown according to depth !
    gl.enable(gl.DEPTH_TEST);

    
    /********** matrix*/
    //get uniform's location(id)
    uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`)
    }

    //gl matrix lib
        //mat4: 4 * 4
        //quat: quaternion 
    const modelMatrix = glMatrix.mat4.create(); //create an identity matrix

    const viewMatrix = glMatrix.mat4.create(); //for cam

    //perspective matrix
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix,
        75 * Math.PI / 180, //veritical field of view (angle in radians)
        canvas.width / canvas.height, //aspect ratio W/H
        1e-4, //near cull distance (how close can be to camera to go out of sight, HAVE TO BE >=0)
        1e4 //far cull plane (null = infinity)
    );

    //placeholder matrices
    const mvMatrix = glMatrix.mat4.create(); //mv = model, view
    const mvpMatrix = glMatrix.mat4.create(); //mvp = model, view, projection

    /*mat4.traslate(out, in, translate) 
    where out can just be mat4.create() which is a new matrix
    such as: let result = mat4.translate(mat4.create(), matrix, [2, 5, 1]);
    or just use matrix itself as the result --> translate matrix itself: */
    glMatrix.mat4.translate(modelMatrix, modelMatrix, [-1.5, 0, -2]);
        //can translate again such as:
        //glMatrix.mat4.translate(matrix, matrix, [-1, -3, 0]);
    //glMatrix.mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

    //translate cam matrix and invert it
    glMatrix.mat4.translate(viewMatrix, viewMatrix, [-3, 0 , 1]);
    glMatrix.mat4.invert(viewMatrix, viewMatrix)


    function animate(){
        requestAnimationFrame(animate);

        //glMatrix.mat4.rotate(matrix, matrix, Math.PI/2 / 70, [1, 0, 1]); //usually divide radiant by delta time

        // !!! oder matters in multipplying: 
        //if P * M, then first do tranformation in M, then secondy do P
        glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
        glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

        //pass in val -> (location/id, matrix-transpose?, value)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

        /***********draw */
        //(draw-mode, starting-vertex, how-many-to-draw-a-time)
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    }


    
    /**************** each canvas has 2 sizes: 1. canvas display size (css, style) 
    2. canvas drawing buffer size (canvas.width; canvas.height)
    
    if just use css to resize canvas display size, it'll be blurry bc buffer size not changing*/
    function resize(gl){
        /*for HD-DPI or Retina Display: 
        webgl graphics are not automatically converted to HD-DPI
        so look at the "window.devicePixelRatio" value. 
        This value tells us how many real pixels equals 1 CSS pixel
        ex. for iPhoneX, device pixel ratio is 3; for Samsung Galaxy S8 that value is 5*/

        //gl.canvas just refer back to the HTML canvas (null if not associated with one)
        var displayWidth = gl.canvas.clientWidth * window.devicePixelRatio;
        var displayHeight = gl.canvas.clientHeight * window.devicePixelRatio;

        if(canvas.width != displayWidth || canvas.height != displayHeight){
            canvas.width = displayWidth;
            canvas.height = displayHeight;

            /* gl.viewport tells WebGL how to convert from clip space (-1 to +1) back to pixels and where to do it within the canvas. 
            When you first create the WebGL context WebGL will set the viewport to match the size of the canvas but after 
            that it's up to you to set it. If you change the size of the canvas you need to tell WebGL a new viewport setting. */
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            //need to reset projection matrix bc aspect ratio changes
            glMatrix.mat4.perspective(projectionMatrix,
                75 * Math.PI / 180, //veritical field of view (angle in radians)
                canvas.width / canvas.height, //aspect ratio W/H
                1e-4, //near cull distance (how close can be to camera to go out of sight, HAVE TO BE >=0)
                1e4 //far cull plane (null = infinity)
            );
        }
    }

    resize(gl);
    window.addEventListener('resize', function(){resize(gl);});
    animate();
}

//webglNote();
window.onload = webglNote;
