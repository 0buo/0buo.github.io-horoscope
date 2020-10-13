//var switchButton = document.getElementById(`switchImg`);

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
        this.imageW = 3840;
        this.imageH = 2160;

        this.data = {};
        this.buffers = {};
        this.attributeLocations = {};
        this.uniformLocations = {};

        this.imgTextures = [];
        this.fboCount = 0;

        //efects texture
        this.kernels = {};
        this.effects = [];
        this.effectTextures = [];
        this.framebuffers = [];
        this.renderbuffers = [];

        this.curImgID = global_img_index;
        this.curFilterID = global_img_index + 7;

        this.modelMatrix = glMatrix.mat4.create();
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();
        this.mvMatrix = glMatrix.mat4.create();
        this.mvpMatrix = glMatrix.mat4.create();

        // this.camera = {};
        // this.camera.translation = [0, 0, 0];
        // this.camera.rotation = quat.create();

        //mouse
        this.mx = 0;
        this.my = 0;
        this.dx = 0;
        this.dy = 0;
        this.bias = 0.05;
        this.threshHolds = {
            x: 20,
            y: 15
        };

        this.IDmouseMove = undefined;
        this.lastNOWmouse = undefined;
        this.lastNOWslide = undefined;

        this.switchButton = switchButton;
        
        //use effects
        this.IDalpha = undefined;
        this.alpha = 1;
        this.alphaDir = -1;
        this.lastNOWalpha = undefined;

        this.slideSwitched = false;
        this.cur_ui = undefined;

        //======================
        this.constructData();
        this.bindDataToBuffer();

        //effects
        this.setupEffectTexAndFBO();
        this.constructKernel();

        //load and bind textures
        const urls = [...img_urls, ...filter_urls];
        loadImages(urls, this.loadImgTextures.bind(this));
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
        
        //gl.bindTexture(gl.TEXTURE_2D, null);
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
        this.bindTextures([...this.imgTextures, ...this.effectTextures]);
    }

    bindTextures(textures){
        for (var i = 0; i < textures.length; i++){
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        }
        this.main();
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
    // setUniformMouse(){
    //     gl.uniform2f(this.uniformLocations.mouse, this.mx / this.threshHolds.x, this.my / this.threshHolds.y);
    //     // gl.uniform1f(this.uniformLocations.pixelRatio, 1 / window.devicePixelRatio);
    //     // gl.uniform4f(this.uniformLocations.resolution, w, h, a1, a2);
    // }

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

        this.IDmouseMove = requestAnimationFrame(this.mouseLerp.bind(this));
    }

    mouseLerp(timestamp){
        cancelAnimationFrame(this.IDmouseMove);
        this.IDmouseMove = requestAnimationFrame(this.mouseLerp.bind(this));

        if(this.lastNOWmouse === undefined){
            this.lastNOWmouse = timestamp;
        }
        var NOW = timestamp;
        var dt = (NOW - this.lastNOWmouse)/1000;
        this.lastNOWmouse = NOW;
        
        this.dx = lerp(this.dx, this.mx, 1-Math.pow(0.2, dt));
        this.dy = lerp(this.dy, this.my, 1-Math.pow(0.1, dt));

        gl.uniform2f(this.uniformLocations.mouse, this.dx / this.threshHolds.x, this.dy / this.threshHolds.y);
    }

    setImagesTexture(){
        if(last_img_index != global_img_index){
            last_img_index = global_img_index;
            this.switchImgAnim();
        }
        this.curImgID = global_img_index;
        this.curFilterID = global_img_index + 7;
        this.setUniformTexture();
    }

    imgSlide(){
        var now = new Date().getTime();
        if(this.lastNOWslide === undefined){this.lastNOWslide = now;}

        if(!ui_is_dispersed){
            if(now - this.lastNOWslide > 15000){
                this.lastNOWslide = now;
                this.slideSwitched = false;
                // global_img_index = (global_img_index + 1) % 7;
                // last_img_index = global_img_index;
                // cur_artist_name.innerHTML = artist_names[global_img_index];
                this.switchImgAnim();
            }
        }
        else{
            this.lastNOWslide = now;
        }

        gl.uniform1f(this.uniformLocations.alpha, this.alpha);
    }
    slideIndexUpdate(){
        if(!this.slideSwitched){
            global_img_index = (global_img_index + 1) % 7;
            last_img_index = global_img_index;
            cur_artist_name.innerHTML = artist_names[global_img_index];
            this.slideSwitched = true;
        }
    }

    //-------------USE EFFECTS
    switchImgAnim(elem){
        this.cur_ui = elem;

        this.lastNOWalpha = undefined;
        this.alphaDir = -1;
        this.IDalpha = requestAnimationFrame(this.alphaAnim.bind(this));
    }

    alphaAnim(timestamp){
        if(this.lastNOWalpha === undefined){
            this.lastNOWalpha = timestamp;
        }
        var NOW = timestamp;
        var dt = (NOW - this.lastNOWalpha)/1000;
        this.lastNOWalpha = NOW;

        this.switchEffect();
        
        if(this.alphaDir == -1){
            this.IDalpha = requestAnimationFrame(this.alphaAnim.bind(this));

            this.alpha = lerp(this.alpha, 0, 1-Math.pow(1e-6, dt));
            if(Math.abs(this.alpha - 0) < 0.005){this.alphaDir = 1;}
        }
        else if(this.alphaDir == 1){
            this.alpha = lerp(this.alpha, 1, 1-Math.pow(0.01, dt));

            if(Math.abs(this.alpha - 1) > 0.005){
                this.IDalpha = requestAnimationFrame(this.alphaAnim.bind(this));
            }
            else{
                cancelAnimationFrame(this.IDalpha);
            }
        }
    }

    switchEffect(){
        if(this.alpha < 0.4 && this.alpha >= 0.3){
            this.effects[0].on = true;
            this.effects[1].on = false;
            this.effects[2].on = false;
            this.effects[3].on = false;
            this.effects[4].on = false;
            this.effects[5].on = false;
        }
        else if(this.alpha < 0.3 && this.alpha >= 0.2){
            this.effects[0].on = true;
            this.effects[1].on = true;
            this.effects[2].on = false;
            this.effects[3].on = false;
            this.effects[4].on = false;
            this.effects[5].on = false;
        }
        else if(this.alpha < 0.2 && this.alpha >= 0.15){
            this.effects[0].on = true;
            this.effects[1].on = true;
            this.effects[2].on = true;
            this.effects[3].on = false;
            this.effects[4].on = false;
            this.effects[5].on = false;
        }
        else if(this.alpha < 0.15 && this.alpha >= 0.1){
            this.effects[0].on = true;
            this.effects[1].on = true;
            this.effects[2].on = true;
            this.effects[3].on = true;
            this.effects[4].on = false;
            this.effects[5].on = false;
        }
        else if(this.alpha < 0.1 && this.alpha >= 0.05){
            this.effects[0].on = true;
            this.effects[1].on = true;
            this.effects[2].on = true;
            this.effects[3].on = true;
            this.effects[4].on = true;
            this.effects[5].on = false;
        }
        else if(this.alpha < 0.05){
            this.effects[0].on = true;
            this.effects[1].on = true;
            this.effects[2].on = true;
            this.effects[3].on = true;
            this.effects[4].on = true;
            this.effects[5].on = true;

            this.slideIndexUpdate();
            menu_ui.ui_update_index(this.cur_ui);
        }
        else{
            this.effects[0].on = false;
            this.effects[1].on = false;
            this.effects[2].on = false;
            this.effects[3].on = false;
            this.effects[4].on = false;
            this.effects[5].on = false;
        }
    }

    //---------------CREATE AND SETUP EFFECT TEXTURE
    createEffectTexture(){
        var effectTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, effectTexture);

        // make the texture the same size as the image
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, this.imageW, this.imageH, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);
        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return effectTexture;
    }
    setupEffectTexAndFBO(){
        // create 2 textures and attach them to framebuffers.
        for (var ii = 0; ii < 2; ii++) {
            var effectTexture = this.createEffectTexture();
            this.effectTextures.push(effectTexture);

            // var renderBuffer = gl.createRenderbuffer();
            // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
            // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.imageW, this.imageH);
            // this.renderbuffers.push(renderBuffer);

            // Create a framebuffer
            var fbo = gl.createFramebuffer();
            this.framebuffers.push(fbo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            //gl.viewport(0, 0, this.imageW, this.imageH);

            // Attach a texture to it.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, effectTexture, 0);
            //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
    }
    constructKernel(){
        this.kernels = {
            normal: [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0
            ],
            gaussianBlur: [
            0.045, 0.122, 0.045,
            0.122, 0.332, 0.122,
            0.045, 0.122, 0.045
            ],
            unsharpen: [
            -1, -1, -1,
            -1, 9, -1,
            -1, -1, -1
            ],
            sharpness: [
            0,-1, 0,
            -1, 5,-1,
            0,-1, 0
            ],
            sharpen: [
            -1, -1, -1,
            -1, 16, -1,
            -1, -1, -1
            ],
            emboss: [
            -2, -1,  0,
            -1, 1,  1,
            0,  1,  2
            ],
            edgeDetect2: [
            -1, -1, -1,
            -1, 8, -1,
            -1, -1, -1
             ],
        };
        this.effects = [
            { name: "unsharpen", on: false},
            { name: "unsharpen", on: false},
            { name: "unsharpen", on: false},
            { name: "unsharpen", on: false},
            { name: "emboss", on: false},
            { name: "emboss", on: false}
        ];
    }
    computeKernelWeight(kernel) {
        var weight = kernel.reduce(function(prev, curr) {
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
    }
    setFrameBuffer(fbo, w, h){
        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Tell webgl the viewport setting needed for framebuffer.
        gl.viewport(0, 0, w, h);
    }
    drawWithKernel(name){
        // set the kernel and it's weight
        gl.uniform1fv(this.uniformLocations.kernel, this.kernels[name]);
        gl.uniform1f(this.uniformLocations.kernelWeight, this.computeKernelWeight(this.kernels[name]));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.data.vertex.length / 3);
    }

    draw(){
        //this.resize();
        gl.useProgram(this.program);

        gl.clearColor(0,0,0,0);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        gl.activeTexture(gl.TEXTURE0 + global_img_index);
        gl.bindTexture(gl.TEXTURE_2D, this.imgTextures[global_img_index]);
        gl.uniform1f(this.uniformLocations.flipY, 1);

        this.fboCount = 0;
        var effect_on = 0
        for(var i = 0; i < this.effects.length; i++){
            if(this.effects[i].on){ 
                this.threshHolds = {x: 40, y:45};

                this.setFrameBuffer(this.framebuffers[this.fboCount % 2], this.imageW, this.imageH);

                this.drawWithKernel(this.effects[i].name);
                gl.activeTexture(gl.TEXTURE0 + global_img_index);
                gl.bindTexture(gl.TEXTURE_2D, this.effectTextures[this.fboCount % 2]);
                

                ++this.fboCount;
                ++effect_on;
            }
        }
        if(effect_on == 0){this.threshHolds = {x: 20, y:15};}
        // finally draw the result to the canvas.
        gl.uniform1f(this.uniformLocations.flipY, -1);  // need to y flip for canvas
        this.setFrameBuffer(null, canvas.width, canvas.height);

        this.drawWithKernel("normal");
    }

    imageSizeMatrix(imageAspect, canvasAspect, scaleMode){
        let scaleX;
        let scaleY;

        switch (scaleMode) {
            case 'fitV':
            scaleY = 1;
            scaleX = imageAspect / canvasAspect;
            break;
            case 'fitH':
            scaleX = 1;
            scaleY = canvasAspect / imageAspect;
            break;
            case 'contain':
            scaleY = 1;
            scaleX = imageAspect / canvasAspect;
            if (scaleX > 1) {
                scaleY = 1 / scaleX;
                scaleX = 1;
            }
            break;
            case 'cover':
            scaleY = 1;
            scaleX = imageAspect / canvasAspect;
            if (scaleX < 1) {
                scaleY = 1 / scaleX;
                scaleX = 1;
            }
            break;
        }
        
        var mat = [
            scaleX, 0, 0, 0,
            0, -scaleY, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
        gl.uniformMatrix4fv(this.uniformLocations.size_mat, false, mat);
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
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendEquation(gl.FUNC_ADD);

        this.uniformLocations = {
            matrix: gl.getUniformLocation(this.program, `matrix`),
            imgID: gl.getUniformLocation(this.program, `imgID`),
            filterID: gl.getUniformLocation(this.program, `filterID`),
            mouse: gl.getUniformLocation(this.program, `mouse`),
            textureSize: gl.getUniformLocation(this.program, `textureSize`),
            kernel: gl.getUniformLocation(this.program, `kernel[0]`),
            kernelWeight: gl.getUniformLocation(this.program, `kernelWeight`),
            flipY: gl.getUniformLocation(this.program, `flipY`),
            size_mat: gl.getUniformLocation(this.program, `size_mat`),
            alpha: gl.getUniformLocation(this.program, `alpha`)
        };
        gl.uniform1f(this.uniformLocations.flipY, -1);
        //gl.uniform1f(this.uniformLocations.motionBlurConst, 0.0);
        this.setUniformTexture();

        this.setUpMatrix();

        this.resize();
        window.addEventListener(`resize`, this.resize.bind(this));
        document.addEventListener(`mousemove`, this.mouseMoveCalc.bind(this));

        this.render();
    }

    update(){
        glMatrix.mat4.multiply(this.mvMatrix, this.viewMatrix, this.modelMatrix);
        glMatrix.mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.mvMatrix);

        gl.uniformMatrix4fv(this.uniformLocations.matrix, false, this.mvpMatrix);

        this.imgSlide();
        this.setImagesTexture();
    }

    resize(){
        var displayWidth = canvas.clientWidth * window.devicePixelRatio;
        var displayHeight = canvas.clientHeight * window.devicePixelRatio;
    
        if(canvas.width != displayWidth || canvas.height != displayHeight){
            canvas.width = displayWidth;
            canvas.height = displayHeight;
    
            this.persp.aspect = canvas.width / canvas.height;
            //need to reset projection matrix bc aspect ratio changes
            glMatrix.mat4.perspective(this.projectionMatrix, 
                this.persp.fov, // vertical field-of-view (angle, radians)
                this.persp.aspect, // aspect W/H
                this.persp.near, // near cull distance
                this.persp.far // far cull distance
            );

            gl.uniform2f(this.uniformLocations.textureSize, canvas.width, canvas.height);

            this.imageSizeMatrix(this.imageW / this.imageH, canvas.clientWidth / canvas.clientHeight, `contain`);

            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        // var w = canvas.offsetWidth;
        // var h = canvas.offsetHeight;
        // var asp = 9 / 16;
        // var a1 = (w/h) * asp;
        // var a2 = 1;
        //this.setUniformMouse();
    }

    render(){
        this.update();
        this.draw();

        //gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.data.vertex.length / 3);
        requestAnimationFrame(this.render.bind(this));
    }
}

var depthIMG = new GLcanvas();