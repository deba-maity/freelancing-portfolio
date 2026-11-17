import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import monogramFont from "./monogram-font.json";

const TAU = Math.PI * 2;

function makeRenderer(
  container,
  { fov = 35, distance = 8, environmentSize = 128 } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 1.75),
  );
  renderer.setClearColor(0x111210, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 60);
  camera.position.set(0, 0.25, distance);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, 0.06, 0.1, 100, {
    size: environmentSize,
  });
  scene.environment = environmentTarget.texture;
  environment.dispose();
  pmrem.dispose();
  const state = {
    container,
    renderer,
    scene,
    camera,
    visible: false,
    dirty: true,
    disposed: false,
    suspended: false,
    renderCount: 0,
  };
  state.invalidate = () => {
    state.dirty = true;
    state.onRequestFrame?.();
  };
  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    state.invalidate();
  });
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      state.visible = entries[0].isIntersecting;
      state.invalidate();
    },
    { rootMargin: "100px" },
  );
  visibilityObserver.observe(container);
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    state.visible = false;
    container.classList.remove("webgl-ready");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    state.visible = true;
    state.invalidate();
  });
  state.dispose = () => {
    state.disposed = true;
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      }
    });
    environmentTarget.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  return state;
}

function addLight(scene, color, intensity, position) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(...position);
  scene.add(light);
  return light;
}

function makeShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,.65)");
  gradient.addColorStop(0.4, "rgba(0,0,0,.25)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createHero(container) {
  const state = makeRenderer(container, { distance: 8.4 });
  const { scene, camera, renderer } = state;
  addLight(scene, 0xffefcf, 2.5, [3, 5, 4]);
  addLight(scene, 0xcbd6ff, 1.8, [-4, 2, 3]);
  addLight(scene, 0xff622b, 4, [1, -1, -3]);
  const assembly = new THREE.Group();
  assembly.rotation.set(0.22, 0.1, -0.28);
  assembly.position.y = 0.05;
  scene.add(assembly);
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xd5d6c9,
    metalness: 1,
    roughness: 0.19,
    clearcoat: 1,
    clearcoatRoughness: 0.13,
    envMapIntensity: 1.6,
  });
  const orange = new THREE.MeshPhysicalMaterial({
    color: 0xff541e,
    metalness: 0.32,
    roughness: 0.29,
    clearcoat: 1,
    envMapIntensity: 1.1,
  });
  const dark = new THREE.MeshPhysicalMaterial({
    color: 0x373a31,
    metalness: 0.95,
    roughness: 0.3,
    clearcoat: 1,
  });
  const rings = [],
    solidParts = [],
    wireParts = [],
    rayTargets = [];
  let inLab = false,
    explosion = 0,
    explosionTarget = 0,
    selectedLayer = 0,
    blueprint = false;
  const ringData = [
    {
      radius: 1.71,
      tube: 0.19,
      rotation: [1.03, 0.14, -0.2],
      material: chrome,
    },
    { radius: 1.3, tube: 0.28, rotation: [0.25, 0.95, 0.2], material: orange },
    {
      radius: 1.97,
      tube: 0.09,
      rotation: [0.38, 0.65, 0.85],
      material: chrome,
    },
  ];
  ringData.forEach((data, index) => {
    const group = new THREE.Group();
    group.rotation.set(...data.rotation);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(data.radius, data.tube, 24, 128),
      data.material,
    );
    group.add(ring);
    ring.userData.layer = index;
    rayTargets.push(ring);
    if (index === 0) {
      const groove = new THREE.Mesh(
        new THREE.TorusGeometry(data.radius, 0.035, 12, 160),
        dark,
      );
      groove.position.z = data.tube * 0.97;
      group.add(groove);
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * TAU;
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, 0.095, 0.024),
          dark,
        );
        marker.position.set(
          Math.cos(angle) * data.radius,
          Math.sin(angle) * data.radius,
          data.tube,
        );
        marker.rotation.z = angle - Math.PI / 2;
        group.add(marker);
      }
    }
    if (index === 2) {
      [0, Math.PI].forEach((angle) => {
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 24, 16),
          dark,
        );
        bead.position.set(
          Math.cos(angle) * data.radius,
          Math.sin(angle) * data.radius,
          0,
        );
        group.add(bead);
      });
    }
    solidParts.push(...group.children);
    const wireGeometry = new THREE.WireframeGeometry(
      new THREE.TorusGeometry(data.radius, data.tube, 8, 48),
    );
    const wire = new THREE.LineSegments(
      wireGeometry,
      new THREE.LineBasicMaterial({
        color: 0x80b8db,
        transparent: true,
        opacity: 0.65,
      }),
    );
    wire.visible = false;
    group.add(wire);
    wireParts.push(wire);
    assembly.add(group);
    rings.push(group);
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.67, 4), orange);
  assembly.add(core);
  solidParts.push(core);
  const font = new FontLoader().parse(monogramFont);
  const monogramGeometry = new TextGeometry("dm.", {
    font,
    size: 0.26,
    depth: 0.035,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  monogramGeometry.center();
  const monogram = new THREE.Mesh(monogramGeometry, dark);
  monogram.position.set(0, -0.02, 0.66);
  core.add(monogram);
  const wireCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.67, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff9869,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    }),
  );
  wireCore.visible = false;
  assembly.add(wireCore);
  wireParts.push(wireCore);
  const coreBelt = new THREE.Mesh(
    new THREE.TorusGeometry(0.679, 0.018, 12, 100),
    dark,
  );
  coreBelt.rotation.x = 0.6;
  core.add(coreBelt);
  const innerOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.016, 8, 100),
    chrome,
  );
  innerOrbit.rotation.set(1.3, 0.3, 0.4);
  assembly.add(innerOrbit);
  const satellite = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.15, 0),
    chrome,
  );
  satellite.position.set(2.2, 0.9, 0.5);
  scene.add(satellite);
  const littleSatellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    orange,
  );
  littleSatellite.position.set(-1.65, -1.5, 0.6);
  scene.add(littleSatellite);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 4),
    new THREE.MeshBasicMaterial({
      map: makeShadow(),
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -2.3, 0);
  scene.add(shadow);
  const grid = new THREE.PolarGridHelper(2.65, 12, 4, 100, 0x34372a, 0x2c2f24);
  grid.position.y = -2.3;
  grid.material.transparent = true;
  grid.material.opacity = 0.48;
  scene.add(grid);
  const pointPositions = new Float32Array(48 * 3);
  for (let i = 0; i < 48; i++) {
    const angle = i * 2.39996;
    const radius = 2.45 + (i % 5) * 0.21;
    pointPositions.set(
      [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.8,
        -1.5 - (i % 4) * 0.3,
      ],
      i * 3,
    );
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(pointPositions, 3),
  );
  const points = new THREE.Points(
    pointsGeometry,
    new THREE.PointsMaterial({
      color: 0x7c8666,
      size: 0.013,
      transparent: true,
      opacity: 0.55,
    }),
  );
  scene.add(points);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.rotateSpeed = 0.55;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI - 0.35;
  controls.target.set(0, 0, 0);
  controls.update();
  controls.saveState();
  renderer.domElement.style.touchAction = "pan-y";
  controls.addEventListener("change", () => state.invalidate());
  let pointerX = 0,
    pointerY = 0,
    downPosition = null;
  const raycaster = new THREE.Raycaster();
  const projected = new THREE.Vector3();
  container.addEventListener("pointerdown", (event) => {
    downPosition = { x: event.clientX, y: event.clientY };
  });
  container.addEventListener("pointerup", (event) => {
    if (
      !inLab ||
      !downPosition ||
      Math.hypot(
        event.clientX - downPosition.x,
        event.clientY - downPosition.y,
      ) > 6
    )
      return;
    const bounds = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
      ),
      camera,
    );
    const hits = raycaster.intersectObjects(rayTargets);
    if (hits.length) state.onLayer?.(hits[0].object.userData.layer);
    downPosition = null;
  });
  container.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = container.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
  });
  container.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });
  container.addEventListener("keydown", (event) => {
    const directions = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowDown: 1,
    };
    if (!(event.key in directions)) return;
    event.preventDefault();
    const spherical = new THREE.Spherical().setFromVector3(camera.position);
    if (event.key === "ArrowLeft" || event.key === "ArrowRight")
      spherical.theta += directions[event.key] * 0.12;
    else
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi + directions[event.key] * 0.12,
        0.35,
        Math.PI - 0.35,
      );
    camera.position.setFromSpherical(spherical);
    controls.update();
    state.invalidate();
  });
  state.update = (time, paused, delta) => {
    controls.enableDamping = !paused;
    controls.update();
    if (Math.abs(explosion - explosionTarget) > 0.001) {
      explosion = paused
        ? explosionTarget
        : THREE.MathUtils.lerp(
            explosion,
            explosionTarget,
            1 - Math.exp(-delta * 8),
          );
      state.dirty = true;
    } else explosion = explosionTarget;
    const scale = THREE.MathUtils.lerp(1, 0.83, explosion);
    assembly.scale.setScalar(scale);
    if (!paused) {
      assembly.rotation.y =
        (0.1 + Math.sin(time * 0.18) * 0.25 + pointerX * 0.15) *
        (1 - explosion);
      assembly.rotation.x =
        (0.22 + Math.sin(time * 0.13) * 0.1 + pointerY * 0.08) *
        (1 - explosion);
      assembly.position.y =
        0.05 + Math.sin(time * 0.65) * 0.09 * (1 - explosion);
      core.rotation.y = Math.sin(time * 0.22) * 0.25;
      wireCore.rotation.copy(core.rotation);
      satellite.position.y = 0.9 + Math.sin(time * 0.7) * 0.2;
      satellite.rotation.set(time * 0.18, time * 0.25, 0);
      littleSatellite.position.y = -1.5 + Math.cos(time * 0.8) * 0.12;
      points.rotation.z = time * 0.008;
    }
    assembly.rotation.z = THREE.MathUtils.lerp(-0.28, 0, explosion);
    rings.forEach((ring, index) => {
      const data = ringData[index];
      const auto = time;
      ring.rotation.x = THREE.MathUtils.lerp(
        data.rotation[0] + (index === 0 ? Math.sin(auto * 0.25) * 0.16 : 0),
        1.23,
        explosion,
      );
      ring.rotation.y = THREE.MathUtils.lerp(
        index === 2
          ? 0.65 + Math.sin(auto * 0.22) * 0.3
          : data.rotation[1] + (index === 1 ? Math.sin(auto * 0.2) * 0.3 : 0),
        0,
        explosion,
      );
      ring.rotation.z = THREE.MathUtils.lerp(
        index === 0
          ? -0.2 + auto * 0.055
          : index === 1
            ? 0.2 - auto * 0.085
            : data.rotation[2],
        0,
        explosion,
      );
      ring.position.y = [1.93, 0, -1.93][index] * explosion;
      ring.scale.setScalar(
        inLab && explosion > 0.2 && selectedLayer === index ? 1.035 : 1,
      );
    });
    if (inLab) {
      assembly.updateMatrixWorld(true);
      const { width, height } = container.getBoundingClientRect();
      const positions = rings.map((ring, index) => {
        projected
          .set(ringData[index].radius * 0.8, 0.15, 0.1)
          .applyMatrix4(ring.matrixWorld)
          .project(camera);
        return {
          x: THREE.MathUtils.clamp(
            (projected.x * 0.5 + 0.5) * width,
            8,
            width - 130,
          ),
          y: THREE.MathUtils.clamp(
            (-projected.y * 0.5 + 0.5) * height,
            65,
            height - 75,
          ),
        };
      });
      state.onProject?.(positions);
    }
  };
  state.reset = () => {
    if (inLab) {
      camera.position.set(0, 0.5, 9.6);
      controls.target.set(0, 0, 0);
      controls.update();
    } else controls.reset();
    pointerX = 0;
    pointerY = 0;
    state.invalidate();
  };
  state.setLab = (value) => {
    inLab = value;
    explosionTarget = 0;
    explosion = 0;
    state.reset();
    satellite.visible = !value;
    littleSatellite.visible = !value;
    renderer.domElement.style.touchAction = value ? "none" : "pan-y";
    state.visible = true;
    state.invalidate();
  };
  state.setExploded = (value) => {
    explosionTarget = value ? 1 : 0;
    state.invalidate();
  };
  state.selectLayer = (index) => {
    selectedLayer = index;
    wireParts
      .slice(0, 3)
      .forEach((wire, i) =>
        wire.material.color.setHex(i === index ? 0xffad7c : 0x80b8db),
      );
    state.invalidate();
  };
  state.setBlueprint = (value) => {
    blueprint = value;
    solidParts.forEach((part) => (part.visible = !value));
    wireParts.forEach((part) => (part.visible = value));
    innerOrbit.material.color.setHex(value ? 0x80b8db : 0xd5d6c9);
    innerOrbit.material.metalness = value ? 0 : 1;
    grid.material.color.setHex(value ? 0x506a85 : 0xffffff);
    grid.material.opacity = value ? 0.6 : 0.48;
    state.invalidate();
  };
  const dispose = state.dispose;
  state.dispose = () => {
    controls.dispose();
    dispose();
  };
  return state;
}

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  context.fillStyle = "#161b12";
  context.strokeStyle = "#697653";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(2, 2, 252, 76, 12);
  context.fill();
  context.stroke();
  context.font = "500 24px Arial";
  context.fillStyle = "#d4dfbe";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 42);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    }),
  );
  sprite.scale.set(1.25, 0.39, 1);
  return sprite;
}

