//UTILITY FUNCS
//=============
const lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
};
//=============

const canvas = document.getElementById(`glCanvas`);
const gl = canvas.getContext(`webgl`);
if (!gl) {
    throw new Error(`WebGL not supported: ${gl}`);
}

//LOAD SHADER AND LINK PROHRAM
//============================
async function loadShaderProgram(vertexURL, fragmentURL) {
    // Fetch shader source code from given URLs
    let res;

    res = await fetch(vertexURL);
    const vertexSource = await res.text();

    res = await fetch(fragmentURL);
    const fragmentSource = await res.text();

    // Util for loading individual shaders
    function loadShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            if (type === gl.VERTEX_SHADER) {
                throw new Error(`(WebGL vertex shader) ${gl.getShaderInfoLog(shader)}`);
            } else if (type === gl.FRAGMENT_SHADER) {
                throw new Error(`(WebGL fragment shader) ${gl.getShaderInfoLog(shader)}`);
            }
        }
        return shader;
    }
    
    const vertexShader = loadShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`(WebGL shader program) ${gl.getProgramInfoLog(vertexShader)}`)
    }
    return program;
}


// RESOURCE LOADING
// ================
function loadImage(url, callback) {
    var image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}
function loadImages(urls, callback) {
    const images = [];
    var imagesToLoad = urls.length;
   
    // Called each time an image finished loading.
    var onImageLoad = function() {
      --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
        callback(images);
    }
    };
   
    for (var ii = 0; ii < imagesToLoad; ++ii) {
      var image = loadImage(urls[ii], onImageLoad);
      images.push(image);
    }
}



//GL CANVAS CLASS
//===============
class GLcanvas {
    constructor(){
        this.data = {};
        this.buffers = {};
        this.attributeLocations = {};
        this.uniformLocations = {};

        this.loadedTextureTypes = 0; //track if imgs and filters are loaded as textures
        this.imgTextures = [];
        this.filterTextures = [];

        this.curImgID = 0;
        this.curFilterID = 2;

        this.modelMatrix = glMatrix.mat4.create();
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
        this.mvMatrix = glMatrix.mat4.create();
        this.mvpMatrix = glMatrix.mat4.create();

        // this.camera = {};
        // this.camera.translation = [0, 0, 0];
        // this.camera.rotation = quat.create();

        this.mx = 0;
        this.my = 0;
        this.dx = 0;
        this.dy = 0;
        this.bias = 0.05;
        this.threshHolds = {
            x: 35,
            y: 20
        }
        this.IDmouse = undefined;
        this.lastNOW = undefined;

        this.switchButton = document.getElementById(`switchImg`);

        //======================
        this.constructData();
        this.bindDataToBuffer();

        //load and bind textures
        loadImages([`./textures/images/moon.jpg`, 
                    `./textures/images/paper-ball.jpg`,
                    `./textures/filters/moon-depth.jpg`,
                    `./textures/filters/paper-ball-depth.jpg`], this.loadImgTextures.bind(this));
    }

    //---------CLASS FUNC FOR DATA AND BUFFER
    constructData(){
        this.data = {
            vertex: [
                -1, -9/16, 0,
                1, -9/16, 0,
                -1, 9/16, 0,
                1, 9/16, 0
            ],
            uv: [
                0.0,  0.0,
                1.0,  0.0,
                0.0,  1.0,
                1.0,  1.0,
            ]
        };
    }

