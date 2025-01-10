"use client"
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei'
import { useEffect } from 'react'

const SquatModel = () => {
  const { scene, animations } = useGLTF('/Mma Kick.gltf') // Note: path should be relative to public
  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    if (actions?.squat) {
      actions.squat.play()
    }
  }, [actions])

  return <primitive object={scene} scale={1.5} />
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} />
      <SquatModel />
      <OrbitControls />
    </Canvas>
  )
}