function createSkills(container) {
  const state = makeRenderer(container, {
    fov: 40,
    distance: 5.8,
    environmentSize: 64,
  });
  const { scene } = state;
  addLight(scene, 0xdce7bc, 3, [2, 3, 4]);
  addLight(scene, 0xff7a43, 2, [-3, 0, 2]);
  const network = new THREE.Group();
  scene.add(network);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xa4b77d,
    metalness: 0.8,
    roughness: 0.28,
    envMapIntensity: 1.5,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), material);
  network.add(core);
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.76, 0),
    new THREE.MeshBasicMaterial({
      color: 0x7d925a,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    }),
  );
  network.add(shell);
  const satellites = [];
  const locations = [
    [-1.55, 0.8, 0.4],
    [1.52, 0.9, -0.2],
    [1.6, -0.7, 0.6],
    [-1.55, -0.85, -0.2],
    [0, 1.4, -0.5],
    [0, -1.35, 0.45],
  ];
  locations.forEach((position, index) => {
    const node = new THREE.Group();
    node.position.set(...position);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xc4d39e }),
    );
    node.add(sphere);
    const label = makeLabel(
      ["Angular", "React", "TypeScript", "Ionic", "HTML / CSS", "Tailwind"][
        index
      ],
    );
    label.position.y = 0.22;
    node.add(label);
    network.add(node);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(...position),
    ]);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x5b6b43,
        transparent: true,
        opacity: 0.65,
      }),
    );
    network.add(line);
    satellites.push({ node, label, line });
  });
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.006, 6, 120),
    new THREE.MeshBasicMaterial({
      color: 0x53613e,
      transparent: true,
      opacity: 0.45,
    }),
  );
  orbit.rotation.x = 1.05;
  orbit.rotation.y = 0.2;
  network.add(orbit);
  state.update = (time, paused) => {
    if (paused) return;
    core.rotation.set(time * 0.16, time * 0.22, time * 0.07);
    shell.rotation.set(-time * 0.08, time * 0.1, 0);
    network.rotation.y = Math.sin(time * 0.18) * 0.3;
    network.rotation.z = Math.sin(time * 0.13) * 0.045;
  };
  state.setCategory = (category) => {
    const names = {
      frontend: [
        "Angular",
        "React",
        "TypeScript",
        "Ionic",
        "HTML / CSS",
        "Tailwind",
      ],
      backend: [
        "Java / Python",
        "Node.js",
        "Spring Boot",
        "Django",
        "GraphQL",
        "Redis / WS",
      ],
      toolkit: [
        "Git",
        "Postman",
        "Jest",
        "System design",
        "Performance",
        "Leadership",
      ],
    }[category];
    const color = { frontend: 0xa4b77d, backend: 0xdd9673, toolkit: 0x9da7ce }[
      category
    ];
    material.color.setHex(color);
    satellites.forEach((satellite, index) => {
      satellite.node.remove(satellite.label);
      satellite.label.material.map.dispose();
      satellite.label.material.dispose();
      satellite.label = makeLabel(names[index]);
      satellite.label.position.y = 0.22;
      satellite.node.add(satellite.label);
    });
    state.invalidate();
  };
  return state;
}

