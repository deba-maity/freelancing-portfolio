import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import fontData from "./monogram-font.json";
import { connectStudio } from "./studio-controller.js";
import {
  healthTexture,
  angularTexture,
  systemsTexture,
  enterpriseTexture,
  mobileTexture,
  labelTexture,
  exhibitImages,
} from "./exhibit-textures.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export async function createStudio(
  container,
  {
    onSelect,
    onHover,
    onOrbit,
    onReady,
    onFailure,
    reducedMotion = false,
  } = {},
) {
  await document.fonts.ready;
  const mobile = () => innerWidth <= 700;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.35 : 1.7));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e9e9e2");
  scene.fog = new THREE.Fog("#e9e9e2", 60, 135);
  const camera = new THREE.PerspectiveCamera(
    39,
    innerWidth / innerHeight,
    0.1,
    180,
  );
  const controls = new OrbitControls(camera, canvas);
  // Preserve vertical page scrolling on touchscreens; horizontal drags orbit.
  canvas.style.touchAction = "pan-y";
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.13;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.rotateSpeed = 0.48;
  const pmrem = new THREE.PMREMGenerator(renderer),
    environment = new RoomEnvironment();
  let envTarget = pmrem.fromScene(environment, 0.04, 0.1, 100);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.38;
  environment.dispose();
  pmrem.dispose();
  const hemi = new THREE.HemisphereLight("#eef5ff", "#7c8470", 1.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff1d7", 3.2);
  sun.position.set(-15, 27, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile() ? 1536 : 2048, mobile() ? 1536 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -24,
    right: 24,
    top: 22,
    bottom: -22,
    near: 1,
    far: 70,
  });
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.0001;
  sun.shadow.radius = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#c7ddff", 1.3);
  fill.position.set(16, 12, -10);
  scene.add(fill);
  const warmLights = [];
  function warmLight(x, y, z, power = 24) {
    const l = new THREE.PointLight("#ffc278", 0, 9, 2);
    l.position.set(x, y, z);
    l.userData.power = power;
    scene.add(l);
    warmLights.push(l);
    return l;
  }
  warmLight(-8, 4, 1);
  warmLight(8, 4, 1, 35);
  warmLight(0, 4, -5, 38);
  warmLight(6, 3.4, 6, 28);

  const mats = {};
  function material(name, color, roughness = 0.75, metalness = 0) {
    return (mats[name] = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
    }));
  }
  const chalk = material("chalk", "#eeede3", 0.8),
    stone = material("stone", "#c8cbb9", 0.95),
    dark = material("dark", "#28372f", 0.5),
    ink = material("ink", "#172932", 0.5);
  const orange = material("orange", "#ee6029", 0.34, 0.12),
    blue = material("blue", "#3659cb", 0.33, 0.14),
    sage = material("sage", "#b9c89c"),
    mint = material("mint", "#d6e2c2"),
    gold = material("gold", "#c29d59", 0.3, 0.7),
    metal = material("metal", "#d9dcd4", 0.27, 0.72),
    green = material("green", "#486841"),
    pink = material("pink", "#e3a7a0");
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#a8c7cb",
    roughness: 0.12,
    metalness: 0.08,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
    clearcoat: 1,
  });
  const glassBlue = new THREE.MeshPhysicalMaterial({
    color: "#466fce",
    roughness: 0.12,
    metalness: 0.2,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
    clearcoat: 1,
  });
  const lightMaterial = new THREE.MeshStandardMaterial({
    color: "#fff2cb",
    emissive: "#ffcd7b",
    emissiveIntensity: 0.5,
    roughness: 0.5,
  });
  const geoCache = new Map(),
    animations = [];
  const itemRoots = new Map(),
    itemAnchors = new Map();
  function register(object, id, anchor) {
    object.userData.item = id;
    if (!itemRoots.has(id)) itemRoots.set(id, object);
    if (anchor) itemAnchors.set(id, { object, point: V(...anchor) });
    return object;
  }
  function group(parent, x = 0, y = 0, z = 0, item) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    if (item !== undefined) {
      register(g, item);
    }
    return g;
  }
  function box(parent, w, h, d, mat, x = 0, y = 0, z = 0, r = 0.045) {
    const key = [w, h, d, r].join("|");
    let geo = geoCache.get(key);
    if (!geo) {
      geo = r
        ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2))
        : new THREE.BoxGeometry(w, h, d);
      geoCache.set(key, geo);
    }
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(
    parent,
    r1,
    r2,
    h,
    mat,
    x = 0,
    y = 0,
    z = 0,
    segments = 48,
  ) {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r1, r2, h, segments),
      mat,
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function sphere(parent, r, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function face(parent, tex, w, h, x, y, z, rotation = 0) {
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.62,
      metalness: 0,
      emissive: "#ffffff",
      emissiveMap: tex,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotation;
    parent.add(m);
    return m;
  }
  function cable(parent, points, mat, r = 0.035) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => V(...p)));
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 35, r, 7, false),
      mat,
    );
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  function plaque(
    parent,
    title,
    sub,
    x,
    y,
    z,
    w = 3,
    h = 0.65,
    bg = "#eeede3",
    color = "#303b31",
  ) {
    return face(
      parent,
      labelTexture([title], { size: 64, sub, bg, color, height: 256 }),
      w,
      h,
      x,
      y,
      z,
    );
  }
  function plant(parent, x, y, z, scale = 1) {
    const p = group(parent, x, y, z);
    p.scale.setScalar(scale);
    cylinder(p, 0.44, 0.32, 0.7, chalk, 0, 0.35, 0);
    cylinder(p, 0.4, 0.4, 0.04, dark, 0, 0.72, 0);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4,
        h = 1.05 + (i % 3) * 0.3;
      const leaf = sphere(
        p,
        0.32,
        i % 2 ? green : sage,
        Math.sin(a) * 0.31,
        h,
        Math.cos(a) * 0.31,
      );
      leaf.scale.set(0.48, 1.8, 0.7);
      leaf.rotation.set(Math.cos(a) * 0.35, a, Math.sin(a) * 0.4);
      cable(
        p,
        [
          [0, 0.7, 0],
          [Math.sin(a) * 0.12, h * 0.8, Math.cos(a) * 0.12],
          [Math.sin(a) * 0.31, h, Math.cos(a) * 0.31],
        ],
        green,
        0.018,
      );
    }
  }
  function keyboard(parent, x, y, z, w = 2.45, mat = chalk) {
    const g = group(parent, x, y, z);
    box(g, w, 0.09, 0.85, mat, 0, 0, 0, 0.06);
    const keys = new THREE.InstancedMesh(
      new RoundedBoxGeometry(0.14, 0.055, 0.135, 1, 0.015),
      dark,
      52,
    );
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 13; col++) {
        dummy.position.set((col - 6) * 0.167, 0.07, (row - 1.5) * 0.18);
        dummy.updateMatrix();
        keys.setMatrixAt(n++, dummy.matrix);
      }
    keys.castShadow = true;
    g.add(keys);
    return g;
  }
  function monitor(parent, tex, x, y, z, w = 3.6, h = 2.25) {
    const g = group(parent, x, y, z);
    box(g, w + 0.16, h + 0.16, 0.17, dark, 0, h / 2 + 0.55, 0, 0.09);
    face(g, tex, w, h, 0, h / 2 + 0.55, 0.095);
    box(g, 0.16, 0.55, 0.18, metal, 0, 0.28, 0);
    box(g, 1.3, 0.08, 0.85, metal, 0, 0.04, 0.05, 0.08);
    return g;
  }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), stone);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.61;
  ground.receiveShadow = true;
  scene.add(ground);
  const studio = group(scene);
  box(studio, 26, 0.45, 18, chalk, 0, -0.2, 0, 0.2);
  box(studio, 25.4, 0.18, 17.4, stone, 0, -0.5, 0, 0.08);
  box(studio, 26.08, 0.035, 18.08, metal, 0, -0.38, 0, 0.01);
  // Inlaid floor seams and a brass path tie the separate exhibits into one space.
  for (let i = -3; i <= 3; i++)
    box(studio, 0.012, 0.008, 17.3, stone, i * 3.6, 0.035, 0, 0);
  for (let i = -2; i <= 2; i++)
    box(studio, 25.5, 0.008, 0.012, stone, 0, 0.035, i * 3.4, 0);
  cable(
    studio,
    [
      [-11, 0.065, 4.8],
      [-6, 0.065, 5.3],
      [0, 0.065, 5],
      [4, 0.065, 4.7],
      [10, 0.065, 4],
    ],
    gold,
    0.025,
  );
  box(studio, 18.2, 5.6, 0.32, chalk, -3.6, 2.8, -8.2, 0.07);
  box(studio, 5.2, 3.6, 0.32, chalk, 9, 1.8, -8.2, 0.07);
  // Open arch: an actual extruded opening rather than a painted rectangle.
  const shape = new THREE.Shape();
  shape.moveTo(-3, 0);
  shape.lineTo(3, 0);
  shape.lineTo(3, 6);
  shape.lineTo(-3, 6);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-1.65, 0.035);
  hole.lineTo(-1.65, 3.4);
  hole.absarc(0, 3.4, 1.65, Math.PI, 0, true);
  hole.lineTo(1.65, 0.035);
  hole.closePath();
  shape.holes.push(hole);
  const arch = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      bevelSegments: 2,
      curveSegments: 32,
    }),
    chalk,
  );
  arch.position.set(-12.3, 0, -4.4);
  arch.rotation.y = Math.PI / 2;
  arch.castShadow = true;
  arch.receiveShadow = true;
  studio.add(arch);
  box(studio, 0.3, 4.5, 4, chalk, 12.7, 2.25, -6, 0.05);
  // Architectural sunshade, casting long individual shadows.
  for (let i = 0; i < 7; i++)
    box(studio, 0.15, 0.23, 5.2, chalk, -11.1 + i * 1.15, 5.65, -5.6, 0.025);
  box(studio, 8, 0.25, 0.2, chalk, -7.6, 5.65, -3.05, 0.025);
  cylinder(studio, 0.075, 0.075, 5.55, metal, -11.2, 2.77, -3.1);
  cylinder(studio, 0.075, 0.075, 5.55, metal, -4, 2.77, -3.1);
  face(
    studio,
    labelTexture(["BUILT WITH", "INTENTION."], {
      width: 1024,
      height: 650,
      size: 140,
      bg: "#eeede3",
      color: "#3c5144",
      sub: "DEBAJYOTI MAITY / AN INTERACTIVE PORTFOLIO",
    }),
    7.1,
    4.5,
    -5.6,
    3.05,
    -8.01,
  );
  face(
    studio,
    labelTexture(["01—05"], {
      width: 512,
      height: 256,
      size: 115,
      bg: "#eeede3",
      color: "#c45630",
    }),
    2.4,
    1.2,
    3.4,
    4.45,
    -8.01,
  );
  for (let i = 0; i < 3; i++) {
    cylinder(
      studio,
      0.075,
      0.075,
      0.4,
      dark,
      -8 + i * 4,
      5.38,
      -7.7,
    ).rotation.x = Math.PI / 4;
  }
  // Monument, inset into three low offset terraces.
  const monument = group(studio, -0.3, 0, -0.8, "about");
  box(monument, 7, 0.2, 4.4, stone, 0, 0.1, 0, 0.12);
  box(monument, 6.5, 0.23, 4, chalk, 0, 0.3, -0.2, 0.1);
  box(monument, 6, 0.22, 3.55, chalk, 0, 0.52, -0.4, 0.08);
  const font = new FontLoader().parse(fontData);
  const textGeo = new TextGeometry("dm.", {
    font,
    size: 3.7,
    depth: 0.83,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.075,
    bevelSize: 0.055,
    bevelSegments: 3,
  });
  textGeo.computeBoundingBox();
  const bb = textGeo.boundingBox;
  textGeo.translate(-(bb.max.x + bb.min.x) / 2, 0, -0.42);
  const monogram = new THREE.Mesh(textGeo, orange);
  monogram.position.set(0, 0.65, -0.6);
  monogram.castShadow = true;
  monogram.receiveShadow = true;
  monument.add(monogram);
  plaque(
    monument,
    "DEBAJYOTI MAITY",
    "FRONTEND CRAFT / FULL-STACK THINKING",
    -0.3,
    0.34,
    2.04,
    3.5,
    0.43,
  );
  const ball = sphere(monument, 0.45, metal, 2.7, 0.95, 1.3);
  animations.push((t) => {
    ball.rotation.y = t * 0.1;
  });
  // Health: a laptop, oversized handset, tactile goal bars and physical dial.
  const personalZone = group(studio, -7.1, 0, 3.45, "personal");
  box(personalZone, 10.1, 0.065, 6.1, mint, 0, 0.04, 0, 0.2);
  plaque(
    personalZone,
    "01 / PERSONAL PROJECTS",
    "INDEPENDENT IDEAS. WORKING APPLICATIONS.",
    0,
    0.11,
    3.06,
    5.1,
    0.38,
    "#d6e2c2",
  );
  const health = group(studio, -9.2, 0.08, 3.1, "health");
  health.scale.setScalar(0.76);
  health.rotation.y = 0.12;
  cylinder(health, 3.05, 3.05, 0.3, mint, 0, 0.17, 0);
  cylinder(health, 2.95, 2.95, 0.08, sage, 0, 0.36, 0);
  box(health, 4.1, 0.3, 2.35, chalk, 0, 1.5, 0.1, 0.14);
  box(health, 0.3, 1.2, 1.6, sage, -1.5, 0.78, 0.1);
  box(health, 0.3, 1.2, 1.6, sage, 1.5, 0.78, 0.1);
  const laptop = group(health, 0.05, 1.69, 0.4);
  laptop.rotation.y = -0.08;
  box(laptop, 2.8, 0.09, 1.8, metal, 0, 0.05, 0, 0.08);
  const lid = group(laptop, 0, 0.1, -0.79);
  lid.rotation.x = -0.13;
  box(lid, 2.8, 1.77, 0.1, dark, 0, 0.88, 0, 0.08);
  face(lid, healthTexture(), 2.65, 1.64, 0, 0.88, 0.057);
  keyboard(laptop, 0, 0.12, -0.02, 2.45, metal).scale.set(0.9, 1, 0.7);
  box(laptop, 0.8, 0.01, 0.41, stone, 0, 0.102, 0.51, 0.03);
  const phone = group(health, -1.75, 0.43, -1.7);
  phone.rotation.set(-0.12, -0.16, -0.08);
  box(phone, 1.72, 3.4, 0.18, dark, 0, 1.7, 0, 0.16);
  face(phone, healthTexture(true), 1.53, 3.08, 0, 1.7, 0.102);
  box(phone, 0.47, 0.055, 0.02, dark, 0, 3.13, 0.12, 0.02);
  [1.3, 1.9, 2.5, 3.2].forEach((h, i) => {
    box(
      health,
      0.36,
      h,
      0.47,
      i === 3 ? green : sage,
      1.2 + i * 0.46,
      h / 2 + 0.42,
      -1.7,
      0.07,
    );
  });
  const dial = group(health, 2.2, 0.5, 1.35);
  dial.rotation.z = -0.2;
  cylinder(dial, 0.58, 0.58, 0.1, chalk, 0, 0.1, 0).rotation.x = Math.PI / 2;
  const dialRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.41, 0.055, 10, 48, Math.PI * 1.6),
    green,
  );
  dialRing.position.set(0, 0.1, 0.08);
  dial.add(dialRing);
  plaque(
    health,
    "01 / HEALTH PLANNER",
    "SMALL STEPS. BETTER DAYS.",
    0,
    0.22,
    3.06,
    2.7,
    0.42,
    "#d6e2c2",
  );
  plant(health, -2.3, 0.43, 0.8, 0.52);
  // Angular: exploded physical interface layers hovering above a cobalt desk.
  const angular = group(studio, -4.5, 0.08, 3.55, "angular");
  angular.scale.setScalar(0.7);
  angular.rotation.y = -0.18;
  box(angular, 6.1, 0.25, 5.7, blue, 0, 0.14, 0, 0.2);
  box(angular, 4.6, 0.2, 2.8, chalk, 0, 1.15, 0.2, 0.12);
  cylinder(angular, 0.11, 0.11, 1.1, metal, -1.8, 0.55, -0.6);
  cylinder(angular, 0.11, 0.11, 1.1, metal, 1.8, 0.55, -0.6);
  cylinder(angular, 0.11, 0.11, 1.1, metal, -1.8, 0.55, 1);
  cylinder(angular, 0.11, 0.11, 1.1, metal, 1.8, 0.55, 1);
  const layers = [];
  for (let i = 2; i >= 0; i--) {
    const layer = group(angular, i * 0.37, 1.37 + i * 0.32, -0.45 - i * 0.63);
    box(layer, 3.7, 2.38, 0.1, i === 0 ? blue : glassBlue, 0, 1.2, 0, 0.08);
    face(layer, angularTexture(i), 3.5, 2.18, 0, 1.2, 0.06);
    layers.push({
      g: layer,
      x: layer.position.x,
      y: layer.position.y,
      z: layer.position.z,
      i,
    });
  }
  keyboard(angular, -0.1, 1.3, 1.2);
  sphere(angular, 0.15, orange, 1.65, 1.37, 1.1);
  // A small three-dimensional asterisk, assembled from crossing rods.
  const star = group(angular, -2.4, 2.25, 1.7);
  for (let i = 0; i < 3; i++) {
    const arm = box(star, 1.25, 0.25, 0.25, orange, 0, 0, 0, 0.07);
    arm.rotation.z = (i * Math.PI) / 3;
  }
  animations.push((t) => {
    star.rotation.z = t * 0.12;
    star.rotation.y = Math.sin(t * 0.2) * 0.2;
  });
  plaque(
    angular,
    "02 / ANGULAR LAB",
    "TAKE IT APART. MAKE IT WORK.",
    0,
    0.17,
    2.86,
    2.7,
    0.4,
    "#3659cb",
    "#f3f1e7",
  );
  cable(
    angular,
    [
      [0, 1.2, -0.6],
      [0, 0.3, -1.6],
      [1, 0.3, -2.1],
      [2.2, 0.3, -1.4],
    ],
    orange,
    0.04,
  );
  // Public-sector systems: glass towers reveal the layers inside.
  const systems = group(studio, 8.4, 0, -5.2, "healthcare");
  systems.scale.setScalar(0.8);
  box(systems, 7, 0.25, 4.6, stone, 0, 0.13, 0, 0.15);
  const towerHeights = [2.45, 3.65, 4.5];
  towerHeights.forEach((h, i) => {
    const x = -1.9 + i * 1.8;
    box(systems, 1.42, h, 1.6, glass, x, h / 2 + 0.27, -0.4, 0.06);
    for (let level = 0; level < Math.floor(h / 0.55); level++) {
      box(
        systems,
        1.12,
        0.1,
        1.28,
        i === 2 ? sage : chalk,
        x,
        0.57 + level * 0.5,
        -0.4,
        0.035,
      );
      box(
        systems,
        0.59,
        0.035,
        0.016,
        lightMaterial,
        x,
        0.63 + level * 0.5,
        0.255,
        0.005,
      );
    }
    for (const sx of [-0.7, 0.7])
      for (const sz of [-0.78, 0.78])
        box(
          systems,
          0.026,
          h,
          0.026,
          metal,
          x + sx,
          h / 2 + 0.27,
          -0.4 + sz,
          0,
        );
    box(systems, 1.46, 0.08, 1.64, metal, x, h + 0.3, -0.4, 0.03);
    plaque(
      systems,
      ["DATA", "LOGIC", "INTERFACE"][i],
      "",
      x,
      0.4,
      0.425,
      1.05,
      0.26,
      "#c8cbb9",
      "#244443",
    );
  });
  const dashboard = monitor(
    systems,
    systemsTexture(),
    -0.8,
    0.32,
    1.45,
    3.1,
    1.94,
  );
  dashboard.rotation.x = -0.08;
  cable(
    systems,
    [
      [-2.5, 0.31, 1.4],
      [-2.8, 0.31, 0.1],
      [-1.9, 0.31, -1.6],
      [1.7, 0.31, -1.6],
      [2.6, 0.31, 1.6],
    ],
    orange,
    0.04,
  );
  plaque(
    systems,
    "PUBLIC HEALTH",
    "COMPLEXITY, GIVEN STRUCTURE.",
    0,
    0.14,
    2.31,
    3,
    0.4,
    "#c8cbb9",
  );
  const workZone = group(studio, 9.05, 0, -1.7, "professional");
  box(workZone, 7.4, 0.06, 12.15, stone, 0, 0.035, 0, 0.18);
  plaque(
    workZone,
    "02 / PROFESSIONAL WORK",
    "PUBLIC HEALTH / ENTERPRISE / WEB + MOBILE",
    0,
    0.1,
    6.09,
    5.5,
    0.38,
    "#c8cbb9",
  );
  const purple = material("purple", "#806b9f", 0.55);
  const enterprise = group(studio, 7.8, 0.08, -0.15, "enterprise");
  box(enterprise, 4.8, 0.16, 2.7, chalk, 0, 1.05, 0, 0.12);
  box(enterprise, 0.16, 1, 2.1, purple, -1.85, 0.5, 0, 0.04);
  box(enterprise, 0.16, 1, 2.1, purple, 1.85, 0.5, 0, 0.04);
  monitor(enterprise, enterpriseTexture(), 0, 1.14, -0.5, 3.5, 2.18);
  keyboard(enterprise, -0.25, 1.18, 0.8, 2.45, chalk);
  sphere(enterprise, 0.13, purple, 1.48, 1.22, 0.8);
  plaque(
    enterprise,
    "ENTERPRISE & REPORTING",
    "DASHBOARDS / APIS / REAL-TIME",
    0,
    0.82,
    1.36,
    3.1,
    0.35,
  );
  const mobileWork = group(studio, 10.25, 0.08, 3, "mobile");
  mobileWork.scale.setScalar(0.8);
  mobileWork.rotation.y = -0.12;
  box(mobileWork, 4.4, 0.25, 3.2, orange, 0, 0.15, 0, 0.2);
  const mobilePhone = group(mobileWork, 1, 0.29, -0.38);
  mobilePhone.rotation.z = -0.1;
  box(mobilePhone, 1.52, 2.95, 0.17, dark, 0, 1.5, 0, 0.15);
  face(mobilePhone, mobileTexture(true), 1.36, 2.7, 0, 1.5, 0.093);
  box(mobilePhone, 0.37, 0.045, 0.02, dark, 0, 2.8, 0.11, 0.02);
  const tablet = monitor(
    mobileWork,
    mobileTexture(false),
    -0.88,
    0.3,
    0.35,
    2.05,
    1.28,
  );
  tablet.rotation.y = 0.18;
  plaque(
    mobileWork,
    "WEB + MOBILE",
    "ANGULAR / IONIC / CONNECTED APIS",
    0,
    0.16,
    1.61,
    3.2,
    0.38,
    "#ee6029",
  );

  const cabinet = group(studio, 2.2, 0, -5.45, "skills");
  box(cabinet, 4.8, 0.18, 2.7, dark, 0, 0.1, 0, 0.1);
  box(cabinet, 4.55, 4.5, 2.15, chalk, 0, 2.4, 0, 0.13);
  const skillDrawers = [];
  [
    ["frontend", blue, "FRONTEND", "ANGULAR / REACT / IONIC", 3.58],
    ["backend", orange, "BACKEND", "JAVA / PYTHON / CONNECTED APIS", 2.21],
    ["practice", mint, "CRAFT", "TESTING / PERFORMANCE / LEADERSHIP", 0.84],
  ].forEach(([id, mat, title, sub, y]) => {
    const drawer = group(cabinet, 0, y, 0.28, "skill:" + id);
    drawer.userData.slide = true;
    box(drawer, 4.25, 1.13, 1.95, mat, 0, 0, 0, 0.07);
    face(
      drawer,
      labelTexture([title], {
        width: 1024,
        height: 330,
        size: 115,
        sub,
        bg:
          id === "frontend"
            ? "#3659cb"
            : id === "backend"
              ? "#ee6029"
              : "#d6e2c2",
        color: id === "frontend" ? "#f4f1e7" : "#29392f",
      }),
      3.72,
      0.93,
      0,
      0,
      0.985,
    );
    box(drawer, 0.75, 0.06, 0.09, metal, 1.2, -0.32, 1.04, 0.025);
    register(drawer, "skill:" + id, [0, 0.1, 1.03]);
    skillDrawers.push(drawer);
  });
  plaque(
    cabinet,
    "04 / SKILLS",
    "THE TOOLS. THE THINKING.",
    0,
    4.4,
    1.085,
    3.8,
    0.36,
  );
  for (let i = 0; i < 3; i++) {
    const block = box(
      cabinet,
      0.45,
      0.5,
      0.45,
      [blue, orange, sage][i],
      -1 + i * 0.75,
      4.9,
      0,
      0.08,
    );
    block.rotation.y = i * 0.3;
  }
  // Career: four climbable-looking volumes, each carrying a real role.
  const journey = group(studio, -6.4, 0, -5.7, "experience");
  const career = [
    ["TCS", "2021—2022", 0.8],
    ["OTOBIT", "2023—2024", 1.45],
    ["RHYTHMFLOWS", "2024—2025", 2.1],
    ["VJL", "2025—NOW", 2.75],
  ];
  career.forEach(([name, years, h], i) => {
    const x = -3.2 + i * 2.05;
    const step = group(
      journey,
      0,
      0,
      0,
      "role:" + ["tcs", "otobit", "rhythmflows", "vjl"][i],
    );
    register(step, step.userData.item, [x, h - 0.35, 1.3]);
    box(step, 1.95, h, 2.55, i === 3 ? orange : chalk, x, h / 2, 0, 0.055);
    face(
      step,
      labelTexture([name], {
        width: 768,
        height: 256,
        size: 74,
        sub: years,
        bg: i === 3 ? "#ee6029" : "#eeede3",
        color: "#303b31",
      }),
      1.65,
      0.58,
      x,
      h - 0.39,
      1.285,
    );
    box(step, 1.97, 0.035, 2.57, i === 3 ? gold : sage, x, h + 0.02, 0, 0.01);
    for (let j = 0; j < 2; j++)
      box(
        step,
        0.48,
        0.18,
        0.55,
        i === 3 ? chalk : stone,
        x + (j - 0.5) * 0.57,
        h + 0.12,
        -0.5,
        0.03,
      );
  });
  cable(
    journey,
    [
      [-4.1, 0.04, 1.65],
      [-3.1, 0.86, 1.65],
      [-1.1, 1.51, 1.65],
      [1, 2.17, 1.65],
      [3.2, 2.81, 1.65],
    ],
    gold,
    0.028,
  );
  plaque(
    journey,
    "03 / EXPERIENCE",
    "4.5+ YEARS OF BUILDING",
    -0.2,
    0.15,
    2,
    3,
    0.35,
  );
  // Contact desk: a warm pool of light, a blank page, and an invitation.
  const contact = group(studio, 6.2, 0, 6.65, "contact");
  contact.rotation.y = -0.12;
  box(contact, 5.8, 0.16, 2.7, chalk, 0, 1.2, 0, 0.17);
  box(contact, 0.2, 1.12, 2.1, orange, -2.2, 0.57, 0, 0.07);
  box(contact, 0.2, 1.12, 2.1, orange, 2.2, 0.57, 0, 0.07);
  const paper = box(contact, 2.15, 0.03, 1.4, chalk, -0.4, 1.3, 0, 0.01);
  paper.rotation.y = 0.16;
  const hello = face(
    contact,
    labelTexture(["HELLO,", "WHAT IF?"], {
      width: 1024,
      height: 650,
      size: 160,
      sub: "LET’S BUILD SOMETHING TOGETHER.",
      bg: "#f4f1e5",
      color: "#254333",
    }),
    2.05,
    1.3,
    -0.4,
    1.323,
    0,
  );
  hello.rotation.x = -Math.PI / 2;
  hello.rotation.z = -0.16;
  const envelope = group(contact, 0.75, 1.34, 0.4);
  envelope.rotation.y = -0.3;
  box(envelope, 1.16, 0.025, 0.75, orange);
  cable(
    envelope,
    [
      [-0.57, 0.03, -0.36],
      [0, 0.04, 0.12],
      [0.57, 0.03, -0.36],
    ],
    chalk,
    0.009,
  );
  cylinder(contact, 0.43, 0.43, 0.08, dark, -1.8, 1.32, -0.65);
  cylinder(contact, 0.045, 0.045, 1.7, gold, -1.8, 2.18, -0.65);
  const shade = cylinder(contact, 0.12, 0.65, 0.64, orange, -1.8, 3.15, -0.65);
  register(shade, "light", [0, 0, 0]);
  shade.rotation.z = 0.1;
  cylinder(contact, 0.54, 0.54, 0.025, lightMaterial, -1.8, 2.84, -0.65);
  const cup = cylinder(contact, 0.19, 0.16, 0.4, chalk, 1.7, 1.49, 0.3);
  cylinder(contact, 0.153, 0.153, 0.01, dark, 1.7, 1.695, 0.3);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.035, 8, 24),
    chalk,
  );
  handle.position.set(1.91, 1.52, 0.3);
  contact.add(handle);
  const resumeBook = group(contact, 0.8, 1.34, -0.75, "resume");
  box(resumeBook, 1.3, 0.11, 0.9, blue, 0, 0, 0, 0.025);
  box(resumeBook, 1.25, 0.05, 0.86, chalk, 0, 0.08, 0, 0.015);
  const resumeLabel = face(
    resumeBook,
    labelTexture(["RÉSUMÉ"], {
      width: 768,
      height: 512,
      size: 110,
      bg: "#eeede3",
      color: "#3659cb",
      sub: "DEBAJYOTI MAITY",
    }),
    1.18,
    0.78,
    0,
    0.109,
    0,
  );
  resumeLabel.rotation.x = -Math.PI / 2;
  plaque(
    contact,
    "05 / SAY HELLO",
    "THE NEXT CHAPTER IS OPEN.",
    0,
    0.65,
    1.16,
    2.3,
    0.4,
  );
  plant(studio, 11.3, 0, 6.6, 1.2);
  plant(studio, -11.5, 0, 6, 1.1);
  plant(studio, -0.8, 0, -7, 0.75);
  // Freestanding slim lamp and low bench complete the inhabitable scale.
  box(studio, 3, 0.22, 1.1, orange, -4.1, 0.6, 6.9, 0.12);
  cylinder(studio, 0.055, 0.055, 0.55, dark, -5.15, 0.28, 6.9);
  cylinder(studio, 0.055, 0.055, 0.55, dark, -3.05, 0.28, 6.9);
  cylinder(studio, 0.35, 0.35, 0.08, dark, 11.2, 0.06, 3.5);
  cylinder(studio, 0.04, 0.04, 3.9, metal, 11.2, 2, 3.5);
  sphere(studio, 0.32, lightMaterial, 11.2, 4, 3.5);
  // Building edge text remains physical in every camera view.
  plaque(
    studio,
    "THE MAITY STUDIO",
    "A WORLD OF WORK / EST. 2021",
    0,
    -0.16,
    9.025,
    5,
    0.35,
  );

  register(monument, "about", [0, 2.7, 0]);
  register(health, "health", [0, 2.65, -0.5]);
  register(angular, "angular", [0, 2.6, -0.4]);
  register(systems, "healthcare", [-0.8, 1.8, 1.5]);
  register(enterprise, "enterprise", [0, 2.7, -0.38]);
  register(mobileWork, "mobile", [1, 1.8, -0.27]);
  register(contact, "contact", [0.7, 1.4, 0.4]);
  register(resumeBook, "resume", [0, 0.12, 0]);
  return connectStudio({
    container,
    renderer,
    scene,
    camera,
    controls,
    ground,
    hemi,
    sun,
    fill,
    warmLights,
    lightMaterial,
    layers,
    animations,
    itemRoots,
    itemAnchors,
    images: exhibitImages,
    reducedMotion,
    onSelect,
    onHover,
    onOrbit,
    onReady,
    onFailure,
    restoreEnvironment() {
      const room = new RoomEnvironment(),
        generator = new THREE.PMREMGenerator(renderer);
      envTarget.dispose();
      envTarget = generator.fromScene(room, 0.04, 0.1, 100);
      scene.environment = envTarget.texture;
      room.dispose();
      generator.dispose();
    },
    disposeEnvironment() {
      envTarget.dispose();
    },
  });
}
