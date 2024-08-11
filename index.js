import * as THREE from "three";
import { OrbitControls } from "./OrbitControls.js";
import spline from "./spline.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

//scene fog
scene.fog = new THREE.FogExp2(0x000000, 0.3);

//!Glow effect

//* post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

//* create a line geometry from the spline
const points = spline.getPoints(100);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
const line = new THREE.Line(geometry, material);
//? scene.add(line);
//!The above line is for debugging purposes and for animation purposes too

//* Create a tube geometry from the spline
const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // side: THREE.DoubleSide,//!<-- not needed if the wireframe is true
  wireframe: true,
});

const updateCamera = (t) => {
  const time = t * 0.1;
  const looptime = 8 * 1000;
  const p = (time % looptime) / looptime;
  const position = tubeGeometry.parameters.path.getPointAt(p);
  const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.03) % 1);
  camera.position.copy(position);
  camera.lookAt(lookAt);
};
//*tube
const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
//? scene.add(tube);
//! ^the above line is for debugging purposes only
//*controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
//*Edge geometry
const edges = new THREE.EdgesGeometry(tubeGeometry, 0.2);
const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);

//* boxes
const boxes = 55;
const size = 0.075;
const boxGeometry = new THREE.BoxGeometry(size, size, size);
for (let i = 0; i < boxes; i++) {
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  const p = (i / boxes + Math.random() * 0.1) % 1;
  const pos = tubeGeometry.parameters.path.getPointAt(p);
  pos.x += Math.random() - 0.4;
  pos.y += Math.random() - 0.4;
  box.position.copy(pos);
  const rote = new THREE.Vector3(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  box.rotation.set(rote.x, rote.y, rote.z);
  const coloringfunc = () => {
    const color = Math.random();
    if (color > 0.75 && color < 1) {
      return 0x3b82f6;
    } else if (color > 0.5 && color < 0.75) {
      return 0xff0000;
    } else if (color < 0.5 && color > 0.25) {
      return 0xffe663;
    } else if (color < 0.25) {
      return 0x6fff63;
    }
  };
  const edges = new THREE.EdgesGeometry(boxGeometry, 0.2);
  const lineMat = new THREE.LineBasicMaterial({
    color: coloringfunc(),
  });
  const boxLines = new THREE.LineSegments(edges, lineMat);
  boxLines.rotation.set(rote.x, rote.y, rote.z);
  boxLines.position.copy(pos);
  scene.add(boxLines);
  // scene.add(box);
}

function animate(t = 0) {
  requestAnimationFrame(animate);
  updateCamera(t);
  composer.render(scene, camera);
}
animate();
