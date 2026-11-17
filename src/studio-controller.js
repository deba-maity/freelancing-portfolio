import * as THREE from "three";
import { areas, itemMeta, areaIndex } from "./portfolio-data.js";

const V = (...v) => new THREE.Vector3(...v);
const clamp = THREE.MathUtils.clamp;
const smooth = (t) => t * t * (3 - 2 * t);
const viewPoints = [
  { p: [27, 25, 31], t: [-4, 0.4, 2.1], m: [43, 46, 54], mt: [0, 1, 0] },
  { p: [-1, 11, 18], t: [-9, 1.3, 4.4], m: [4, 16, 26], mt: [-6.7, 1.5, 3.3] },
  {
    p: [23, 14, 15],
    t: [5.2, 1.6, -0.6],
    m: [32, 24, 28],
    mt: [8.5, 1.7, -1.3],
  },
  {
    p: [-1.5, 10, 7],
    t: [-8.7, 1.4, -4.8],
    m: [4, 16, 15],
    mt: [-6.4, 1.8, -5.7],
  },
  { p: [12, 9, 5.5], t: [0.1, 2, -4.7], m: [14, 13, 15], mt: [2.2, 2, -5.4] },
  {
    p: [15, 8.2, 15],
    t: [3.3, 1.25, 7.3],
    m: [15, 12, 22],
    mt: [6.2, 1.5, 6.4],
  },
];
const overviewPins = [
  { id: "personal", p: [-7.3, 3.7, 3.3], offset: [-10, -40] },
  { id: "professional", p: [9, 4.5, -1.5], offset: [20, 0] },
  { id: "experience", p: [-6.6, 4.3, -5.8], offset: [-10, -8] },
  { id: "skills", p: [2.2, 5.25, -5.4], offset: [20, -15] },
  { id: "about", p: [-0.3, 4.8, -0.8], offset: [0, 12] },
  { id: "contact", p: [6.2, 3.3, 6.6], offset: [8, 15] },
];

