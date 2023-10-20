import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

export function Pig() {
    const canvas = document.querySelector('.three-canvas');

    //renderer
    const renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping


    //scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF); 

    //camera
    const fov = 50;
    const aspect = window.innerWidth / window.innerHeight; //resizeable
    const near = 0.1;
    const far = 10000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-2, 1, 1);

    //controls
    var controls = new OrbitControls(camera, canvas);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 5;
    //controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2.5;
    //controls.minAzimuthAngle = - Math.PI / 4;
    //controls.maxAzimuthAngle = Math.PI / 4;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 0, 0);
    // controls.enabled = false;

    //postprocessing
    const composer = new EffectComposer(renderer, {
        frameBufferType: HalfFloatType
    });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new EffectPass(camera, new BloomEffect()));


    //play
    requestAnimationFrame(function render() {

        requestAnimationFrame(render);
        composer.render();

    });
}