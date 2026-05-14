import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, Environment, PerspectiveCamera, Float } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/ggx3d.glb");
  return <primitive object={scene} scale={1.5} />;
}

export function PCModel() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <Stage intensity={0.5} environment="city" adjustCamera={1.2}>
                <Model />
              </Stage>
            </PresentationControls>
          </Float>
        </Suspense>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/ggx3d.glb");
