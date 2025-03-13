import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { QubitState } from "../../types/quantum";

interface BlochSphereProps {
  qubitStates: QubitState[];
  selectedQubit?: number;
}

const BlochSphere: React.FC<BlochSphereProps> = ({
  qubitStates,
  selectedQubit = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Store a reference to the current DOM node
    const currentMount = mountRef.current;

    // Set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Create Bloch sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Add axes
    const axesHelper = new THREE.AxesHelper(1.2);
    scene.add(axesHelper);

    // Add axis labels
    const addAxisLabel = (
      text: string,
      position: THREE.Vector3,
      color: number
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(0.3, 0.3, 0.3);
        scene.add(sprite);
      }
    };

    addAxisLabel("X", new THREE.Vector3(1.3, 0, 0), 0xff0000);
    addAxisLabel("Y", new THREE.Vector3(0, 1.3, 0), 0x00ff00);
    addAxisLabel("Z", new THREE.Vector3(0, 0, 1.3), 0x0000ff);

    // Add state vectors for each qubit
    qubitStates.forEach((qubitState, index) => {
      if (selectedQubit !== undefined && index !== selectedQubit) return;

      const { x, y, z } = qubitState.coordinates;

      // Normalize the vector
      const length = Math.sqrt(x * x + y * y + z * z);
      const normalizedX = x / length;
      const normalizedY = y / length;
      const normalizedZ = z / length;

      // Create arrow for state vector
      const arrowDir = new THREE.Vector3(normalizedX, normalizedY, normalizedZ);
      const arrowOrigin = new THREE.Vector3(0, 0, 0);
      const arrowLength = 1;
      const arrowColor = 0xffff00;

      const arrowHelper = new THREE.ArrowHelper(
        arrowDir,
        arrowOrigin,
        arrowLength,
        arrowColor,
        0.1,
        0.05
      );
      scene.add(arrowHelper);

      // Add a point at the end of the vector
      const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const pointMaterial = new THREE.MeshBasicMaterial({ color: arrowColor });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(normalizedX, normalizedY, normalizedZ);
      scene.add(point);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Start animation
    const animationId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      if (!currentMount) return;

      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      // Use the stored reference in the cleanup function
      if (currentMount) {
        if (renderer.domElement.parentNode === currentMount) {
          currentMount.removeChild(renderer.domElement);
        }
      }

      // Dispose of resources
      scene.clear();
      renderer.dispose();
    };
  }, [qubitStates, selectedQubit]); // Include all dependencies

  return (
    <div
      ref={mountRef}
      className="w-full h-full bloch-sphere-container"
      style={{ minHeight: "200px" }}
    />
  );
};

export default BlochSphere;
