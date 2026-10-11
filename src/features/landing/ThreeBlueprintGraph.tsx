'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBlueprintGraphProps {
  reducedMotion?: boolean;
}

export const ThreeBlueprintGraph: React.FC<ThreeBlueprintGraphProps> = ({ reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const isReduced = reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.035);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 18);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Central ember point light + cool rim directional light)
    const emberLight = new THREE.PointLight(0xff6b2c, 4, 30);
    emberLight.position.set(0, 0, 0);
    scene.add(emberLight);

    const coolRimLight = new THREE.DirectionalLight(0xa5b4fc, 0.9);
    coolRimLight.position.set(10, 15, 10);
    scene.add(coolRimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // 4. Procedural Nodes (50 nodes surrounding central ember node)
    const nodeCount = 50;
    const nodePositions: THREE.Vector3[] = [];
    const basePositions: THREE.Vector3[] = [];
    const targetGridPositions: THREE.Vector3[] = [];

    // Central Ember Node
    const centerGeometry = new THREE.SphereGeometry(0.75, 32, 32);
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b2c,
      emissive: 0xff4500,
      emissiveIntensity: 2.5,
      roughness: 0.15,
      metalness: 0.8,
    });
    const centerNode = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerNode);

    // Node geometry & instanced meshes
    const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const boxGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe4e4e7,
      emissive: 0x27272a,
      emissiveIntensity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    });

    const sphereMesh = new THREE.InstancedMesh(sphereGeo, glassMaterial, 25);
    const boxMesh = new THREE.InstancedMesh(boxGeo, glassMaterial, 25);
    scene.add(sphereMesh);
    scene.add(boxMesh);

    const dummy = new THREE.Object3D();

    // Generate positions (Scatter vs Lattice)
    for (let i = 0; i < nodeCount; i++) {
      const radius = 3.5 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = radius * Math.sin(phi);
      const z = radius * Math.sin(theta) * Math.cos(phi);

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos.clone());
      basePositions.push(pos.clone());

      // Grid position for scroll transition
      const gx = ((i % 5) - 2) * 2.4;
      const gy = (Math.floor((i % 25) / 5) - 2) * 2.2;
      const gz = (Math.floor(i / 25) - 0.5) * 3;
      targetGridPositions.push(new THREE.Vector3(gx, gy, gz));
    }

    // 5. Connections (Links between proximate nodes)
    const linkPositions: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      // Connect to center if close
      if (basePositions[i].length() < 6) {
        linkPositions.push(0, 0, 0);
        linkPositions.push(basePositions[i].x, basePositions[i].y, basePositions[i].z);
      }
      // Connect to neighbors
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = basePositions[i].distanceTo(basePositions[j]);
        if (dist < 3.2) {
          linkPositions.push(basePositions[i].x, basePositions[i].y, basePositions[i].z);
          linkPositions.push(basePositions[j].x, basePositions[j].y, basePositions[j].z);
        }
      }
    }

    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linkPositions, 3)
    );

    const linkMaterial = new THREE.LineBasicMaterial({
      color: 0xff6b2c,
      transparent: true,
      opacity: 0.35,
    });

    const linksLine = new THREE.LineSegments(linkGeometry, linkMaterial);
    scene.add(linksLine);

    // 6. Interaction: Mouse parallax & Pointer proximity
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 7. Scroll listener: Interpolates camera and node layout through scenes
    let scrollProgress = 0;
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 8. Visibility / Offscreen Pause optimization
    let isRendering = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isRendering = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleVisibilityChange = () => {
      isRendering = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isRendering) return;

      const elapsedTime = clock.getElapsedTime();

      if (!isReduced) {
        // Idle drift
        centerNode.rotation.y = elapsedTime * 0.4;
        centerNode.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15;

        // Camera parallax smoothing
        targetCameraX = mouseX * 2.2;
        targetCameraY = -mouseY * 1.5;
        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;

        // Camera scroll trajectory through scenes
        camera.position.z = 18 - scrollProgress * 7;
        camera.lookAt(0, 0, 0);

        // Gentle node oscillation
        for (let i = 0; i < nodeCount; i++) {
          const base = basePositions[i];
          const grid = targetGridPositions[i];
          const current = nodePositions[i];

          // Blend from scatter to grid depending on scroll
          current.lerpVectors(base, grid, Math.min(scrollProgress * 1.5, 1));
          current.y += Math.sin(elapsedTime * 1.5 + i) * 0.004;

          dummy.position.copy(current);
          dummy.rotation.x = elapsedTime * 0.2 + i;
          dummy.rotation.y = elapsedTime * 0.3 + i;
          dummy.updateMatrix();

          if (i < 25) {
            sphereMesh.setMatrixAt(i, dummy.matrix);
          } else {
            boxMesh.setMatrixAt(i - 25, dummy.matrix);
          }
        }
        sphereMesh.instanceMatrix.needsUpdate = true;
        boxMesh.instanceMatrix.needsUpdate = true;
      } else {
        // Static render for reduced-motion
        camera.position.set(0, 0, 16);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup and resource disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js GPU resources
      centerGeometry.dispose();
      centerMaterial.dispose();
      sphereGeo.dispose();
      boxGeo.dispose();
      glassMaterial.dispose();
      linkGeometry.dispose();
      linkMaterial.dispose();
      renderer.dispose();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    />
  );
};
