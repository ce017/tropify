"use client";

// pmndrs/examples — cards-with-border-radius, ported as-is.
// Source: https://github.com/pmndrs/examples/tree/main/examples/cards-with-border-radius
// Original credit: https://cydstumpel.nl/
//
// Only change from upstream: Vite's `import.meta.env.BASE_URL` is not a thing
// in Next, so the asset URLs are plain /cards/* paths from public/.

import * as THREE from "three";
import { useRef, useState, type RefObject } from "react";
import {
  Canvas,
  useFrame,
  type ThreeElements,
  type ThreeEvent,
} from "@react-three/fiber";
import { Image, Environment, useTexture } from "@react-three/drei";
import { easing } from "maath";
import "@/lib/cardsUtil";
import type { MeshSineMaterial } from "@/lib/cardsUtil";

/** 0 -> 1 across the pinned section. Upstream used drei's <ScrollControls>,
 *  which owns its own scroll container — that makes it impossible to pin the
 *  section to the page and hand scrolling back afterwards, so the carousel is
 *  driven by document scroll instead. Everything else is untouched. */
export type Progress = RefObject<number>;

export const Cards = ({ progress }: { progress?: Progress }) => {
  const fallback = useRef(0);
  const p = progress ?? fallback;
  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 15 }} gl={{ alpha: true }}>
      <fog attach="fog" args={["#a79", 8.5, 12]} />
      <Rig progress={p} rotation={[0, 0, 0.15]}>
        <Carousel />
      </Rig>
      <Banner progress={p} position={[0, -0.15, 0]} />
      {/* upstream passes `background` here; dropped so the cloud field
          stays visible behind the carousel. Lighting is unchanged. */}
      <Environment preset="dawn" blur={0.5} />
    </Canvas>
  );
};

function Rig({ progress, ...props }: ThreeElements["group"] & { progress: Progress }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    ref.current.rotation.y = -(progress.current ?? 0) * (Math.PI * 2); // Rotate contents
    state.events.update?.(); // Raycasts every frame rather than on pointer-move
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta,
    ); // Move camera
    state.camera.lookAt(0, 0, 0); // Look at center
  });
  return <group ref={ref} {...props} />;
}

function Carousel({ radius = 1.4, count = 8 }: { radius?: number; count?: number }) {
  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      url={`/cards/img${Math.floor(i % 10) + 1}_.jpg`}
      position={[
        Math.sin((i / count) * Math.PI * 2) * radius,
        0,
        Math.cos((i / count) * Math.PI * 2) * radius,
      ]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ));
}

function Card({
  url,
  ...props
}: { url: string } & Pick<ThreeElements["mesh"], "position" | "rotation">) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);
  useFrame((state, delta) => {
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(ref.current.material, "radius", hovered ? 0.25 : 0.1, 0.2, delta);
    easing.damp(ref.current.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
  });
  return (
    <Image
      ref={ref}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
    >
      <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
    </Image>
  );
}

function Banner({ progress, ...props }: ThreeElements["mesh"] & { progress: Progress }) {
  const ref = useRef<THREE.Mesh<THREE.BufferGeometry, MeshSineMaterial>>(null!);
  const texture = useTexture("/cards/tropify-banner.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const last = useRef(0);
  useFrame((state, delta) => {
    // upstream used scroll.delta for the ripple; same thing, from page scroll
    const now = progress.current ?? 0;
    ref.current.material.time.value += Math.abs(now - last.current) * 40;
    last.current = now;
    ref.current.material.map!.offset.x += delta / 2;
  });
  return (
    <mesh ref={ref} {...props}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial
        map={texture}
        map-anisotropy={16}
        /* 970x144 strip, band circumference 2*pi*1.6 and height 0.14 —
           11 tiles keeps the wordmark undistorted */
        map-repeat={[11, 1]}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
