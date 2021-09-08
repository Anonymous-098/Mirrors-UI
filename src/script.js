import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import {Text,preloadFont} from 'troika-three-text';
import { mirrorsData } from '../../../Mirror10/src/data';

preloadFont(
    {
        font: '/fonts/Bristone.otf', 
        characters: 'abcdefghijklmnopqrstuvwxyz'
    }
)

const scene = new THREE.Scene();

const sizes = {
    width:window.innerWidth,
    height:window.innerHeight
}
window.addEventListener("resize",(e)=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width/sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,window.innerHeight);
})

//CAMERA
const camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,0,20);
scene.add(camera); 
camera.layers.enable(1);
camera.layers.set(3);

//CANVAS
const canvas = document.querySelector(".webgl");

//RENDERER
const renderer = new THREE.WebGL1Renderer({
    canvas:canvas
});
renderer.setSize(window.innerWidth,window.innerHeight);

//TEXT Copies
const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2,1),
    new THREE.MeshBasicMaterial()
)
const textPos = ico.geometry.vertices;
var string = 'HOME'

const group = new THREE.Group();

for(var i=0;i<textPos.length;i++)
{
    const myText = new Text();

    myText.text = string
    myText.font = '/fonts/Bristone.otf'
    myText.fontSize = 0.25
    myText.color = 0xFF0000
    myText.anchorX = 'center'
    myText.anchorY = 'center'

    myText.position.copy(textPos[i]);

    const lookAt = new THREE.Vector3().normalize()
    myText.lookAt(lookAt);
    group.add(myText);
}

//MAIN TEXT
const mainText = new Text();

mainText.text = string
mainText.font = '/fonts/Bristone.otf'
mainText.fontSize = 2
mainText.color = 0xFF0000
mainText.anchorX = 'center'
mainText.anchorY = 'center'
mainText.position.set(0,2,-8);
mainText.layers.set(3);
group.add(mainText);

//CUBE CAMERA
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024,{
    format:THREE.RGBAFormat,
    generateMipmaps:true,
    minFilter:THREE.LinearMipMapLinearFilter
});

const cubeCamera = new THREE.CubeCamera(0.1,1000,cubeRenderTarget);
group.add(cubeCamera);

//MIRRORS
const mirrorGeo = new THREE.BoxBufferGeometry(3.5,2.5,0.05);
const mirrorMat = new THREE.MeshBasicMaterial({
    envMap:cubeRenderTarget.texture,
    reflectivity:0.95,
    combine:THREE.MultiplyOperation,
    side:THREE.DoubleSide
});
const mirrorMat1 = new THREE.MeshBasicMaterial({color:0x18191A});
const materials = [
    mirrorMat1,
    mirrorMat1,
    mirrorMat1,
    mirrorMat1,
    mirrorMat,
    mirrorMat
]
const mirrors = [];

const layerGeo = new THREE.BoxBufferGeometry(3.52,2.52,0.07);
const layerMat = new THREE.MeshPhysicalMaterial({
    metalness: 1.0,
    roughness: 0.1,
    envMap: cubeRenderTarget.texture,
    refractionRatio: 1.0,
    transparent: true,
    opacity: 0.6,
    transmission: 0.5,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.29
})
const mirrorLayers = [];

const layerAnim = [];
for(var i=0;i<mirrorsData.mirrors.length;i++)
{
    const mirror = new THREE.Mesh(mirrorGeo,materials);
    const mirrorLayer = new THREE.Mesh(layerGeo,layerMat);
    mirror.position.set(mirrorsData.mirrors[i].position[0],mirrorsData.mirrors[i].position[1],mirrorsData.mirrors[i].position[2]);
    mirror.rotation.set(mirrorsData.mirrors[i].rotation[0],mirrorsData.mirrors[i].rotation[1],mirrorsData.mirrors[i].rotation[2]);
    mirrorLayer.position.set(mirrorsData.mirrors[i].position[0],mirrorsData.mirrors[i].position[1],mirrorsData.mirrors[i].position[2]);
    mirrorLayer.rotation.set(mirrorsData.mirrors[i].rotation[0],mirrorsData.mirrors[i].rotation[1],mirrorsData.mirrors[i].rotation[2]);

    layerAnim.push(mirrorLayer);
    group.add(mirrorLayer);
    mirrorLayer.layers.set(3);

    mirrors.push(mirror);
    mirror.layers.set(3);
    group.add(mirror);
}

scene.add(group);

//MOUSE EVENT
const mouse = new THREE.Vector2();
window.addEventListener("mousemove",(e)=>{

    mouse.x = e.clientX/sizes.width * 2-1;
    mouse.y = 1 - e.clientY/sizes.height *2;
})

const target = new THREE.Vector2();

var tick = function(){

    for(var i=0;i<mirrors.length;i++)
    {
        mirrors[i].rotation.y += 0.001;
        mirrors[i].rotation.z += 0.01;
    }
    for(var i=0;i<layerAnim.length;i++)
    {
        layerAnim[i].rotation.y += 0.001;
        layerAnim[i].rotation.z += 0.01;
    }

    cubeCamera.rotation.x += 0.001;
    cubeCamera.rotation.z += 0.001;

    target.x = ( 1 - mouse.x ) * 0.04;
    target.y = ( 1 - mouse.y ) * 0.04;

    camera.rotation.y += 0.05 * ( target.x - camera.rotation.y );
    camera.rotation.x += 0.03 * ( target.y - camera.rotation.x );

    cubeCamera.update(renderer,scene);
    renderer.render(scene,camera);
    window.requestAnimationFrame(tick);
}

tick();