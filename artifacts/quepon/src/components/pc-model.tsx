import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, PresentationControls, Environment, PerspectiveCamera, Float } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/ggx3d.glb");
  return <primitive object={scene} scale={1.5} />;
}

export function PCModel() {
  return (
    <div className="w-full h-full min-h-[300px]">
      {/* @ts-ignore */}
      <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage intensity={0.5} environment="city" adjustCamera={1.2}>
            <Model />
          </Stage>
          <OrbitControls 
            enableZoom={true} 
            autoRotate={true} 
            autoRotateSpeed={0.5}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            makeDefault
          />
        </Suspense>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
