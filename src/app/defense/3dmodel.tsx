"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface FBXViewerProps {
  modelPath: string;
  width?: number;
  height?: number;
}

const FBXViewer: React.FC<FBXViewerProps> = ({
  modelPath,
  width = 800,
  height = 600,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xffffff); // White background

    // Camera setup with adjusted position for better centering
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 100, 150); // Adjusted camera position

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup with adjusted settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 75, 0); // Adjust target height
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 50;
    controls.update();

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Ground plane with better material
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({
        color: 0xf0f0f0,
        shininess: 10,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load FBX model with centered positioning
    const loader = new FBXLoader();
    loader.load(modelPath, (fbx) => {
      // Calculate appropriate scale
      const bbox = new THREE.Box3().setFromObject(fbx);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 150 / maxDim; // Adjust this value to change model size
      fbx.scale.setScalar(scale);

      fbx.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Center the model
      bbox.setFromObject(fbx);
      const center = bbox.getCenter(new THREE.Vector3());
      fbx.position.sub(new THREE.Vector3(center.x, bbox.min.y, center.z));

      scene.add(fbx);

      // Setup animation if available
      if (fbx.animations.length) {
        mixerRef.current = new THREE.AnimationMixer(fbx);
        const action = mixerRef.current.clipAction(fbx.animations[0]);
        action.play();
      }

      // Update controls to focus on model
      controls.target.copy(new THREE.Vector3(0, bbox.max.y / 2, 0));
      controls.update();
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current && clockRef.current) {
        mixerRef.current.update(clockRef.current.getDelta());
      }

      controls.update(); // Update controls in animation loop
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [modelPath, width, height]);

  return <div ref={mountRef} className="flex items-center justify-center" />;
};

export default FBXViewer;
