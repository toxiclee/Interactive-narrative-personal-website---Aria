"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import type { MutableRefObject } from "react";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useCorridorNav } from "./corridorNavContext";
import { LETTER_TO_PHOTOGRAPHY_IMAGE, PHOTOGRAPHY_EXIT_TRANSITION_IMAGE } from "./entranceAsset";

/** Soft cream museum (Orangerie-like) — warm ivory, luminous air, not industrial. */
const PAPER = "#fffaf3";
/** Bright warm haze — reads as light, not grey concrete */
const LUMEN = "#fffcf8";
const WALL_CREAM_LEFT = "#faf7f2";
const WALL_CREAM_RIGHT = "#f7f1e8";
const WALL_CREAM_CEILING = "#fffaf5";
const WALL_WHITE_BRIGHT = "#fffdf8";
const ALMOND = "#f2ebe0";
const FLOOR_WARM = "#efe6dc";
const SKETCH = "#c4b8a6";
const WALL_LINE = "#e8e0d4";
const LINE_SOFT = "#f3ebe2";
const INK = "#5c5248";
const INK_SOFT = "#8a8074";

const DREAM_FOG_DENSITY = 0.00235;
const DREAM_FOG_PULSE = 0.0003;

/** Warm white wash lights only — no cool sci-fi accents */
const MUSEUM_WASH_PALETTE = ["#fff9f2", "#fff6eb", "#fefbf3", "#fff8ef"] as const;

/** Lateral half-width — slightly narrower for a more intimate salon (less tunnel volume). */
const GALLERY_PATH_HALF_W = 2.96;
/** Ceiling ribbon slightly narrower than the floor */
const GALLERY_CEILING_HALF_W = GALLERY_PATH_HALF_W - 0.1;
/** Wall planes sit just inside the floor edge */
const GALLERY_WALL_HALF_W = GALLERY_PATH_HALF_W - 0.2;
/** Inner offset used only for pencil under-draw (second stroke slightly into the room). */
const GALLERY_PENCIL_UNDERDRAW_R = GALLERY_WALL_HALF_W - 0.005;
/** Inner wall face to inner wall face — end painting spans this lateral width (minus inset) */
const GALLERY_END_WALL_CLEAR_W = 2 * GALLERY_WALL_HALF_W;
/** Inset from each wall so the canvas clears trim / z-fight */
const GALLERY_END_ART_SIDE_INSET = 0.22;
/** Vertical cap for end art (main wall strip ~0.034–3.26; canvas centered ~1.44) */
const GALLERY_END_ART_MAX_H = 2.72;
/** Soft perimeter lines beyond the walkable slab */
const GALLERY_VEIL_HALF_W = GALLERY_PATH_HALF_W + 0.96;
/** Memory anchors: radial distance along wall / niche (meters from path) */
const MEMORY_EMBED_R = GALLERY_PATH_HALF_W - 0.08;
const MEMORY_NICHE_R = GALLERY_PATH_HALF_W + 0.88;

/** Scroll progress within the corridor at which entrance effects (bob / opacity) ease in */
const GALLERY_HANDOFF_END = 0.28;

const UP = new THREE.Vector3(0, 1, 0);

function easeOutIn(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function createGalleryCurve() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0, 11.0),
      new THREE.Vector3(1.05, 0, 3.8),
      new THREE.Vector3(1.68, 0, -3.4),
      new THREE.Vector3(1.22, 0, -11.8),
      new THREE.Vector3(-0.62, 0, -20.2),
      new THREE.Vector3(-1.48, 0, -28.5),
      new THREE.Vector3(-1.18, 0, -36.8),
      new THREE.Vector3(0.72, 0, -46.2),
      new THREE.Vector3(1.42, 0, -56.5),
      new THREE.Vector3(0.92, 0, -66.5),
      new THREE.Vector3(-0.42, 0, -77.5),
      new THREE.Vector3(1.05, 0, -88.5),
    ],
    false,
    "catmullrom",
    0.42,
  );
}

function frameAt(curve: THREE.CatmullRomCurve3, u: number) {
  const p = curve.getPointAt(u);
  const tan = curve.getTangentAt(u);
  tan.y = 0;
  if (tan.lengthSq() < 1e-8) tan.set(0, 0, -1);
  tan.normalize();
  const out = new THREE.Vector3().crossVectors(UP, tan).normalize();
  return { p, tan, out };
}

