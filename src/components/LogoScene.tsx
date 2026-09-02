"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

/** how much of the viewport the logo is allowed to take up */
const FIT_W = 0.78;
const FIT_H = 0.38;

function Logo() {
  const gltf = useLoader(GLTFLoader, "/tropify.glb");
  const group = useRef<THREE.Group>(null);

  const viewport = useThree((state) => state.viewport);

  const { object, offset, size } = useMemo(() => {
    const object = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(object);
    return {
      object,
      offset: box.getCenter(new THREE.Vector3()).negate(),
      size: box.getSize(new THREE.Vector3()),
    };
  }, [gltf]);

  // fit to whichever axis runs out first, so it never crops on a tall phone
  const scale = Math.min(
    (viewport.width * FIT_W) / size.x,
    (viewport.height * FIT_H) / size.y,
  );

  const lift = viewport.height * 0.05;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    // slow drift rather than a full spin — the logo has to stay readable
    group.current.rotation.y = Math.sin(t * 0.22) * 0.32;
    group.current.rotation.x = Math.sin(t * 0.17) * 0.06;
    // lift it off the tagline on short/landscape viewports
    group.current.position.y = lift + Math.sin(t * 0.45) * 0.07;
  });

  return (
    <group ref={group} scale={scale}>
      <primitive object={object} position={offset.toArray()} />
    </group>
  );
}

export function LogoScene({ className }: { className?: string }) {
  // R3F does not forward className to its wrapper element, so the layer
  // has to be positioned by a div we own.
  return (
    <div className={className} data-html2canvas-ignore>
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 5], fov: 42 }}
      >
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#bfe9ff", "#2b1a00", 1.0]} />
        <directionalLight position={[4, 5, 6]} intensity={2.4} />
        <directionalLight position={[-5, 2, -4]} intensity={1.1} color="#4fd1c5" />
        <pointLight position={[0, -3, 3]} intensity={18} distance={14} color="#ffb257" />
        <Suspense fallback={null}>
          <Logo />
        </Suspense>
      </Canvas>
    </div>
  );
}
