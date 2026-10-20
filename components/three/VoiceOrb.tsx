"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 16000;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform float uScroll;
  uniform vec3 uMouse;
  uniform float uSize;
  attribute float aSeed;
  varying float vMix;
  varying float vAlpha;

  // Cheap 3D value-ish noise from sines; plenty for organic motion.
  float n(vec3 p) {
    return sin(p.x * 1.7 + uTime * 0.8) * sin(p.y * 1.9 - uTime * 0.6) * sin(p.z * 1.5 + uTime * 0.7);
  }

  void main() {
    vec3 dir = normalize(position);
    float wave = n(dir * 2.6) * 0.5 + n(dir * 5.2) * 0.25;
    float radius = 1.35 + wave * (0.12 + uPulse * 0.55);

    // Cursor repels nearby particles.
    vec3 p = dir * radius;
    float d = distance(p, uMouse);
    p += dir * smoothstep(1.1, 0.0, d) * 0.28;

    // Scrolling scatters the sphere outward.
    p += dir * uScroll * (1.5 + aSeed * 3.5);
    p.y += uScroll * (aSeed - 0.5) * 2.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aSeed * 0.8 + uPulse * 0.6) * (1.0 / -mv.z);

    vMix = dir.y * 0.5 + 0.5 + wave * 0.4;
    vAlpha = (1.0 - uScroll) * (0.22 + aSeed * 0.25);
  }
`;

const fragment = /* glsl */ `
  varying float vMix;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    vec3 blue = vec3(0.62, 0.64, 0.66);
    vec3 purple = vec3(0.95, 0.92, 0.86);
    vec3 pink = vec3(0.80, 0.66, 0.45);
    vec3 col = mix(blue, purple, smoothstep(0.2, 0.6, vMix));
    col = mix(col, pink, smoothstep(0.6, 1.0, vMix));
    gl_FragColor = vec4(col, soft * vAlpha);
  }
`;

type Props = {
  /** 0..1 scatter amount (hero scroll). */
  scroll?: React.MutableRefObject<number>;
  /** Live loudness 0..1. When given, the orb follows it instead of the built-in simulated speech. */
  level?: React.MutableRefObject<number>;
};

const ZERO = { current: 0 };

function Particles({ scroll = ZERO, level }: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const mouse = useRef(new THREE.Vector3(10, 10, 10));

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    // Seeded PRNG keeps the render pure and the sphere identical between renders.
    let a = 1337;
    const rand = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      positions.set([Math.cos(t) * r, y, Math.sin(t) * r], i * 3);
      seeds[i] = rand();
    }
    return { positions, seeds };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector3(10, 10, 10) },
      uSize: { value: 38 },
    }),
    [],
  );

  useFrame((state, dt) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    u.uTime.value += dt;
    // Simulated "speech" amplitude: layered sines gated by a slow envelope, so it breathes like talking.
    const t = u.uTime.value;
    const envelope = Math.max(0, Math.sin(t * 0.7) * 0.6 + 0.4);
    const target = level
      ? Math.min(1, level.current * 0.9)
      : envelope * (0.35 + 0.35 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1)));
    u.uPulse.value += (target - u.uPulse.value) * Math.min(1, dt * 8);
    u.uScroll.value += (scroll.current - u.uScroll.value) * Math.min(1, dt * 6);

    // Project pointer onto the sphere's near side, in the group's local space.
    const px = state.pointer.x * 1.8;
    const py = state.pointer.y * 1.8;
    mouse.current.set(px, py, 1.2);
    u.uMouse.value.lerp(mouse.current, Math.min(1, dt * 6));

    if (group.current) {
      group.current.rotation.y += dt * 0.12;
      group.current.rotation.x += (state.pointer.y * 0.25 - group.current.rotation.x) * Math.min(1, dt * 3);
    }
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={mat}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function VoiceOrb({ scroll, level }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Particles scroll={scroll} level={level} />
    </Canvas>
  );
}