/** Local +Z = into the hall; X runs along the corridor on the wall (for upright texture). */
function quaternionWallPaint(out: THREE.Vector3, tan: THREE.Vector3, wall: 1 | -1) {
  const z = out.clone().multiplyScalar(-wall).normalize();
  const t = tan.clone();
  t.y = 0;
  if (t.lengthSq() < 1e-8) t.set(0, 0, -1);
  t.normalize();
  let x = t.clone().sub(z.clone().multiplyScalar(t.dot(z)));
  if (x.lengthSq() < 1e-8) {
    x.crossVectors(UP, z).normalize();
  } else {
    x.normalize();
  }
  let y = new THREE.Vector3().crossVectors(z, x).normalize();
  if (y.dot(UP) < 0) {
    y.negate();
    x.negate();
  }
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

function pushQuadPos(
  pos: number[],
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3,
) {
  for (const v of [a, b, c, a, c, d]) {
    pos.push(v.x, v.y, v.z);
  }
}

/** UVs for quads from `pushQuadPos`: a (-width), b (+width) at u0; c (+), d (-) at u1. */
function pushQuadUv(uv: number[], u0: number, u1: number) {
  uv.push(u0, 0, u0, 1, u1, 1, u0, 0, u1, 1, u1, 0);
}

/** UVs for inner wall strip: `pushQuadPos(A.ib, B.ib, B.it, A.it)` — u along curve, v bottom→top. */
function pushStripWallUv(uv: number[], u0: number, u1: number) {
  uv.push(u0, 0, u1, 0, u1, 1, u0, 0, u1, 1, u0, 1);
}

function buildInnerWallStrip(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  side: 1 | -1,
  y0: number,
  y1: number,
  inner: number,
) {
  const pos: number[] = [];
  const uv: number[] = [];
  const slices: { ib: THREE.Vector3; it: THREE.Vector3 }[] = [];
  for (let i = 0; i <= divisions; i++) {
    const tu = i / divisions;
    const { p, out } = frameAt(curve, tu);
    const o = out.clone().multiplyScalar(side);
    const innerP = p.clone().add(o.clone().multiplyScalar(inner));
    slices.push({
      ib: innerP.clone().setY(y0),
      it: innerP.clone().setY(y1),
    });
  }
  for (let i = 0; i < divisions; i++) {
    const tu0 = i / divisions;
    const tu1 = (i + 1) / divisions;
    const A = slices[i];
    const B = slices[i + 1];
    pushQuadPos(pos, A.ib, B.ib, B.it, A.it);
    pushStripWallUv(uv, tu0, tu1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function buildFloorCeilingRibbon(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  halfW: number,
  y: number,
) {
  const pos: number[] = [];
  const slices: THREE.Vector3[] = [];
  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const { p } = frameAt(curve, u);
    slices.push(p.clone().setY(y));
  }
  for (let i = 0; i < divisions; i++) {
    const u0 = i / divisions;
    const u1 = (i + 1) / divisions;
    const { out: o0 } = frameAt(curve, u0);
    const { out: o1 } = frameAt(curve, u1);
    const p0 = slices[i];
    const p1 = slices[i + 1];
    const a = p0.clone().add(o0.clone().multiplyScalar(-halfW));
    const b = p0.clone().add(o0.clone().multiplyScalar(halfW));
    const c = p1.clone().add(o1.clone().multiplyScalar(halfW));
    const d = p1.clone().add(o1.clone().multiplyScalar(-halfW));
    pushQuadPos(pos, a, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function buildFloorRibbonWithUv(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  halfW: number,
  y: number,
) {
  const pos: number[] = [];
  const uv: number[] = [];
  const slices: THREE.Vector3[] = [];
  let uAlong = 0;
  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const { p } = frameAt(curve, u);
    slices.push(p.clone().setY(y));
  }
  for (let i = 0; i < divisions; i++) {
    const u0 = i / divisions;
    const u1 = (i + 1) / divisions;
    const { out: o0 } = frameAt(curve, u0);
    const { out: o1 } = frameAt(curve, u1);
    const p0 = slices[i];
    const p1 = slices[i + 1];
    const a = p0.clone().add(o0.clone().multiplyScalar(-halfW));
    const b = p0.clone().add(o0.clone().multiplyScalar(halfW));
    const c = p1.clone().add(o1.clone().multiplyScalar(halfW));
    const d = p1.clone().add(o1.clone().multiplyScalar(-halfW));
    const segLen = p0.distanceTo(p1);
    const ua = uAlong;
    uAlong += segLen;
    const ub = uAlong;
    pushQuadPos(pos, a, b, c, d);
    pushQuadUv(uv, ua, ub);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** Shallow barrel vault across `out`: center of ceiling is higher than edges (oval room read). */
function buildBarrelCeilingRibbon(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  halfW: number,
  yBase: number,
  sag: number,
  crossDivs: number,
) {
  const pos: number[] = [];
  for (let i = 0; i < divisions; i++) {
    const u0 = i / divisions;
    const u1 = (i + 1) / divisions;
    const { p: p0, out: o0 } = frameAt(curve, u0);
    const { p: p1, out: o1 } = frameAt(curve, u1);
    for (let k = 0; k < crossDivs; k++) {
      const t0 = -1 + (2 * k) / crossDivs;
      const t1 = -1 + (2 * (k + 1)) / crossDivs;
      const arch = (t: number) => yBase + sag * (1 - t * t);
      const ya0 = arch(t0);
      const yb0 = arch(t1);
      const ya1 = arch(t0);
      const yb1 = arch(t1);
      const a = p0.clone().add(o0.clone().multiplyScalar(t0 * halfW)).setY(ya0);
      const b = p0.clone().add(o0.clone().multiplyScalar(t1 * halfW)).setY(yb0);
      const c = p1.clone().add(o1.clone().multiplyScalar(t1 * halfW)).setY(yb1);
      const d = p1.clone().add(o1.clone().multiplyScalar(t0 * halfW)).setY(ya1);
      pushQuadPos(pos, a, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function createFloorBoardTexture() {
  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = "#f2ebe2";
  ctx.fillRect(0, 0, w, h);
  const rows = 18;
  const plankH = h / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * plankH;
    const band = r % 2 === 0 ? "rgba(255,252,246,0.08)" : "rgba(228,218,206,0.06)";
    ctx.fillStyle = band;
    ctx.fillRect(0, y, w, plankH - 0.5);
  }
  ctx.strokeStyle = "rgba(255,250,242,0.14)";
  ctx.lineWidth = 1;
  for (let r = 1; r < rows; r++) {
    const y = r * plankH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  for (let x = 0; x < w; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(220,205,190,0.06)";
  for (let r = 0; r < 5; r++) {
    const cx = w * (0.35 + r * 0.12);
    const rx = 40 + r * 28;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.55, rx, rx * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(92, 82, 72, 0.035)";
  ctx.lineWidth = 0.65;
  ctx.lineCap = "round";
  for (let r = 0; r < rows; r += 2) {
    const y = r * plankH + plankH * 0.45;
    ctx.beginPath();
    ctx.moveTo(w * 0.04, y);
    ctx.lineTo(w * (0.82 + (r % 5) * 0.02), y + ((r * 7) % 5) - 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(92, 82, 72, 0.03)";
  ctx.lineWidth = 0.55;
  ctx.lineCap = "round";
  for (let n = 0; n < 9; n++) {
    ctx.beginPath();
    ctx.moveTo(w * (0.06 + n * 0.1), h * 0.88);
    ctx.lineTo(w * (0.02 + n * 0.105), h * 0.06);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(92, 82, 72, 0.022)";
  for (let k = 0; k < 14; k++) {
    const x0 = (k / 14) * w;
    ctx.beginPath();
    ctx.moveTo(x0, h * 0.2);
    ctx.quadraticCurveTo(x0 + w * 0.04, h * 0.52, x0 - w * 0.02, h * 0.78);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** Soft paper / plaster albedo — subtle, stays near-white (map multiplies wall color). */
function createPlasterTexture() {
  const w = 512;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#fdf9f3";
  ctx.fillRect(0, 0, w, h);
  const wash = ctx.createLinearGradient(0, 0, w * 0.45, h * 0.5);
  wash.addColorStop(0, "rgba(255, 252, 246, 0.35)");
  wash.addColorStop(0.5, "rgba(255,255,255,0)");
  wash.addColorStop(1, "rgba(240,228,214,0.1)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.028})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1 + Math.random() * 2);
  }
  for (let i = 0; i < 320; i++) {
    ctx.fillStyle = `rgba(210, 200, 188, ${0.004 + Math.random() * 0.01})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
  }
  ctx.strokeStyle = "rgba(200, 188, 176, 0.014)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.lineTo(Math.random() * w, Math.random() * h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(200, 190, 178, 0.028)";
  ctx.lineWidth = 0.75;
  for (let i = -1; i < 10; i++) {
    ctx.beginPath();
    const x0 = (i / 9) * w;
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + h * 0.16, h);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(92, 82, 72, 0.022)";
  ctx.lineWidth = 0.9;
  for (let k = 0; k < 5; k++) {
    ctx.beginPath();
    ctx.moveTo(w * (0.08 + k * 0.19), h * 0.12);
    ctx.lineTo(w * (0.02 + k * 0.21), h * (0.55 + k * 0.06));
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  // One vertical span on the wall (clamp T) avoids a mid-wall repeat seam.
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** Grayscale micro-variation for bump (non-color data). */
function createPlasterBumpTexture() {
  const w = 256;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3200; i++) {
    const v = 105 + Math.random() * 46;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function CurvedShell({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const div = 136;
  const leftGeo = useMemo(
    () => buildInnerWallStrip(curve, div, 1, 0.034, 3.26, GALLERY_WALL_HALF_W),
    [curve],
  );
  const rightGeo = useMemo(
    () => buildInnerWallStrip(curve, div, -1, 0.034, 3.26, GALLERY_WALL_HALF_W),
    [curve],
  );
  const floorGeo = useMemo(
    () => buildFloorRibbonWithUv(curve, div, GALLERY_PATH_HALF_W, 0.02),
    [curve],
  );
  const ceilGeo = useMemo(
    () => buildBarrelCeilingRibbon(curve, div, GALLERY_CEILING_HALF_W, 3.26, 0.3, 14),
    [curve],
  );
  const floorMap = useMemo(() => {
    const tex = createFloorBoardTexture();
    if (tex) {
      tex.repeat.set(0.088, 4.35);
    }
    return tex;
  }, []);

  const { plasterMap, bumpMap } = useMemo(() => {
    const plaster = createPlasterTexture();
    const bump = createPlasterBumpTexture();
    if (plaster) {
      /** Tile along corridor (u); single cycle top→bottom (v) + clamp = no horizontal banding */
      plaster.repeat.set(4.6, 1);
    }
    if (bump) {
      bump.repeat.set(4.6, 1);
    }
    return { plasterMap: plaster, bumpMap: bump };
  }, []);

  const rightPlasterMap = useMemo(() => {
    if (!plasterMap) return null;
    const c = plasterMap.clone();
    c.offset.set(0.19, 0.07);
    c.needsUpdate = true;
    return c;
  }, [plasterMap]);

  return (
    <group>
      <mesh geometry={leftGeo}>
        <meshStandardMaterial
          color={WALL_CREAM_LEFT}
          map={plasterMap ?? undefined}
          bumpMap={bumpMap ?? undefined}
          bumpScale={0.011}
          roughness={0.96}
          metalness={0}
          emissive="#fff9f2"
          emissiveIntensity={0.055}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshStandardMaterial
          color={WALL_CREAM_RIGHT}
          map={rightPlasterMap ?? plasterMap ?? undefined}
          bumpMap={bumpMap ?? undefined}
          bumpScale={0.01}
          roughness={0.96}
          metalness={0}
          emissive="#fff8ef"
          emissiveIntensity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={floorGeo} rotation={[0, 0, 0]}>
        <meshStandardMaterial
          color={FLOOR_WARM}
          map={floorMap ?? undefined}
          roughness={0.78}
          metalness={0.04}
          emissive="#fff8f4"
          emissiveIntensity={0.04}
        />
      </mesh>
      <mesh geometry={ceilGeo}>
        <meshStandardMaterial
          color={WALL_CREAM_CEILING}
          roughness={0.98}
          metalness={0}
          emissive="#fffaf0"
          emissiveIntensity={0.24}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function buildInnerWallFloorPolyline(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  inner: number,
  side: 1 | -1,
  y: number,
) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const { p, out } = frameAt(curve, u);
    pts.push(p.clone().add(out.clone().multiplyScalar(inner * side)).setY(y));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function buildFloorOffsetGuidePolyline(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  offsetAlongOut: number,
  y: number,
) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= divisions; i++) {
    const u = i / divisions;
    const { p, out } = frameAt(curve, u);
    pts.push(p.clone().add(out.clone().multiplyScalar(offsetAlongOut)).setY(y));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

/** Short ticks across the path — construction-line feel on the floor plane. */
function buildFloorCenterCrossTicks(
  curve: THREE.CatmullRomCurve3,
  divisions: number,
  y: number,
  halfWidth: number,
  every: number,
) {
  const pos: number[] = [];
  const step = 1 / divisions;
  for (let i = 0; i < divisions; i += every) {
    const u = (i + 0.5) * step;
    const { p, out } = frameAt(curve, u);
    const c = p.clone().setY(y);
    const a = c.clone().add(out.clone().multiplyScalar(-halfWidth));
    const b = c.clone().add(out.clone().multiplyScalar(halfWidth));
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function WallVeilLines({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const div = 72;
    for (let s = 0; s <= div; s++) {
      const u = s / div;
      const { p, out } = frameAt(curve, u);
      const o = out.clone().multiplyScalar(GALLERY_VEIL_HALF_W);
      pts.push(p.clone().add(o).setY(0.03), p.clone().add(o).setY(3.32));
    }
    for (let s = 0; s <= div; s++) {
      const u = s / div;
      const { p, out } = frameAt(curve, u);
      const o = out.clone().multiplyScalar(-GALLERY_VEIL_HALF_W);
      pts.push(p.clone().add(o).setY(0.03), p.clone().add(o).setY(3.32));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [curve]);
  const line = useMemo(
    () =>
      new THREE.LineSegments(
        geom,
        new THREE.LineBasicMaterial({
          color: WALL_LINE,
          transparent: true,
          opacity: 0.062,
        }),
      ),
    [geom],
  );
  return <primitive object={line} />;
}

function ArchitecturalSketchLines({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const div = 120;
  /** Wall–floor edge: pencil (no dark baseboard band). */
  const pencilMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: INK,
        transparent: true,
        opacity: 0.2,
        toneMapped: false,
      }),
    [],
  );
  const pencilUnderMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: INK_SOFT,
        transparent: true,
        opacity: 0.1,
        toneMapped: false,
      }),
    [],
  );
  const faintMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: SKETCH,
        transparent: true,
        opacity: 0.038,
      }),
    [],
  );
  const gLfUnder = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_PENCIL_UNDERDRAW_R, 1, 0.0365),
    [curve],
  );
  const gLfMain = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_WALL_HALF_W, 1, 0.0385),
    [curve],
  );
  const gRfUnder = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_PENCIL_UNDERDRAW_R, -1, 0.0365),
    [curve],
  );
  const gRfMain = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_WALL_HALF_W, -1, 0.0385),
    [curve],
  );
  const gLceil = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_WALL_HALF_W, 1, 3.06),
    [curve],
  );
  const gRceil = useMemo(
    () => buildInnerWallFloorPolyline(curve, div, GALLERY_WALL_HALF_W, -1, 3.08),
    [curve],
  );
  return (
    <group>
      <primitive object={new THREE.Line(gLfUnder, pencilUnderMat)} />
      <primitive object={new THREE.Line(gLfMain, pencilMat)} />
      <primitive object={new THREE.Line(gRfUnder, pencilUnderMat.clone())} />
      <primitive object={new THREE.Line(gRfMain, pencilMat.clone())} />
      <primitive object={new THREE.Line(gLceil, faintMat)} />
      <primitive object={new THREE.Line(gRceil, faintMat.clone())} />
    </group>
  );
}

function FloorSpaceGuides({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const div = 72;
  const gNeg = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, -1.05, 0.034), [curve]);
  const gPos = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, 1.05, 0.034), [curve]);
  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: LINE_SOFT,
        transparent: true,
        opacity: 0.052,
      }),
    [],
  );
  return (
    <group>
      <primitive object={new THREE.Line(gNeg, mat)} />
      <primitive object={new THREE.Line(gPos, mat.clone())} />
    </group>
  );
}

/** Light pencil / construction marks on the walkable floor (follows the curve). */
function FloorSketchLines({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const div = 140;
  const y = 0.034;
  const gCenter = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, 0, y), [curve]);
  const gLaneL = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, -0.46, y + 0.0008), [curve]);
  const gLaneR = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, 0.46, y + 0.0008), [curve]);
  const gWideL = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, -0.92, y + 0.0015), [curve]);
  const gWideR = useMemo(() => buildFloorOffsetGuidePolyline(curve, div, 0.92, y + 0.0015), [curve]);
  const gTicks = useMemo(() => buildFloorCenterCrossTicks(curve, div, y + 0.0004, 0.36, 6), [curve]);

  const matCenter = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: INK_SOFT,
        transparent: true,
        opacity: 0.078,
        toneMapped: false,
      }),
    [],
  );
  const matLane = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: SKETCH,
        transparent: true,
        opacity: 0.052,
        toneMapped: false,
      }),
    [],
  );
  const matWide = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: LINE_SOFT,
        transparent: true,
        opacity: 0.038,
        toneMapped: false,
      }),
    [],
  );
  const matTicks = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: INK,
        transparent: true,
        opacity: 0.045,
        toneMapped: false,
      }),
    [],
  );

  return (
    <group>
      <primitive object={new THREE.Line(gWideL, matWide)} />
      <primitive object={new THREE.Line(gWideR, matWide.clone())} />
      <primitive object={new THREE.Line(gLaneL, matLane)} />
      <primitive object={new THREE.Line(gLaneR, matLane.clone())} />
      <primitive object={new THREE.Line(gCenter, matCenter)} />
      <primitive object={new THREE.LineSegments(gTicks, matTicks)} />
    </group>
  );
}

/** Large end wall painting: same asset as HorizontalTransition dress-closeup; sized to inner wall width. */
function GalleryEndTransition({
  curve,
  texture,
  progressRef: _progressRef,
}: {
  curve: THREE.CatmullRomCurve3;
  texture: THREE.Texture;
  progressRef: MutableRefObject<number>;
}) {
  const { offset, ry, w, h, glowW, glowH } = useMemo(() => {
    const u = 0.993;
    const p = curve.getPointAt(u);
    const tang = curve.getTangentAt(u);
    tang.y = 0;
    if (tang.lengthSq() < 1e-8) tang.set(0, 0, -1);
    tang.normalize();
    const ry = Math.atan2(tang.x, tang.z);
    const off = p.clone().sub(tang.clone().multiplyScalar(0.12));
    const img = texture.image as HTMLImageElement | undefined;
    const aspect =
      img?.naturalWidth && img?.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : img?.width && img?.height
          ? img.width / img.height
          : 0.72;
    const maxW = GALLERY_END_WALL_CLEAR_W - 2 * GALLERY_END_ART_SIDE_INSET;
    const maxH = GALLERY_END_ART_MAX_H;
    let width = maxW;
    let height = width / aspect;
    if (height > maxH) {
      height = maxH;
      width = height * aspect;
    }
    const glowW = width + 0.55;
    const glowH = height + 0.38;
    return { offset: off, ry, w: width, h: height, glowW, glowH };
  }, [curve, texture]);

  return (
    <group position={[offset.x, 1.44, offset.z]} rotation={[0, ry + Math.PI, 0]}>
      <group>
        <mesh position={[0, 0, -0.22]}>
          <planeGeometry args={[glowW, glowH]} />
          <meshBasicMaterial color="#fff4e6" transparent opacity={0.32} depthWrite={false} fog={false} />
        </mesh>
        <mesh position={[0, 0, 0.08]} renderOrder={8}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial
            map={texture}
            color="#ffffff"
            toneMapped={false}
            depthWrite
            depthTest
            fog={false}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-3}
            polygonOffsetUnits={-3}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.1]} renderOrder={9}>
          <edgesGeometry args={[new THREE.PlaneGeometry(w * 1.012, h * 1.012)]} />
          <lineBasicMaterial color={SKETCH} transparent opacity={0.22} toneMapped={false} fog={false} />
        </lineSegments>
      </group>
      <pointLight position={[0, 0.9, 1.4]} intensity={0.52} distance={58} decay={2} color="#fff0dc" />
      <pointLight position={[0, -0.15, 1.05]} intensity={0.22} distance={30} decay={2} color="#fff8f0" />
    </group>
  );
}

const WHISPER_FRAMES = [
  { u: 0.23, wall: 1 as const, scale: 0.92, title: "Study in quiet" },
  { u: 0.35, wall: -1 as const, scale: 0.78, title: "Passing light" },
  { u: 0.68, wall: 1 as const, scale: 0.84, title: "Still window" },
] as const;

function WhisperFrame({
  curve,
  u,
  wall,
  scale,
  title,
}: {
  curve: THREE.CatmullRomCurve3;
  u: number;
  wall: 1 | -1;
  scale: number;
  title: string;
}) {
  const frameW = 0.88;
  const frameH = 0.62;
  const { position, quaternion } = useMemo(() => {
    const { p, out, tan } = frameAt(curve, u);
    const flush = 0.02;
    const pos = p.clone().add(out.clone().multiplyScalar((GALLERY_WALL_HALF_W - flush) * wall)).setY(1.36);
    const quat = quaternionWallPaint(out, tan, wall);
    return { position: pos, quaternion: quat };
  }, [curve, u, wall]);

  return (
    <group position={position} quaternion={quaternion} scale={scale} renderOrder={24}>
      <mesh position={[0, 0, -0.014]}>
        <planeGeometry args={[frameW * 0.86, frameH * 0.8]} />
        <meshStandardMaterial
          color="#faf4eb"
          roughness={0.97}
          metalness={0}
          emissive="#fff6ea"
          emissiveIntensity={0.045}
        />
      </mesh>
      <pointLight position={[0, 0, 0.2]} intensity={0.085} distance={5.5} decay={2} color="#fff0d8" />
      <lineSegments position={[0, 0, 0.02]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(frameW, frameH)]} />
        <lineBasicMaterial color={SKETCH} transparent opacity={0.2} />
      </lineSegments>
      <Html
        transform
        distanceFactor={5.8}
        position={[0, -0.4, 0.05]}
        style={{
          width: 220,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.78,
        }}
      >
        <div
          style={{
            fontFamily: '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive',
            fontSize: 12,
            color: INK_SOFT,
            letterSpacing: "0.02em",
            fontStyle: "italic",
          }}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

/** Original line-art rose for wall sketch decal. */
function createRoseSketchTexture() {
  const s = 320;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = "rgba(255, 252, 254, 0.55)";
  ctx.fillRect(0, 0, s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(105, 55, 82, 0.88)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(s * 0.52, s * 0.9);
  ctx.quadraticCurveTo(s * 0.46, s * 0.58, s * 0.54, s * 0.34);
  ctx.stroke();
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.64);
  ctx.quadraticCurveTo(s * 0.28, s * 0.52, s * 0.44, s * 0.6);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) {
    const ang = (k / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      s * 0.56 + Math.cos(ang) * 10,
      s * 0.3 + Math.sin(ang) * 8,
      20 + (k % 2) * 6,
      0.1,
      Math.PI * 1.25,
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(170, 95, 125, 0.42)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(s * 0.58, s * 0.32, 38, 30, 0.22, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Small traveler with scarf + stars (storybook tone; original silhouette, not a branded character). */
function createTravelerSketchTexture() {
  const s = 320;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = "rgba(252, 253, 255, 0.5)";
  ctx.fillRect(0, 0, s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(72, 88, 118, 0.9)";
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.arc(s * 0.5, s * 0.3, 17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.44);
  ctx.lineTo(s * 0.44, s * 0.88);
  ctx.lineTo(s * 0.58, s * 0.9);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(s * 0.54, s * 0.4);
  ctx.bezierCurveTo(s * 0.78, s * 0.44, s * 0.88, s * 0.62, s * 0.94, s * 0.78);
  ctx.stroke();
  ctx.strokeStyle = "rgba(110, 125, 155, 0.55)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 10; i++) {
    const x = 22 + (i % 5) * 58;
    const y = 16 + Math.floor(i / 5) * 36;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Flat mural on the curved wall (no billboard / no 3D pop-out). */
function WallPaintDecal({
  curve,
  u,
  wall,
  y,
  w,
  h,
  tex,
}: {
  curve: THREE.CatmullRomCurve3;
  u: number;
  wall: 1 | -1;
  y: number;
  w: number;
  h: number;
  tex: THREE.Texture;
}) {
  const { position, quaternion } = useMemo(() => {
    const { p, out, tan } = frameAt(curve, u);
    const flush = 0.005;
    const pos = p
      .clone()
      .add(out.clone().multiplyScalar((GALLERY_WALL_HALF_W - flush) * wall))
      .setY(y);
    const quat = quaternionWallPaint(out, tan, wall);
    return { position: pos, quaternion: quat };
  }, [curve, u, wall, y]);

  return (
    <group position={position} quaternion={quaternion} renderOrder={22}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={tex}
          transparent
          toneMapped={false}
          depthWrite={false}
          depthTest
          fog={false}
          opacity={1}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
    </group>
  );
}

function WallStorySketches({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const { rose, traveler } = useMemo(() => {
    return { rose: createRoseSketchTexture(), traveler: createTravelerSketchTexture() };
  }, []);

  if (!rose || !traveler) return null;

  return (
    <group>
      <WallPaintDecal curve={curve} u={0.22} wall={1} y={1.36} w={0.95} h={1.12} tex={rose} />
      <WallPaintDecal curve={curve} u={0.4} wall={-1} y={1.4} w={0.88} h={1.18} tex={traveler} />
    </group>
  );
}

function buildWonderlandMoteGeometry(
  curve: THREE.CatmullRomCurve3,
  n: number,
  y0: number,
  y1: number,
  lateralMul: number,
  zJitter: number,
) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 0.92 + 0.02;
    const { p, out } = frameAt(curve, u);
    const lat = (Math.random() - 0.5) * (GALLERY_PATH_HALF_W * lateralMul);
    pos[i * 3] = p.x + out.x * lat + (Math.random() - 0.5) * 1.05;
    pos[i * 3 + 1] = y0 + Math.random() * (y1 - y0);
    pos[i * 3 + 2] = p.z + out.z * lat + (Math.random() - 0.5) * zJitter;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

/** Very subtle warm dust in the light — not colored confetti. */
function WonderlandSparkles({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const fineRef = useRef<THREE.Points>(null);
  const softRef = useRef<THREE.Points>(null);

  const gFine = useMemo(
    () => buildWonderlandMoteGeometry(curve, 320, 0.52, 3.05, 2.05, 5.5),
    [curve],
  );
  const gSoft = useMemo(
    () => buildWonderlandMoteGeometry(curve, 180, 0.62, 2.82, 1.75, 4.8),
    [curve],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (const r of [fineRef, softRef]) {
      if (!r.current) continue;
      r.current.rotation.y = Math.sin(t * 0.042) * 0.012;
      r.current.position.y = Math.sin(t * 0.31 + 0.4) * 0.022;
    }
  });

  return (
    <group>
      <points ref={fineRef} geometry={gFine}>
        <pointsMaterial
          color="#fff5e8"
          size={0.011}
          transparent
          opacity={0.042}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <points ref={softRef} geometry={gSoft}>
        <pointsMaterial
          color="#faf0e4"
          size={0.015}
          transparent
          opacity={0.032}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

function SoftEntrance({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const doorGeo = useMemo(() => new THREE.BoxGeometry(1.85, 2.35, 0.05), []);

  const { p0, ry } = useMemo(() => {
    const p = curve.getPointAt(0.01);
    const t = curve.getTangentAt(0.01);
    t.y = 0;
    t.normalize();
    const ry = Math.atan2(t.x, t.z);
    return { p0: p, ry };
  }, [curve]);

  useFrame(() => {
    const o = Math.min(1, progressRef.current / 0.1) * (Math.PI / 2) * 0.72;
    if (left.current) left.current.rotation.y = -o;
    if (right.current) right.current.rotation.y = o;
  });

  return (
    <group ref={group} position={[p0.x, 0, p0.z]} rotation={[0, ry, 0]}>
      <group ref={left} position={[-0.95, 1.18, 0]}>
        <mesh>
          <boxGeometry args={[1.85, 2.35, 0.05]} />
          <meshStandardMaterial
            color={WALL_WHITE_BRIGHT}
            roughness={1}
            metalness={0}
            emissive="#fff5eb"
            emissiveIntensity={0.08}
            transparent
            opacity={0.38}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[doorGeo]} />
          <lineBasicMaterial color={WALL_LINE} transparent opacity={0.22} />
        </lineSegments>
      </group>
      <group ref={right} position={[0.95, 1.18, 0]}>
        <mesh>
          <boxGeometry args={[1.85, 2.35, 0.05]} />
          <meshStandardMaterial
            color={WALL_CREAM_RIGHT}
            roughness={1}
            metalness={0}
            emissive="#f7f2ea"
            emissiveIntensity={0.07}
            transparent
            opacity={0.38}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[doorGeo]} />
          <lineBasicMaterial color={WALL_LINE} transparent opacity={0.22} />
        </lineSegments>
      </group>
    </group>
  );
}

function CeilingGlowPanels({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const panels = useMemo(() => {
    const us = [0.13, 0.31, 0.49, 0.67, 0.84];
    return us.map((u) => {
      const { p, tan } = frameAt(curve, u);
      const ry = Math.atan2(tan.x, tan.z);
      return { x: p.x, z: p.z, ry };
    });
  }, [curve]);
  return (
    <group>
      {panels.map((pl, i) => (
        <mesh key={`ceil-glow-${i}`} position={[pl.x, 3.36, pl.z]} rotation={[-Math.PI / 2, 0, pl.ry]}>
          <planeGeometry args={[2.35, 0.68]} />
          <meshBasicMaterial
            color="#fffaf0"
            transparent
            opacity={0.28}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Simple 3D gallery bench — two slab supports + thin seat; light sketch edge on seat. */
function GalleryBench3D({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const { pos, ry } = useMemo(() => {
    const u = 0.34;
    const { p, out, tan } = frameAt(curve, u);
    const ry = Math.atan2(tan.x, tan.z);
    const foot = p.clone().add(out.clone().multiplyScalar(0.62));
    foot.y = 0;
    return { pos: foot, ry };
  }, [curve]);

  const seatGeo = useMemo(() => new THREE.BoxGeometry(1.08, 0.048, 0.33), []);
  const seatEdges = useMemo(() => new THREE.EdgesGeometry(seatGeo), [seatGeo]);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.486, 0]} geometry={seatGeo}>
        <meshStandardMaterial
          color="#e8ddd0"
          roughness={0.94}
          metalness={0}
          emissive="#faf4ec"
          emissiveIntensity={0.045}
        />
      </mesh>
      <mesh position={[-0.38, 0.226, 0]}>
        <boxGeometry args={[0.052, 0.36, 0.26]} />
        <meshStandardMaterial
          color="#c9bbaa"
          roughness={0.93}
          metalness={0}
          emissive="#efe6dc"
          emissiveIntensity={0.025}
        />
      </mesh>
      <mesh position={[0.38, 0.226, 0]}>
        <boxGeometry args={[0.052, 0.36, 0.26]} />
        <meshStandardMaterial
          color="#c9bbaa"
          roughness={0.93}
          metalness={0}
          emissive="#efe6dc"
          emissiveIntensity={0.025}
        />
      </mesh>
      <lineSegments position={[0, 0.486, 0]} geometry={seatEdges}>
        <lineBasicMaterial color={SKETCH} transparent opacity={0.2} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

function PaperCurtainPiece({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const { position, quaternion } = useMemo(() => {
    const u = 0.53;
    const wall = -1 as const;
    const { p, out, tan } = frameAt(curve, u);
    const flush = 0.006;
    const pos = p
      .clone()
      .add(out.clone().multiplyScalar((GALLERY_WALL_HALF_W - flush) * wall))
      .setY(1.05);
    const quat = quaternionWallPaint(out, tan, wall);
    return { position: pos, quaternion: quat };
  }, [curve]);
  return (
    <group position={position} quaternion={quaternion} renderOrder={18}>
      <mesh position={[0.05, 0, 0.012]} rotation={[0, 0, 0.08]}>
        <planeGeometry args={[0.62, 1.65]} />
        <meshBasicMaterial
          color="#fffdf8"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

const MEMORY_MARKERS = [
  { anchor: "#letter", label: "Letter", sub: "A note", u: 0.1, kind: "embed" as const, wall: 1 as const },
  { anchor: "#photography", label: "Photography", sub: "Light held still", u: 0.26, kind: "float" as const, wall: -1 as const },
  { anchor: "#archive", label: "Archive", sub: "What remains", u: 0.45, kind: "embed" as const, wall: -1 as const },
  { anchor: "#memory-room", label: "Memory room", sub: "A softer place", u: 0.6, kind: "float" as const, wall: 1 as const },
  { anchor: "#contact", label: "Contact", sub: "Say hello", u: 0.78, kind: "niche" as const, wall: 1 as const },
];

function MemoryPiece({
  curve,
  anchor,
  label,
  sub,
  u,
  kind,
  wall,
  floatPhase,
  entranceTexture,
  progressRef,
  visualWeight,
}: {
  curve: THREE.CatmullRomCurve3;
  anchor: string;
  label: string;
  sub: string;
  u: number;
  kind: "embed" | "float" | "niche";
  wall: 1 | -1;
  floatPhase: number;
  entranceTexture?: THREE.Texture | null;
  progressRef?: MutableRefObject<number>;
  visualWeight?: "prominent";
}) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { beginNavigation, navRef } = useCorridorNav();
  const hover = useRef(0);
  const targetHover = useRef(0);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const isProminent = visualWeight === "prominent";
  const edgeGeo = useMemo(
    () =>
      isProminent
        ? new THREE.BoxGeometry(1.74, 1.02, 0.03)
        : new THREE.BoxGeometry(1.55, 0.95, 0.03),
    [isProminent],
  );
  const basePos = useMemo(() => {
    const { p, out } = frameAt(curve, u);
    const pos = p.clone();
    if (kind === "embed") pos.add(out.clone().multiplyScalar(MEMORY_EMBED_R * wall));
    else if (kind === "float")
      pos.add(out.clone().multiplyScalar(0.55 * wall)).add(new THREE.Vector3(0, 0.52, 0));
    else pos.add(out.clone().multiplyScalar(MEMORY_NICHE_R * wall)).add(new THREE.Vector3(0, -0.18, 0));
    return pos;
  }, [curve, u, kind, wall]);

  const hasHandoff = Boolean(entranceTexture && progressRef);

  useFrame((state) => {
    if (navRef.current.mode === "animating") {
      if (group.current) {
        const t = state.clock.elapsedTime;
        const bob = Math.sin(t * 0.42 + floatPhase) * (kind === "float" ? 0.022 : 0.01);
        group.current.position.copy(basePos);
        group.current.position.y += bob + 1.38;
        hover.current += (targetHover.current - hover.current) * 0.06;
        const h = hover.current;
        group.current.scale.setScalar((1 + h * 0.055) * (isProminent ? 1.05 : 1));
        const look = camera.position.clone();
        group.current.lookAt(look.x, group.current.position.y * 0.98 + 0.15, look.z);
        if (fillMat.current) {
          if (entranceTexture) {
            fillMat.current.opacity = 0.88 + h * 0.08;
          } else if (isProminent) {
            fillMat.current.opacity = 0.12 + h * 0.2;
          } else {
            fillMat.current.opacity = 0.05 + h * 0.14;
          }
        }
        if (lineMat.current) {
          if (isProminent && !entranceTexture) {
            lineMat.current.opacity = 0.24 + h * 0.42;
          } else {
            lineMat.current.opacity = 0.12 + h * 0.38;
          }
        }
      }
      return;
    }

    const t = state.clock.elapsedTime;
    let handoffT = 1;
    if (hasHandoff && progressRef) {
      handoffT = THREE.MathUtils.smoothstep(progressRef.current, 0, GALLERY_HANDOFF_END);
    }
    const bobRaw = Math.sin(t * 0.42 + floatPhase) * (kind === "float" ? 0.022 : 0.01);
    const bob = bobRaw * handoffT;

    const baseWorld = basePos.clone();
    baseWorld.y += 1.38 + bob;

    const worldPos = baseWorld;

    if (group.current) {
      group.current.position.copy(worldPos);
      hover.current += (targetHover.current - hover.current) * 0.06;
      const h = hover.current;
      const s = (1 + h * 0.055) * (isProminent ? 1.05 : 1);
      group.current.scale.setScalar(s);
      const look = camera.position.clone();
      group.current.lookAt(look.x, group.current.position.y * 0.98 + 0.15, look.z);

      if (fillMat.current) {
        if (entranceTexture) {
          fillMat.current.opacity = THREE.MathUtils.lerp(0.38, 0.94, handoffT) + h * 0.08;
        } else if (isProminent) {
          fillMat.current.opacity = 0.12 + h * 0.22;
        } else {
          fillMat.current.opacity = 0.05 + h * 0.14;
        }
      }
      if (lineMat.current) {
        if (entranceTexture) {
          lineMat.current.opacity = THREE.MathUtils.lerp(0.05, 0.14, handoffT) + h * 0.36;
        } else if (isProminent) {
          lineMat.current.opacity = 0.22 + h * 0.45;
        } else {
          lineMat.current.opacity = 0.12 + h * 0.38;
        }
      }
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!group.current) return;
    const wp = new THREE.Vector3();
    group.current.getWorldPosition(wp);
    const dir = camera.position.clone().sub(wp).normalize();
    const endCam = wp.clone().sub(dir.clone().multiplyScalar(2.05));
    endCam.y += 0.06;
    beginNavigation(anchor, endCam, wp.clone());
  };

  const hitPlane = isProminent ? ([1.72, 1.06] as const) : ([1.65, 1.05] as const);
  const photoPlane = entranceTexture ? ([1.78, 0.96] as const) : ([1.5, 0.92] as const);

  return (
    <group ref={group}>
      <mesh
        onPointerEnter={() => {
          targetHover.current = 1;
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          targetHover.current = 0;
          document.body.style.cursor = "default";
        }}
        onClick={onClick}
      >
        <planeGeometry args={hitPlane} />
        <meshBasicMaterial color={PAPER} transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={photoPlane} />
        <meshBasicMaterial
          ref={fillMat}
          map={entranceTexture ?? undefined}
          color={entranceTexture ? "#ffffff" : ALMOND}
          transparent
          opacity={entranceTexture ? 0.9 : isProminent ? 0.14 : 0.05}
          depthWrite={false}
          toneMapped={!entranceTexture}
        />
      </mesh>
      <group position={[0, 0, 0.04]}>
        <lineSegments>
          <edgesGeometry args={[edgeGeo]} />
          <lineBasicMaterial
            ref={lineMat}
            color={SKETCH}
            transparent
            opacity={isProminent ? 0.22 : 0.12}
            toneMapped={false}
          />
        </lineSegments>
      </group>
      <Html
        transform
        distanceFactor={5.2}
        position={[0, -0.12, 0.08]}
        style={{
          width: 200,
          textAlign: "center",
          pointerEvents: "none",
          userSelect: "none",
          opacity: entranceTexture ? 0.35 : 1,
        }}
      >
        <div
          style={{
            fontFamily: "var(--body-font-family, Georgia, serif)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: INK,
            opacity: 0.55,
            lineHeight: 1.45,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--body-font-family, Georgia, serif)",
            fontSize: 10,
            color: INK_SOFT,
            marginTop: 5,
            letterSpacing: "0.04em",
            fontStyle: "italic",
            opacity: 0.85,
          }}
        >
          {sub}
        </div>
      </Html>
    </group>
  );
}

function CameraDrift({ curve, progressRef }: { curve: THREE.CatmullRomCurve3; progressRef: MutableRefObject<number> }) {
  const { camera } = useThree();
  const { navRef, lookAtRef, mouseRef } = useCorridorNav();
  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const fogT = useRef(0);

  useFrame((_, dt) => {
    fogT.current += dt * 0.22;
    const scene = camera.parent as THREE.Scene | null;
    if (scene?.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = DREAM_FOG_DENSITY + Math.sin(fogT.current) * DREAM_FOG_PULSE;
    }

    const nav = navRef.current;
    if (nav.mode === "animating") {
      if (!nav.seeded) {
        nav.startPos.copy(camera.position);
        nav.startLook.copy(lookAtRef.current);
        nav.seeded = true;
      }
      nav.t += dt * 0.62;
      const u = Math.min(1, nav.t);
      const k = easeOutIn(u);
      camera.position.lerpVectors(nav.startPos, nav.endPos, k);
      lookAtRef.current.lerpVectors(nav.startLook, nav.endLook, k);
      camera.lookAt(lookAtRef.current);
      if (u >= 1) {
        const el = document.querySelector(nav.anchor);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
        nav.mode = "idle";
        nav.seeded = false;
        nav.t = 0;
      }
      return;
    }

    const p = progressRef.current;
    const u = THREE.MathUtils.lerp(0.04, 0.97, p);
    const { p: pathP, tan } = frameAt(curve, u);
    const uLook = Math.min(0.995, u + 0.07);
    const lookP = curve.getPointAt(uLook).clone().setY(1.42);

    const mx = mouseRef.current.x * 0.06;
    const my = mouseRef.current.y * 0.035;
    const side = new THREE.Vector3().crossVectors(UP, tan).normalize();
    const target = pathP.clone().setY(1.54 + my);
    target.add(side.clone().multiplyScalar(mx));

    if (smoothPos.current.lengthSq() < 1e-6) {
      smoothPos.current.copy(target);
      smoothLook.current.copy(lookP);
    }

    smoothPos.current.lerp(target, 0.052);
    smoothLook.current.lerp(lookP, 0.05);
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
    lookAtRef.current.copy(smoothLook.current);
  });

  return null;
}

/** Warm diffuse pools along the path — salon wash, not colored sci-fi accents. */
function GalleryWashLights({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const pts = useMemo(() => {
    const us = [0.1, 0.24, 0.38, 0.52, 0.65, 0.78, 0.9];
    return us.map((u) => curve.getPointAt(u).clone().setY(2.52));
  }, [curve]);
  return (
    <group>
      {pts.map((p, i) => (
        <pointLight
          key={`wash-${i}`}
          position={[p.x, p.y, p.z]}
          intensity={0.22}
          distance={78}
          decay={2}
          color={MUSEUM_WASH_PALETTE[i % MUSEUM_WASH_PALETTE.length]}
        />
      ))}
      <pointLight position={[1.1, 3.05, -18]} intensity={0.14} distance={120} decay={2} color="#fff6eb" />
    </group>
  );
}

/** Soft warm edge falloff — luminous cream, not grey or violet. */
function MuseumVignette() {
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(256, 256, 120, 256, 256, 276);
    g.addColorStop(0, "rgba(255, 252, 246, 0)");
    g.addColorStop(0.55, "rgba(255, 245, 232, 0.06)");
    g.addColorStop(1, "rgba(235, 218, 198, 0.14)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame(({ camera }) => {
    const m = meshRef.current;
    if (!m || !map) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    m.position.copy(camera.position).addScaledVector(dir, 2.35);
    m.quaternion.copy(camera.quaternion);
  });

  if (!map) return null;
  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={3200}>
      <planeGeometry args={[19, 12]} />
      <meshBasicMaterial
        map={map}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function WonderlandHall({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const curve = useMemo(() => createGalleryCurve(), []);
  const entranceTex = useTexture(LETTER_TO_PHOTOGRAPHY_IMAGE);
  const exitPaintingTex = useTexture(PHOTOGRAPHY_EXIT_TRANSITION_IMAGE);
  const { scene } = useThree();

  useLayoutEffect(() => {
    entranceTex.colorSpace = THREE.SRGBColorSpace;
    entranceTex.needsUpdate = true;
    exitPaintingTex.colorSpace = THREE.SRGBColorSpace;
    exitPaintingTex.needsUpdate = true;
    exitPaintingTex.anisotropy = 8;
  }, [entranceTex, exitPaintingTex]);

  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(LUMEN, DREAM_FOG_DENSITY);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <color attach="background" args={[PAPER]} />
      <hemisphereLight args={["#fffaf3", "#f5ebe0", 0.84]} />
      <ambientLight intensity={0.96} color="#fffaf5" />
      <directionalLight position={[-5.5, 14.5, 7.5]} intensity={0.34} color="#fff6e8" castShadow={false} />
      <directionalLight position={[7, 4.5, -4.5]} intensity={0.15} color="#fff2e0" castShadow={false} />

      <GalleryWashLights curve={curve} />
      <CameraDrift curve={curve} progressRef={progressRef} />

      <CurvedShell curve={curve} />
      <CeilingGlowPanels curve={curve} />
      <WonderlandSparkles curve={curve} />
      <ArchitecturalSketchLines curve={curve} />
      <WallStorySketches curve={curve} />
      <FloorSpaceGuides curve={curve} />
      <FloorSketchLines curve={curve} />
      <WallVeilLines curve={curve} />
      <SoftEntrance curve={curve} progressRef={progressRef} />
      <GalleryBench3D curve={curve} />
      <PaperCurtainPiece curve={curve} />

      {WHISPER_FRAMES.map((w, idx) => (
        <WhisperFrame
          key={"whisper-" + String(idx)}
          curve={curve}
          u={w.u}
          wall={w.wall}
          scale={w.scale}
          title={w.title}
        />
      ))}

      {MEMORY_MARKERS.map((m, i) => (
        <MemoryPiece
          key={m.anchor}
          curve={curve}
          anchor={m.anchor}
          label={m.label}
          sub={m.sub}
          u={m.u}
          kind={m.kind}
          wall={m.wall}
          floatPhase={i * 1.7}
          entranceTexture={m.anchor === "#photography" ? entranceTex : null}
          progressRef={m.anchor === "#photography" ? progressRef : undefined}
          visualWeight={m.anchor === "#archive" ? "prominent" : undefined}
        />
      ))}

      <GalleryEndTransition curve={curve} texture={exitPaintingTex} progressRef={progressRef} />
      <MuseumVignette />
    </>
  );
}

export default function GalleryCorridorCanvas({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      camera={{ fov: 46, near: 0.05, far: 160, position: [0, 1.55, 8] }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
    >
      <Suspense fallback={null}>
        <WonderlandHall progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
