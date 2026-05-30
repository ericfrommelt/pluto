import { Canvas } from "@react-three/fiber";

export default function ThreeOne() {
    return <Canvas>
        <mesh>
            <boxGeometry args={[2, 2, 2]}/>
            <meshStandardMaterial color="red" />
        </mesh>
        <directionalLight position={[0, 10, 5]} intensity={1.5} />
    </Canvas>
}