export function createScenes({ hero, skills, paused = false }) {
  const states = [];
  let heroState,
    skillsState,
    currentCategory = "frontend",
    labMode = false,
    skillsInRange = false;
  try {
    heroState = createHero(hero);
    states.push(heroState);
  } catch (error) {
    console.warn("Hero WebGL unavailable", error);
  }
  let time = 0,
    previous = performance.now(),
    animationId = 0,
    disposed = false;
  const scheduleFrame = () => {
    if (!animationId && !disposed && !document.hidden)
      animationId = requestAnimationFrame(frame);
  };
  const frame = (now) => {
    animationId = 0;
    if (disposed) return;
    const delta = Math.min((now - previous) / 1000, 0.1);
    previous = now;
    if (!paused && !document.hidden) time += delta;
    if (!document.hidden) {
      states.forEach((state) => {
        if (!state.visible || state.disposed || state.suspended) return;
        state.update(time, paused, delta);
        if (!paused || state.dirty) {
          state.renderer.render(state.scene, state.camera);
          state.dirty = false;
          state.renderCount++;
          state.container.classList.add("webgl-ready");
        }
      });
    }
    if (
      states.some(
        (state) =>
          state.visible && !state.suspended && (!paused || state.dirty),
      )
    )
      scheduleFrame();
  };
  states.forEach((state) => (state.onRequestFrame = scheduleFrame));
  const ensureSkills = () => {
    if (skillsState || labMode || disposed) return;
    try {
      skillsState = createSkills(skills);
      skillsState.onRequestFrame = scheduleFrame;
      skillsState.setCategory(currentCategory);
      states.push(skillsState);
    } catch (error) {
      console.warn("Skills WebGL unavailable", error);
    }
    skillsObserver.disconnect();
  };
  const skillsObserver = new IntersectionObserver(
    (entries) => {
      skillsInRange = entries[0].isIntersecting;
      if (skillsInRange) ensureSkills();
    },
    { rootMargin: "300px" },
  );
  skillsObserver.observe(skills);
  const visibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    } else {
      previous = performance.now();
      states.forEach((state) => state.invalidate());
    }
  };
  document.addEventListener("visibilitychange", visibilityChange);
  scheduleFrame();
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(animationId);
    skillsObserver.disconnect();
    document.removeEventListener("visibilitychange", visibilityChange);
    states.forEach((state) => state.dispose());
  };
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) dispose();
  });
  return {
    available: Boolean(heroState),
    reset() {
      heroState?.reset();
    },
    setLab(value) {
      labMode = value;
      heroState?.setLab(value);
      if (!value && skillsInRange) ensureSkills();
      if (skillsState) {
        skillsState.suspended = value;
        skillsState.invalidate();
      }
    },
    setExploded(value) {
      heroState?.setExploded(value);
    },
    selectLayer(index) {
      heroState?.selectLayer(index);
    },
    setBlueprint(value) {
      heroState?.setBlueprint(value);
    },
    onProject(callback) {
      if (heroState) heroState.onProject = callback;
    },
    onLayer(callback) {
      if (heroState) heroState.onLayer = callback;
    },
    setPaused(value) {
      paused = value;
      states.forEach((state) => state.invalidate());
    },
    setCategory(category) {
      currentCategory = category;
      skillsState?.setCategory(category);
    },
    diagnostics() {
      return states.map((state) => ({
        visible: state.visible,
        suspended: state.suspended,
        renderCount: state.renderCount,
        triangles: state.renderer.info.render.triangles,
        calls: state.renderer.info.render.calls,
        geometries: state.renderer.info.memory.geometries,
        textures: state.renderer.info.memory.textures,
      }));
    },
    dispose,
  };
}
