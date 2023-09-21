/****also go check https://github.com/invent-box/Learn-WebGL/tree/master/Demo/Point-Cloud */

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
    //function to output vertex data for point cloud
    function spherePointCloud(pointCount){
        let points = [];
        for (let i = 0; i < pointCount; i++){
            //generate three random number for xyz from -1 to 1
            const r = () => Math.random()*2 - 1; // 0 < r < 1 
            const inputPoint = [r(), r(), r()];

            /*if directly push to points array, will create a kind of a box
            make that every point has fixed distance from origin:
            --> normalize the point as a vector and optionally multiply with a const magnitude*/
            const outputPoint = glMatrix.vec3.normalize(glMatrix.vec3.create(), inputPoint);

            points.push(...outputPoint);
        }
        return points;
    }
    const vertexData  = spherePointCloud(4e5);


    //*********buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    
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

    
    //*********use program
    gl.useProgram(program);

    // !!!!!!!!!!!!! test depth so that the most recent draw vertex is still shown according to depth !
    gl.enable(gl.DEPTH_TEST);

    
    /********** matrix*/
    //get uniform's location(id)
    uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`)
    }

    //gl matrix lib
    const modelMatrix = glMatrix.mat4.create(); //create an identity matrix
    const viewMatrix = glMatrix.mat4.create(); //for cam
    //perspective matrix
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix,
        90 * Math.PI / 180, //veritical field of view (angle in radians)
        canvas.width / canvas.height, //aspect ratio W/H
        1e-4, //near cull distance (how close can be to camera to go out of sight, HAVE TO BE >=0)
        1e4 //far cull plane (null = infinity)
    );

    //placeholder matrices
    const mvMatrix = glMatrix.mat4.create(); //mv = model, view
    const mvpMatrix = glMatrix.mat4.create(); //mvp = model, view, projection

    const modelTranslation = glMatrix.vec3.fromValues(0, 0, -1.25);
    glMatrix.mat4.fromTranslation(modelMatrix, modelTranslation);

    var r = glMatrix.mat4.getRotation(glMatrix.quat.create(), modelMatrix);
    var mouseDown = false;
    function mouseRotateCam(e){
        if(mouseDown){         
            const radiansX = (2 * (e.pageX - canvas.offsetLeft) / canvas.width) - 1;
            glMatrix.quat.rotateY(r, r, radiansX * 0.017);

            const radiansY = (2 * (e.pageY - canvas.offsetTop) / canvas.height) - 1;
            glMatrix.quat.rotateX(r, r, radiansY * 0.017);

            glMatrix.mat4.fromRotationTranslation(modelMatrix, r, modelTranslation);
        }
        else{return;}
    }
    canvas.addEventListener("mousedown", function(){
        r = glMatrix.mat4.getRotation(glMatrix.quat.create(), modelMatrix);
        mouseDown = true;
    });
    window.addEventListener("mouseup", function(){
        mouseDown = false;
    });
    canvas.addEventListener("mousemove", mouseRotateCam);


    function animate(){
        requestAnimationFrame(animate);

        if(mouseDown == false){
            glMatrix.mat4.rotate(modelMatrix, modelMatrix, Math.PI/300, [1, 1, 1]); //usually divide radiant by delta time
        }

        // !!! oder matters in multipplying: 
        //if P * M, then first do tranformation in M, then secondy do P
        glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
        glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

        //pass in val -> (location/id, matrix-transpose?, value)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

        /***********draw */
        //(draw-mode, starting-vertex, how-many-to-draw-a-time) 
        //!!! draw gl.POINTS mode
        gl.drawArrays(gl.POINTS, 0, vertexData.length / 3);
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
}

//webglNote();
window.onload = webglNote;