export function connectStudio(o) {
  const {
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
    images,
    reducedMotion,
    onSelect,
    onHover,
    onOrbit,
    onReady,
    onFailure,
    restoreEnvironment,
    disposeEnvironment,
  } = o;
  const canvas = renderer.domElement,
    mobile = () => innerWidth <= 700;
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(),
    desired = V(),
    target = V(),
    tmp = V(),
    projected = V(),
    center = V(),
    size = V();
  const box = new THREE.Box3(),
    dayColor = new THREE.Color("#e9e9e2"),
    nightColor = new THREE.Color("#18251f"),
    dayGround = new THREE.Color("#c8cbb9"),
    nightGround = new THREE.Color("#233d32"),
    highlightColor = new THREE.Color("#bb6438");
  const rootStates = new Map();
  for (const [id, root] of itemRoots) {
    const replacements = new Map(),
      materials = [];
    root.traverse((mesh) => {
      if (!mesh.isMesh) return;
      let parent = mesh;
      while (parent && parent !== root) {
        if (parent.userData.item && parent.userData.item !== id) return;
        parent = parent.parent;
      }
      const replace = (m) => {
        if (!m.emissive || m.map || m.transparent) return m;
        if (!replacements.has(m)) {
          const clone = m.clone();
          replacements.set(m, clone);
          materials.push({
            material: clone,
            color: clone.emissive.clone(),
            intensity: clone.emissiveIntensity,
          });
        }
        return replacements.get(m);
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(replace)
        : replace(mesh.material);
    });
    rootStates.set(id, {
      root,
      base: root.position.clone(),
      mix: 0,
      materials,
      meta: itemMeta(id),
    });
  }
  let progress = 0,
    paused = reducedMotion,
    night = false,
    nightMix = 0,
    exploded = false,
    explosion = 0,
    orbiting = false,
    panelOpen = false,
    inspectionId = null,
    hovered = null,
    disposed = false,
    suspended = false,
    lost = false;
  let frame = 0,
    clock = 0,
    last = performance.now(),
    dirty = true,
    settle = 2,
    shadowTick = 0,
    pointerDown = null,
    hasDragged = false,
    lastPick = 0,
    currentPinArea = -1;
  let pins = [];
  const hotspotContainer = document.querySelector("#hotspots");
  function worldPoint(id, out = V()) {
    const anchor = itemAnchors.get(id);
    if (anchor) return anchor.object.localToWorld(out.copy(anchor.point));
    const root = itemRoots.get(id);
    if (root) return box.setFromObject(root).getCenter(out);
    const pin = overviewPins.find((p) => p.id === id);
    if (pin) return out.fromArray(pin.p);
    return out.set(0, 2, 0);
  }
  function refreshPins() {
    const section = Math.round(progress);
    if (section === currentPinArea) return;
    currentPinArea = section;
    const ids =
      section === 0 ? overviewPins.map((p) => p.id) : areas[section].items;
    hotspotContainer.innerHTML = "";
    pins = ids.map((id, i) => {
      const meta = itemMeta(id),
        el = document.createElement("button");
      el.className = "hotspot";
      el.dataset.open = id;
      el.setAttribute("aria-label", meta.action + ": " + meta.name);
      const number =
        section === 0
          ? id === "about"
            ? "00"
            : areas[areaIndex(meta.area)].number
          : String(i + 1).padStart(2, "0");
      const title =
        section === 0
          ? id === "about"
            ? "About me"
            : areas[areaIndex(meta.area)].label
          : meta.name;
      el.innerHTML =
        '<span class="hotspot-dot">' +
        number +
        '</span><span class="hotspot-label">' +
        title +
        ' <b aria-hidden="true">↗</b></span>';
      hotspotContainer.append(el);
      return {
        id,
        el,
        offset:
          section === 0
            ? overviewPins.find((p) => p.id === id).offset
            : [0, -22],
        width: clamp(title.length * 5.6 + 65, 120, 265),
      };
    });
  }
  function configureProjection() {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = mobile() ? 42 : 39;
    camera.clearViewOffset();
    if (panelOpen && !mobile()) {
      const panelWidth =
        document.querySelector("#portfolio-dialog")?.getBoundingClientRect()
          .width || Math.min(580, innerWidth * 0.44);
      camera.setViewOffset(
        innerWidth,
        innerHeight,
        panelWidth / 2,
        0,
        innerWidth,
        innerHeight,
      );
    } else if (mobile())
      camera.setViewOffset(
        innerWidth,
        innerHeight,
        0,
        innerHeight * 0.145,
        innerWidth,
        innerHeight,
      );
    camera.updateProjectionMatrix();
  }
  function updateView(immediate = false) {
    const a = Math.min(4, Math.floor(progress)),
      b = a + 1,
      f = smooth(progress - a);
    desired
      .fromArray(mobile() ? viewPoints[a].m : viewPoints[a].p)
      .lerp(tmp.fromArray(mobile() ? viewPoints[b].m : viewPoints[b].p), f);
    target
      .fromArray(mobile() ? viewPoints[a].mt : viewPoints[a].t)
      .lerp(tmp.fromArray(mobile() ? viewPoints[b].mt : viewPoints[b].t), f);
    if (panelOpen && inspectionId && !mobile()) {
      const meta = itemMeta(inspectionId),
        index = areaIndex(meta.area),
        root = itemRoots.get(inspectionId);
      const collection = meta.kind === "collection";
      if (root && !collection) {
        box.setFromObject(root);
        box.getCenter(center);
        box.getSize(size);
        const distance = clamp(Math.max(size.x, size.y, size.z) * 2.35, 9, 19);
        desired
          .fromArray(viewPoints[index].p)
          .sub(tmp.fromArray(viewPoints[index].t))
          .normalize()
          .multiplyScalar(distance)
          .add(center);
        target.copy(center);
      } else {
        center.fromArray(viewPoints[index].mt);
        desired
          .fromArray(viewPoints[index].p)
          .sub(tmp.fromArray(viewPoints[index].t))
          .add(center);
        target.copy(center);
      }
    }
    if (immediate) {
      camera.position.copy(desired);
      controls.target.copy(target);
    }
  }
  function invalidate() {
    dirty = true;
    // Every animated property reaches its final value in one reduced-motion frame.
    settle = reducedMotion ? 0 : 24;
    if (!frame && !suspended && !disposed && !lost && !document.hidden)
      frame = requestAnimationFrame(render);
  }
  function resize() {
    configureProjection();
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.35 : 1.7));
    renderer.setSize(innerWidth, innerHeight);
    updateView(true);
    controls.update();
    invalidate();
  }
  function resolveItem(object) {
    let node = object;
    while (node) {
      if (node.userData.item) return node.userData.item;
      node = node.parent;
    }
    return null;
  }
  function pickAt(x, y) {
    pointer.set((x / innerWidth) * 2 - 1, (-y / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    // Raycast the whole scene so walls and other foreground objects occlude hidden exhibits.
    const hits = raycaster.intersectObject(scene, true);
    for (const hit of hits) {
      if (!hit.object.visible) continue;
      return resolveItem(hit.object);
    }
    return null;
  }
  function setHover(id, announce = false) {
    if (hovered !== id) {
      hovered = id;
      invalidate();
    }
    if (announce) onHover?.(id);
  }
  function pointerStart(event) {
    if (panelOpen) return;
    pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId };
    hasDragged = false;
  }
  function pointerMove(event) {
    if (panelOpen) return;
    if (
      pointerDown &&
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) >
        7
    ) {
      hasDragged = true;
      setHover(null, true);
      if (!orbiting) {
        orbiting = true;
        onOrbit?.(true);
      }
    }
    if (
      !pointerDown &&
      event.pointerType !== "touch" &&
      performance.now() - lastPick > 35
    ) {
      lastPick = performance.now();
      const id = pickAt(event.clientX, event.clientY);
      setHover(id, true);
      canvas.style.cursor = id ? "pointer" : "grab";
    }
    if (pointerDown) invalidate();
  }
  function pointerEnd(event) {
    if (!panelOpen && pointerDown && !hasDragged) {
      const id = pickAt(event.clientX, event.clientY);
      if (id) onSelect?.(id);
    }
    pointerDown = null;
  }
  function pointerCancel() {
    pointerDown = null;
    setHover(null, true);
  }
  function pointerLeave() {
    if (!pointerDown) setHover(null, true);
  }
  canvas.addEventListener("pointerdown", pointerStart);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerEnd);
  canvas.addEventListener("pointercancel", pointerCancel);
  canvas.addEventListener("pointerleave", pointerLeave);
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    container.dataset.ready = "false";
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onFailure?.();
  }
  function contextRestored() {
    lost = false;
    restoreEnvironment();
    renderer.shadowMap.needsUpdate = true;
    onReady?.();
    invalidate();
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  controls.addEventListener("change", () => {
    dirty = true;
  });
  function visibility() {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else {
      last = performance.now();
      invalidate();
    }
  }
  document.addEventListener("visibilitychange", visibility);
  addEventListener("resize", resize);
  function updatePins() {
    refreshPins();
    const occupied = [];
    for (const pin of pins) {
      const overview = currentPinArea === 0,
        definition = overviewPins.find((p) => p.id === pin.id);
      overview
        ? projected.fromArray(definition.p)
        : worldPoint(pin.id, projected);
      if (!overview) projected.y += 0.38;
      projected.project(camera);
      let x = (projected.x * 0.5 + 0.5) * innerWidth + pin.offset[0],
        y = (-projected.y * 0.5 + 0.5) * innerHeight + pin.offset[1];
      const width = mobile() ? 36 : pin.width;
      let lift = 0;
      if (!mobile()) {
        for (let j = 0; j < 5; j++) {
          if (
            !occupied.some(
              (r) =>
                Math.abs(r.x - x) < (r.w + width) / 2 + 6 &&
                Math.abs(r.y - y) < 35,
            )
          )
            break;
          y -= 35;
          lift += 35;
        }
      }
      const minX = mobile() ? 18 : innerWidth * 0.32,
        maxX = innerWidth - (mobile() ? 18 : width / 2 + 20);
      const visible =
        !panelOpen &&
        projected.z < 1 &&
        projected.z > -1 &&
        x > minX &&
        x < maxX &&
        y > 125 &&
        y < innerHeight * (mobile() ? 0.55 : 0.79);
      pin.el.style.left = x + "px";
      pin.el.style.top = y + "px";
      pin.el.style.setProperty("--pin-tail", 22 + lift + "px");
      pin.el.classList.toggle("is-visible", visible);
      pin.el.tabIndex = visible ? 0 : -1;
      pin.el.setAttribute("aria-hidden", String(!visible));
      if (visible) occupied.push({ x, y, w: width });
    }
  }
  function render(now) {
    frame = 0;
    if (disposed || suspended || lost || document.hidden) return;
    const ambient = !paused && !panelOpen;
    if (!dirty && !orbiting && ambient && now - last < 1000 / 30) {
      frame = requestAnimationFrame(render);
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (ambient) clock += dt;
    updateView();
    const damp = reducedMotion ? 1 : 1 - Math.exp(-dt * 7);
    if (!orbiting) {
      camera.position.lerp(desired, damp);
      controls.target.lerp(target, damp);
    }
    controls.update();
    const targetNight = night ? 1 : 0;
    nightMix = THREE.MathUtils.lerp(
      nightMix,
      targetNight,
      reducedMotion ? 1 : 1 - Math.exp(-dt * 3),
    );
    scene.background.copy(dayColor).lerp(nightColor, nightMix);
    scene.fog.color.copy(scene.background);
    ground.material.color.copy(dayGround).lerp(nightGround, nightMix);
    hemi.intensity = THREE.MathUtils.lerp(1.2, 0.55, nightMix);
    sun.intensity = THREE.MathUtils.lerp(3.2, 0.5, nightMix);
    fill.intensity = THREE.MathUtils.lerp(1.3, 1.5, nightMix);
    warmLights.forEach((l) => (l.intensity = l.userData.power * nightMix));
    lightMaterial.emissiveIntensity = 0.5 + nightMix * 2;
    explosion = THREE.MathUtils.lerp(
      explosion,
      exploded ? 1 : 0,
      reducedMotion ? 1 : 1 - Math.exp(-dt * 4),
    );
    layers.forEach(({ g, x, y, z, i }) => {
      g.position.set(
        x + explosion * (i - 1) * 0.65,
        y +
          explosion * i * 0.45 +
          (ambient ? Math.sin(clock * 0.6 + i) * 0.055 : 0),
        z - explosion * i * 0.7,
      );
      g.rotation.y = explosion * (i - 1) * 0.16;
    });
    let hoverMoving = false;
    for (const [id, state] of rootStates) {
      const selected = hovered === id ? 1 : inspectionId === id ? 0.65 : 0;
      state.mix = THREE.MathUtils.lerp(
        state.mix,
        selected,
        reducedMotion ? 1 : 1 - Math.exp(-dt * 12),
      );
      if (Math.abs(state.mix - selected) > 0.005) hoverMoving = true;
      for (const m of state.materials) {
        m.material.emissive.copy(m.color).lerp(highlightColor, state.mix * 0.16);
        m.material.emissiveIntensity = m.intensity;
      }
      if (state.root.userData.slide)
        state.root.position.z = state.base.z + state.mix * 0.27;
      else if (!["collection", "action"].includes(state.meta.kind))
        state.root.position.y = state.base.y + state.mix * 0.045;
    }
    const moving =
      (camera.position.distanceToSquared(desired) > 0.00005 && !orbiting) ||
      Math.abs(nightMix - targetNight) > 0.001 ||
      Math.abs(explosion - (exploded ? 1 : 0)) > 0.001 ||
      hoverMoving;
    if (
      hoverMoving ||
      Math.abs(explosion - (exploded ? 1 : 0)) > 0.001 ||
      (ambient && ++shadowTick % 15 === 0)
    )
      renderer.shadowMap.needsUpdate = true;
    if (ambient) animations.forEach((fn) => fn(clock));
    scene.updateMatrixWorld();
    // Project labels with the same camera matrices used for this frame's render.
    camera.updateMatrixWorld();
    updatePins();
    renderer.render(scene, camera);
    container.dataset.ready = "true";
    container.dataset.area = areas[Math.round(progress)].id;
    container.dataset.inspection = panelOpen ? inspectionId || "index" : "";
    dirty = false;
    if (ambient || moving || settle-- > 0)
      frame = requestAnimationFrame(render);
  }
  resize();
  updateView(true);
  controls.update();
  renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  container.dataset.ready = "true";
  onReady?.();
  invalidate();
  return {
    images,
    setProgress(value) {
      const next = clamp(value, 0, 5);
      if (Math.abs(next - progress) < 0.00001) return;
      progress = next;
      if (orbiting) {
        orbiting = false;
        onOrbit?.(false);
      }
      setHover(null);
      invalidate();
    },
    reset() {
      orbiting = false;
      onOrbit?.(false);
      setHover(null, true);
      invalidate();
    },
    inspect(id, { open = panelOpen } = {}) {
      inspectionId = id;
      panelOpen = open;
      orbiting = false;
      controls.enabled = !open;
      onOrbit?.(false);
      setHover(null, true);
      configureProjection();
      invalidate();
    },
    setHovered(id) {
      setHover(id);
    },
    setNight(value) {
      night = value;
      invalidate();
    },
    setExploded(value) {
      exploded = value;
      renderer.shadowMap.needsUpdate = true;
      invalidate();
    },
    setPaused(value) {
      paused = value;
      last = performance.now();
      invalidate();
    },
    setSuspended(value) {
      suspended = value;
      controls.enabled = !value && !panelOpen;
      if (value) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      } else {
        last = performance.now();
        invalidate();
      }
    },
    getState() {
      return {
        progress,
        orbiting,
        paused,
        night,
        exploded,
        panelOpen,
        inspectionId,
        hovered,
        renderCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        camera: camera.position.toArray(),
      };
    },
    getScreenPoint(id) {
      worldPoint(id, projected).project(camera);
      const x = (projected.x * 0.5 + 0.5) * innerWidth,
        y = (-projected.y * 0.5 + 0.5) * innerHeight;
      return {
        x,
        y,
        hit: pickAt(x, y),
        inView:
          projected.z < 1 &&
          Math.abs(projected.x) < 1 &&
          Math.abs(projected.y) < 1,
      };
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      controls.dispose();
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      disposeEnvironment();
      renderer.dispose();
      canvas.remove();
    },
  };
}