    bindDataToBuffer(){
        this.buffers = {
            vertex: gl.createBuffer(),
            uv: gl.createBuffer()
        };
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.vertex), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.uv), gl.STATIC_DRAW);
    }

    //---------CLASS FUNC FOR TEXTURES
        //check if texture is power of 2
    isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }

    loadTexture(img) {
        var texture = gl.createTexture();
        //bind texture (target: type of texture, texture object)
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // Check if the image is a power of 2 in both dimensions.
        // if (this.isPowerOf2(img.width) && this.isPowerOf2(img.height)) {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //     gl.generateMipmap(gl.TEXTURE_2D);
        // } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //}
    
        return texture;
    }

    loadImgTextures(imgs){
        for (var i = 0; i < imgs.length; i++){
            this.imgTextures.push(this.loadTexture(imgs[i]));
        }
        this.onLoadTextures();
    }


    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    onLoadTextures(){
        

        this.bindTextures(this.imgTextures.concat(this.filterTextures));

        this.main();
    }

    bindTextures(textures){
        for (var i = 0; i < textures.length; i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        }
    }

    //---------CLASS FUNC TO ENABLE AND FEED ATTRIB
    enableAttribs(){
        this.attributeLocations = {
            position: gl.getAttribLocation(this.program, `position`),
            uv: gl.getAttribLocation(this.program, `uv`)
        };

        gl.enableVertexAttribArray(this.attributeLocations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertex);
        gl.vertexAttribPointer(this.attributeLocations.position, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(this.attributeLocations.uv);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uv);
        gl.vertexAttribPointer(this.attributeLocations.uv, 2, gl.FLOAT, false, 0, 0);
    }

    //---------CLASS FUNC TO SET UNIFORM
    setUniformMouse(w, h, a1, a2){
        gl.uniform2f(this.uniformLocations.mouse, this.mx / this.threshHolds.x, this.my / this.threshHolds.y);
        // gl.uniform1f(this.uniformLocations.pixelRatio, 1 / window.devicePixelRatio);
        // gl.uniform4f(this.uniformLocations.resolution, w, h, a1, a2);
    }

    setUniformTexture(){
        gl.uniform1i(this.uniformLocations.imgID, this.curImgID);
        gl.uniform1i(this.uniformLocations.filterID, this.curFilterID);
    }

    //---------CLASS FUNC FOR MATRIX
    setUpMatrix(){
        this.persp = {
            fov: 90 * Math.PI / 180,
            aspect: canvas.width / canvas.height,
            near: 1e-4,
            far: 1e4,
        }

        glMatrix.mat4.perspective(this.projectionMatrix, 
            this.persp.fov, // vertical field-of-view (angle, radians)
            this.persp.aspect, // aspect W/H
            this.persp.near, // near cull distance
            this.persp.far // far cull distance
        );

        glMatrix.mat4.translate(this.viewMatrix, this.viewMatrix, [0, 0, 0.5]);
        glMatrix.mat4.invert(this.viewMatrix, this.viewMatrix);
    }

    //---------ON MOUSE MOVE CALL BACK
    mouseMoveCalc(e){
        var halfWidth = window.innerWidth / 2;
        var halfHeight = window.innerHeight / 2;

        var targetMX = (halfWidth - e.clientX) / halfWidth;
        var targetMY = (halfHeight - e.clientY) / halfHeight;

        this.mx += (targetMX - this.mx) * this.bias;
        this.my += (targetMY - this.my) * this.bias;

        this.IDmouse = requestAnimationFrame(this.mouseLerp.bind(this));
    }

    mouseLerp(timestamp){
        cancelAnimationFrame(this.IDmouse);
        this.IDmouse = requestAnimationFrame(this.mouseLerp.bind(this));

        if(this.lastNOW === undefined){
            this.lastNOW = timestamp;
        }
        var NOW = timestamp;
        var dt = (NOW - this.lastNOW)/1000;
        this.lastNOW = NOW;
        
        this.dx = lerp(this.dx, this.mx, 1-Math.pow(0.2, dt));
        this.dy = lerp(this.dy, this.my, 1-Math.pow(0.1, dt));

        gl.uniform2f(this.uniformLocations.mouse, this.dx / this.threshHolds.x, this.dy / this.threshHolds.y);
    }

    switchImages(){
        this.curImgID = (this.curImgID + 1) % 2;
        this.curFilterID = (this.curFilterID - 2 + 1) % 2 + 2;
        this.setUniformTexture();
    }


    async main(){
        //load shader and link program
        this.program = await loadShaderProgram(`./shaders/vertex.glsl`, `./shaders/fragment.glsl`);

        //enable and feed attributes
        this.enableAttribs();

        //use program
        gl.useProgram(this.program);
        //enable depth check
        gl.enable(gl.DEPTH_TEST);

        this.uniformLocations = {
            matrix: gl.getUniformLocation(this.program, `matrix`),
            imgID: gl.getUniformLocation(this.program, `imgID`),
            filterID: gl.getUniformLocation(this.program, `filterID`),
            mouse: gl.getUniformLocation(this.program, `mouse`),
            // pixelRatio: gl.getUniformLocation(this.program, `pixelRatio`),
            // resolution: gl.getUniformLocation(this.program, `resolution`)
        };
        this.setUniformTexture();

        this.setUpMatrix();

        this.resize();
        window.addEventListener(`resize`, this.resize.bind(this));
        canvas.addEventListener(`mousemove`, this.mouseMoveCalc.bind(this));
        this.switchButton.onclick = this.switchImages.bind(this);

        this.render()
    }

    update(){
        glMatrix.mat4.multiply(this.mvMatrix, this.viewMatrix, this.modelMatrix);
        glMatrix.mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.mvMatrix);

        gl.uniformMatrix4fv(this.uniformLocations.matrix, false, this.mvpMatrix);
    }

    resize(){
        var displayWidth = canvas.clientWidth * window.devicePixelRatio;
        var displayHeight = canvas.clientHeight * window.devicePixelRatio;
    
        if(canvas.width != displayWidth || canvas.height != displayHeight){
            canvas.width = displayWidth;
            canvas.height = displayHeight;
    
            gl.viewport(0, 0, canvas.width, canvas.height);

            this.persp.aspect = canvas.width / canvas.height;
            //need to reset projection matrix bc aspect ratio changes
            glMatrix.mat4.perspective(this.projectionMatrix, 
                this.persp.fov, // vertical field-of-view (angle, radians)
                this.persp.aspect, // aspect W/H
                this.persp.near, // near cull distance
                this.persp.far // far cull distance
            );
        }
        var w = canvas.offsetWidth;
        var h = canvas.offsetHeight;
        var asp = 9 / 16;
        var a1 = (w/h) * asp;
        var a2 = 1;
        this.setUniformMouse(w, h, a1, a2);
    }

    render(){
        this.update();

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.data.vertex.length / 3);
        requestAnimationFrame(this.render.bind(this));
    }
}

const depthIMG = new GLcanvas();