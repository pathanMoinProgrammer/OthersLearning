// 'use client';
// import React, { useRef, useEffect, useState, useCallback } from 'react';
// import * as THREE from 'three';

// const TunnelRushGame = () => {
//   const mountRef = useRef(null);
//   const sceneRef = useRef(null);
//   const rendererRef = useRef(null);
//   const cameraRef = useRef(null);
//   const playerRef = useRef(null);
//   const tunnelGroupRef = useRef(null);
//   const obstaclesGroupRef = useRef(null);
//   const particlesRef = useRef(null);
//   const audioContextRef = useRef(null);
  
//   const gameStateRef = useRef({
//     isPlaying: false,
//     isPaused: false,
//     speed: 0.15,
//     baseSpeed: 0.15,
//     score: 0,
//     lives: 3,
//     level: 1,
//     playerPosition: { x: 0, y: 0 },
//     keys: { left: false, right: false, up: false, down: false },
//     tunnelRotation: 0,
//     cameraShake: 0,
//     powerUps: [],
//     particles: []
//   });
  
//   const [gameState, setGameState] = useState({
//     isPlaying: false,
//     isPaused: false,
//     score: 0,
//     lives: 3,
//     level: 1,
//     gameOver: false,
//     highScore: 0
//   });

//   // Load high score from localStorage (if available in real environment)
//   const loadHighScore = () => {
//     try {
//       return parseInt(localStorage.getItem('tunnelRushHighScore') || '0');
//     } catch {
//       return 0;
//     }
//   };

//   const saveHighScore = (score) => {
//     try {
//       localStorage.setItem('tunnelRushHighScore', score.toString());
//     } catch {
//       // localStorage not available
//     }
//   };

//   // Audio system (Web Audio API)
//   const createAudioContext = () => {
//     try {
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       audioContextRef.current = audioContext;
//     } catch (e) {
//       console.log('Web Audio API not supported');
//     }
//   };

//   const playSound = (frequency, duration, type = 'sine') => {
//     if (!audioContextRef.current) return;
    
//     const oscillator = audioContextRef.current.createOscillator();
//     const gainNode = audioContextRef.current.createGain();
    
//     oscillator.connect(gainNode);
//     gainNode.connect(audioContextRef.current.destination);
    
//     oscillator.frequency.value = frequency;
//     oscillator.type = type;
    
//     gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
//     oscillator.start(audioContextRef.current.currentTime);
//     oscillator.stop(audioContextRef.current.currentTime + duration);
//   };

//   // Initialize Three.js scene
//   const initScene = useCallback(() => {
//     if (!mountRef.current) return;

//     // Scene setup
//     const scene = new THREE.Scene();
//     scene.fog = new THREE.Fog(0x000022, 5, 100);
//     sceneRef.current = scene;

//     // Camera setup
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       mountRef.current.clientWidth / mountRef.current.clientHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(0, 0, 8);
//     cameraRef.current = camera;

//     // Renderer setup
//     const renderer = new THREE.WebGLRenderer({ 
//       antialias: true,
//       powerPreference: "high-performance"
//     });
//     renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.setClearColor(0x000022);
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     mountRef.current.appendChild(renderer.domElement);
//     rendererRef.current = renderer;

//     // Lighting setup
//     const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0x88ccff, 1.2);
//     directionalLight.position.set(10, 10, 5);
//     directionalLight.castShadow = true;
//     directionalLight.shadow.mapSize.width = 2048;
//     directionalLight.shadow.mapSize.height = 2048;
//     scene.add(directionalLight);

//     // Point lights for dynamic lighting
//     const pointLight1 = new THREE.PointLight(0xff4444, 1, 50);
//     pointLight1.position.set(5, 5, -10);
//     scene.add(pointLight1);

//     const pointLight2 = new THREE.PointLight(0x44ff44, 1, 50);
//     pointLight2.position.set(-5, -5, -20);
//     scene.add(pointLight2);

//     // Create player (advanced sphere with glow effect)
//     const playerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
//     const playerMaterial = new THREE.MeshPhongMaterial({ 
//       color: 0x00ff88,
//       emissive: 0x004422,
//       shininess: 100,
//       transparent: true,
//       opacity: 0.9
//     });
//     const player = new THREE.Mesh(playerGeometry, playerMaterial);
//     player.position.set(0, 0, 5);
//     player.castShadow = true;
//     scene.add(player);
//     playerRef.current = player;

//     // Add player glow effect
//     const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
//     const glowMaterial = new THREE.MeshBasicMaterial({
//       color: 0x00ff88,
//       transparent: true,
//       opacity: 0.3
//     });
//     const playerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
//     player.add(playerGlow);

//     // Create tunnel group
//     const tunnelGroup = new THREE.Group();
//     scene.add(tunnelGroup);
//     tunnelGroupRef.current = tunnelGroup;

//     // Create obstacles group
//     const obstaclesGroup = new THREE.Group();
//     scene.add(obstaclesGroup);
//     obstaclesGroupRef.current = obstaclesGroup;

//     // Create particle system
//     const particleGeometry = new THREE.BufferGeometry();
//     const particleCount = 1000;
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);
    
//     for (let i = 0; i < particleCount; i++) {
//       positions[i * 3] = (Math.random() - 0.5) * 100;
//       positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
//       positions[i * 3 + 2] = Math.random() * -200;
      
//       const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.8);
//       colors[i * 3] = color.r;
//       colors[i * 3 + 1] = color.g;
//       colors[i * 3 + 2] = color.b;
//     }
    
//     particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
//     const particleMaterial = new THREE.PointsMaterial({
//       size: 0.1,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.8
//     });
    
//     const particles = new THREE.Points(particleGeometry, particleMaterial);
//     scene.add(particles);
//     particlesRef.current = particles;

//     // Initialize game elements
//     createTunnel();
//     createObstacles();
//     createAudioContext();

//     return () => {
//       if (mountRef.current && renderer.domElement) {
//         mountRef.current.removeChild(renderer.domElement);
//       }
//       renderer.dispose();
//     };
//   }, []);

//   // Create advanced tunnel system
//   const createTunnel = () => {
//     const tunnelGroup = tunnelGroupRef.current;
//     if (!tunnelGroup) return;

//     // Clear existing tunnel
//     while (tunnelGroup.children.length > 0) {
//       tunnelGroup.remove(tunnelGroup.children[0]);
//     }

//     for (let i = 0; i < 50; i++) {
//       // Main tunnel ring
//       const ringGeometry = new THREE.TorusGeometry(4, 0.2, 8, 16);
//       const hue = (i * 0.05 + Date.now() * 0.0001) % 1;
//       const ringMaterial = new THREE.MeshPhongMaterial({ 
//         color: new THREE.Color().setHSL(hue, 0.8, 0.6),
//         emissive: new THREE.Color().setHSL(hue, 0.4, 0.1),
//         transparent: true,
//         opacity: 0.8
//       });
//       const ring = new THREE.Mesh(ringGeometry, ringMaterial);
//       ring.position.z = -i * 4;
//       ring.rotation.z = i * 0.1;
//       tunnelGroup.add(ring);

//       // Add tunnel segments (hexagonal)
//       if (i % 2 === 0) {
//         const segmentGeometry = new THREE.CylinderGeometry(3.8, 3.8, 0.5, 6);
//         const segmentMaterial = new THREE.MeshPhongMaterial({
//           color: new THREE.Color().setHSL(hue + 0.1, 0.6, 0.3),
//           transparent: true,
//           opacity: 0.4,
//           wireframe: true
//         });
//         const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
//         segment.position.z = -i * 4;
//         segment.rotation.z = i * 0.2;
//         tunnelGroup.add(segment);
//       }
//     }
//   };

//   // Create diverse obstacles
//   const createObstacles = () => {
//     const obstaclesGroup = obstaclesGroupRef.current;
//     if (!obstaclesGroup) return;

//     // Clear existing obstacles
//     while (obstaclesGroup.children.length > 0) {
//       obstaclesGroup.remove(obstaclesGroup.children[0]);
//     }

//     const obstacleTypes = ['box', 'sphere', 'pyramid', 'torus'];
    
//     for (let i = 0; i < 30; i++) {
//       if (Math.random() > 0.4) { // 60% chance to spawn obstacle
//         const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
//         let obstacleGeometry;
        
//         switch(type) {
//           case 'box':
//             obstacleGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
//             break;
//           case 'sphere':
//             obstacleGeometry = new THREE.SphereGeometry(0.4, 16, 16);
//             break;
//           case 'pyramid':
//             obstacleGeometry = new THREE.ConeGeometry(0.4, 0.8, 4);
//             break;
//           case 'torus':
//             obstacleGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
//             break;
//         }
        
//         const obstacleMaterial = new THREE.MeshPhongMaterial({ 
//           color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
//           emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.1),
//           transparent: true,
//           opacity: 0.9
//         });
        
//         const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        
//         // Position obstacles in tunnel
//         const angle = Math.random() * Math.PI * 2;
//         const radius = 1.5 + Math.random() * 1.5;
//         obstacle.position.x = Math.cos(angle) * radius;
//         obstacle.position.y = Math.sin(angle) * radius;
//         obstacle.position.z = -10 - i * 6 - Math.random() * 5;
        
//         obstacle.castShadow = true;
//         obstacle.userData = { type, originalZ: obstacle.position.z };
//         obstaclesGroup.add(obstacle);
//       }
//     }
    
//     // Add some power-ups
//     for (let i = 0; i < 5; i++) {
//       const powerUpGeometry = new THREE.OctahedronGeometry(0.3);
//       const powerUpMaterial = new THREE.MeshPhongMaterial({
//         color: 0xffff00,
//         emissive: 0x444400,
//         transparent: true,
//         opacity: 0.8
//       });
//       const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
      
//       const angle = Math.random() * Math.PI * 2;
//       const radius = 1 + Math.random() * 2;
//       powerUp.position.x = Math.cos(angle) * radius;
//       powerUp.position.y = Math.sin(angle) * radius;
//       powerUp.position.z = -20 - i * 15;
      
//       powerUp.userData = { type: 'powerup', originalZ: powerUp.position.z };
//       obstaclesGroup.add(powerUp);
//     }
//   };

//   // Advanced game loop with enhanced features
//   const animate = useCallback(() => {
//     if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused) return;

//     const player = playerRef.current;
//     const camera = cameraRef.current;
//     const renderer = rendererRef.current;
//     const scene = sceneRef.current;
//     const tunnelGroup = tunnelGroupRef.current;
//     const obstaclesGroup = obstaclesGroupRef.current;
//     const particles = particlesRef.current;

//     if (!player || !camera || !renderer || !scene) return;

//     const deltaTime = 0.016; // ~60fps

//     // Update tunnel rotation
//     gameStateRef.current.tunnelRotation += 0.005;
//     if (tunnelGroup) {
//       tunnelGroup.rotation.z = gameStateRef.current.tunnelRotation;
      
//       // Move and update tunnel segments
//       tunnelGroup.children.forEach((segment, index) => {
//         segment.position.z += gameStateRef.current.speed;
//         segment.rotation.z += 0.01;
        
//         // Update colors dynamically
//         if (segment.material && segment.material.color) {
//           const hue = (Date.now() * 0.001 + index * 0.1) % 1;
//           segment.material.color.setHSL(hue, 0.8, 0.6);
//           if (segment.material.emissive) {
//             segment.material.emissive.setHSL(hue, 0.4, 0.1);
//           }
//         }
        
//         // Recycle tunnel segments
//         if (segment.position.z > 10) {
//           segment.position.z -= 200;
//         }
//       });
//     }

//     // Update obstacles and check collisions
//     if (obstaclesGroup) {
//       obstaclesGroup.children.forEach((obstacle, index) => {
//         obstacle.position.z += gameStateRef.current.speed;
        
//         // Rotate obstacles for visual appeal
//         obstacle.rotation.x += 0.02;
//         obstacle.rotation.y += 0.015;
//         obstacle.rotation.z += 0.01;
        
//         // Collision detection
//         const distance = player.position.distanceTo(obstacle.position);
//         const collisionThreshold = obstacle.userData.type === 'powerup' ? 0.5 : 0.6;
        
//         if (distance < collisionThreshold && obstacle.position.z > 4 && obstacle.position.z < 6) {
//           if (obstacle.userData.type === 'powerup') {
//             // Collect power-up
//             gameStateRef.current.score += 100;
//             playSound(800, 0.2, 'sine');
//             obstaclesGroup.remove(obstacle);
//           } else {
//             // Hit obstacle
//             gameStateRef.current.lives -= 1;
//             gameStateRef.current.cameraShake = 0.5;
//             playSound(200, 0.3, 'sawtooth');
            
//             if (gameStateRef.current.lives <= 0) {
//               // Game Over
//               gameStateRef.current.isPlaying = false;
//               const finalScore = gameStateRef.current.score;
//               const currentHighScore = loadHighScore();
//               if (finalScore > currentHighScore) {
//                 saveHighScore(finalScore);
//                 setGameState(prev => ({ ...prev, highScore: finalScore }));
//               }
//               setGameState(prev => ({ 
//                 ...prev, 
//                 isPlaying: false, 
//                 gameOver: true, 
//                 score: finalScore 
//               }));
//               return;
//             } else {
//               setGameState(prev => ({ ...prev, lives: gameStateRef.current.lives }));
//               obstaclesGroup.remove(obstacle);
//             }
//           }
//         }
        
//         // Recycle obstacles
//         if (obstacle.position.z > 10) {
//           obstacle.position.z = obstacle.userData.originalZ - 200;
//           const angle = Math.random() * Math.PI * 2;
//           const radius = 1.5 + Math.random() * 1.5;
//           obstacle.position.x = Math.cos(angle) * radius;
//           obstacle.position.y = Math.sin(angle) * radius;
//         }
//       });
//     }

//     // Update particles
//     if (particles) {
//       const positions = particles.geometry.attributes.position.array;
//       for (let i = 0; i < positions.length; i += 3) {
//         positions[i + 2] += gameStateRef.current.speed * 2;
//         if (positions[i + 2] > 20) {
//           positions[i + 2] = -200;
//         }
//       }
//       particles.geometry.attributes.position.needsUpdate = true;
//     }

//     // Player movement with smooth interpolation
//     const moveSpeed = 0.15;
//     const targetX = gameStateRef.current.keys.left ? -3 : 
//                    gameStateRef.current.keys.right ? 3 : 0;
//     const targetY = gameStateRef.current.keys.up ? 3 : 
//                    gameStateRef.current.keys.down ? -3 : 0;
    
//     // Smooth movement interpolation
//     player.position.x += (targetX - player.position.x) * 0.1;
//     player.position.y += (targetY - player.position.y) * 0.1;
    
//     // Keep player within tunnel bounds
//     const maxRadius = 3.5;
//     const currentRadius = Math.sqrt(player.position.x ** 2 + player.position.y ** 2);
//     if (currentRadius > maxRadius) {
//       const ratio = maxRadius / currentRadius;
//       player.position.x *= ratio;
//       player.position.y *= ratio;
//     }

//     // Player visual effects
//     player.rotation.z += 0.05;
//     player.material.emissive.setHSL((Date.now() * 0.003) % 1, 0.5, 0.2);

//     // Update score and level
//     gameStateRef.current.score += Math.floor(gameStateRef.current.speed * 10);
//     const newLevel = Math.floor(gameStateRef.current.score / 1000) + 1;
    
//     if (newLevel !== gameStateRef.current.level) {
//       gameStateRef.current.level = newLevel;
//       gameStateRef.current.speed = gameStateRef.current.baseSpeed + (newLevel - 1) * 0.02;
//       setGameState(prev => ({ ...prev, level: newLevel }));
//       playSound(1000, 0.1, 'sine');
//     }

//     // Update UI periodically
//     if (gameStateRef.current.score % 50 === 0) {
//       setGameState(prev => ({ ...prev, score: gameStateRef.current.score }));
//     }

//     // Camera effects
//     camera.position.x += (player.position.x * 0.1 - camera.position.x) * 0.05;
//     camera.position.y += (player.position.y * 0.1 - camera.position.y) * 0.05;
    
//     // Camera shake effect
//     if (gameStateRef.current.cameraShake > 0) {
//       camera.position.x += (Math.random() - 0.5) * gameStateRef.current.cameraShake;
//       camera.position.y += (Math.random() - 0.5) * gameStateRef.current.cameraShake;
//       gameStateRef.current.cameraShake *= 0.9;
//     }

//     // Dynamic FOV based on speed
//     camera.fov = 75 + gameStateRef.current.speed * 50;
//     camera.updateProjectionMatrix();

//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }, []);

//   // Enhanced keyboard controls
//   const handleKeyDown = useCallback((event) => {
//     event.preventDefault();
//     switch(event.key.toLowerCase()) {
//       case 'arrowleft':
//       case 'a':
//         gameStateRef.current.keys.left = true;
//         break;
//       case 'arrowright':
//       case 'd':
//         gameStateRef.current.keys.right = true;
//         break;
//       case 'arrowup':
//       case 'w':
//         gameStateRef.current.keys.up = true;
//         break;
//       case 'arrowdown':
//       case 's':
//         gameStateRef.current.keys.down = true;
//         break;
//       case ' ':
//         if (gameStateRef.current.isPlaying) {
//           togglePause();
//         }
//         break;
//       case 'r':
//         if (!gameStateRef.current.isPlaying) {
//           startGame();
//         }
//         break;
//     }
//   }, []);

//   const handleKeyUp = useCallback((event) => {
//     switch(event.key.toLowerCase()) {
//       case 'arrowleft':
//       case 'a':
//         gameStateRef.current.keys.left = false;
//         break;
//       case 'arrowright':
//       case 'd':
//         gameStateRef.current.keys.right = false;
//         break;
//       case 'arrowup':
//       case 'w':
//         gameStateRef.current.keys.up = false;
//         break;
//       case 'arrowdown':
//       case 's':
//         gameStateRef.current.keys.down = false;
//         break;
//     }
//   }, []);

//   // Game control functions
//   const startGame = () => {
//     gameStateRef.current = {
//       isPlaying: true,
//       isPaused: false,
//       speed: 0.15,
//       baseSpeed: 0.15,
//       score: 0,
//       lives: 3,
//       level: 1,
//       playerPosition: { x: 0, y: 0 },
//       keys: { left: false, right: false, up: false, down: false },
//       tunnelRotation: 0,
//       cameraShake: 0,
//       powerUps: [],
//       particles: []
//     };
    
//     if (playerRef.current) {
//       playerRef.current.position.set(0, 0, 5);
//     }
    
//     createTunnel();
//     createObstacles();
    
//     setGameState({ 
//       isPlaying: true, 
//       isPaused: false, 
//       score: 0, 
//       lives: 3, 
//       level: 1, 
//       gameOver: false,
//       highScore: loadHighScore()
//     });
    
//     playSound(440, 0.1, 'sine');
//     animate();
//   };

//   const togglePause = () => {
//     gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
//     setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
//     if (!gameStateRef.current.isPaused) {
//       animate();
//     }
//     playSound(660, 0.1, 'sine');
//   };

//   const resetGame = () => {
//     gameStateRef.current.isPlaying = false;
//     setGameState(prev => ({ 
//       ...prev, 
//       isPlaying: false, 
//       isPaused: false, 
//       gameOver: false,
//       highScore: loadHighScore()
//     }));
//   };

//   // Handle window resize
//   const handleResize = useCallback(() => {
//     if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
    
//     const width = mountRef.current.clientWidth;
//     const height = mountRef.current.clientHeight;
    
//     cameraRef.current.aspect = width / height;
//     cameraRef.current.updateProjectionMatrix();
//     rendererRef.current.setSize(width, height);
//   }, []);

//   useEffect(() => {
//     const cleanup = initScene();
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);
//     window.addEventListener('resize', handleResize);

//     // Load high score on component mount
//     setGameState(prev => ({ ...prev, highScore: loadHighScore() }));

//     return () => {
//       cleanup && cleanup();
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//       window.removeEventListener('resize', handleResize);
//     };
//   }, [initScene, handleKeyDown, handleKeyUp, handleResize]);

//   return (
//     <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden">
//       <div ref={mountRef} className="w-full h-full" />
      
//       {/* Enhanced Game UI */}
//       <div className="absolute top-4 left-4 text-white font-bold z-10 space-y-2">
//         <div className="text-2xl text-yellow-400">Score: {gameState.score.toLocaleString()}</div>
//         <div className="text-lg text-red-400">Lives: {"❤️".repeat(gameState.lives)}</div>
//         <div className="text-lg text-cyan-400">Level: {gameState.level}</div>
//         <div className="text-sm text-gray-300">High Score: {gameState.highScore.toLocaleString()}</div>
//       </div>
      
//       {/* Speed indicator */}
//       {gameState.isPlaying && (
//         <div className="absolute top-4 right-4 text-white font-bold z-10">
//           <div className="text-lg text-green-400">
//             Speed: {(gameStateRef.current?.speed * 100 || 15).toFixed(0)}%
//           </div>
//         </div>
//       )}
      
//       {/* Start Screen */}
//       {!gameState.isPlaying && !gameState.gameOver && (
//         <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
//           <div className="text-center max-w-lg p-8">
//             <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6 tracking-wider animate-pulse">
//               TUNNEL RUSH
//             </h1>
//             <p className="text-xl text-gray-300 mb-8">
//               Navigate through the infinite tunnel and avoid obstacles!
//             </p>
//             <button 
//               onClick={startGame}
//               className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
//             >
//               🚀 START GAME
//             </button>
//             <div className="text-gray-300 space-y-2">
//               <p><kbd className="bg-gray-700 px-2 py-1 rounded">ARROW KEYS</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd> to move</p>
//               <p><kbd className="bg-gray-700 px-2 py-1 rounded">SPACEBAR</kbd> to pause</p>
//               <p><kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> to restart</p>
//             </div>
//             {gameState.highScore > 0 && (
//               <div className="mt-4 text-yellow-400">
//                 🏆 Best Score: {gameState.highScore.toLocaleString()}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
      
//       {/* Pause Screen */}
//       {gameState.isPlaying && gameState.isPaused && (
//         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
//           <div className="text-center">
//             <h2 className="text-5xl font-bold text-white mb-6">⏸️ PAUSED</h2>
//             <div className="space-x-4">
//               <button 
//                 onClick={togglePause}
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
//               >
//                 ▶️ RESUME
//               </button>
//               <button 
//                 onClick={resetGame}
//                 className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
//               >
//                 🏠 MENU
//               </button>
//             </div>
//             <p className="text-gray-300 mt-4">Press <kbd className="bg-gray-700 px-2 py-1 rounded">SPACEBAR</kbd> to resume</p>
//           </div>
//         </div>
//       )}
      
//       {/* Game Over Screen */}
//       {gameState.gameOver && (
//         <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center z-20">
//           <div className="text-center max-w-md p-8">
//             <h2 className="text-6xl font-bold text-red-500 mb-4">💥 GAME OVER</h2>
//             <div className="bg-gray-800 rounded-lg p-6 mb-6">
//               <p className="text-3xl text-white mb-2">Final Score</p>
//               <p className="text-4xl font-bold text-yellow-400 mb-2">{gameState.score.toLocaleString()}</p>
//               <p className="text-lg text-gray-400">Level Reached: {gameState.level}</p>
//               {gameState.score > gameState.highScore && (
//                 <p className="text-xl text-green-400 mt-2">🎉 NEW HIGH SCORE!</p>
//               )}
//             </div>
//             <div className="space-x-4">
//               <button 
//                 onClick={startGame}
//                 className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
//               >
//                 🔄 PLAY AGAIN
//               </button>
//               <button 
//                 onClick={resetGame}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
//               >
//                 📋 MENU
//               </button>
//             </div>
//             <p className="text-gray-400 mt-4">Press <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> to play again</p>
//           </div>
//         </div>
//       )}
      
//       {/* Controls hint */}
//       {gameState.isPlaying && !gameState.isPaused && (
//         <div className="absolute bottom-4 left-4 text-white text-sm opacity-75 z-10 bg-black bg-opacity-50 rounded-lg p-3">
//           <div className="grid grid-cols-2 gap-4 text-xs">
//             <div>
//               <p>🎮 <strong>Movement:</strong></p>
//               <p>WASD / Arrow Keys</p>
//             </div>
//             <div>
//               <p>⚡ <strong>Actions:</strong></p>
//               <p>Space: Pause | R: Restart</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mini tutorial overlay for first-time players */}
//       {gameState.isPlaying && gameState.score < 100 && !gameState.isPaused && (
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-10 pointer-events-none">
//           <div className="bg-black bg-opacity-60 rounded-lg p-4 animate-bounce">
//             <p className="text-lg font-bold">🎯 Avoid the obstacles!</p>
//             <p className="text-sm">Collect yellow power-ups for bonus points</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TunnelRushGame;


'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

const TunnelRushGame = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const tunnelGroupRef = useRef(null);
  const obstaclesGroupRef = useRef(null);
  const particlesRef = useRef(null);
  const audioContextRef = useRef(null);
  
  const gameStateRef = useRef({
    isPlaying: false,
    isPaused: false,
    speed: 0.15,
    baseSpeed: 0.15,
    score: 0,
    lives: 3,
    level: 1,
    playerPosition: { x: 0, y: 0 },
    playerGridPosition: { x: 0, y: -2 }, // Grid-based position (-2 to 2 for x, -2 to 2 for y)
    keys: { left: false, right: false, up: false, down: false },
    tunnelRotation: 0,
    cameraShake: 0,
    coins: [],
    rocks: [],
    particles: []
  });
  
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    highScore: 0
  });

  // Load high score from localStorage (if available in real environment)
  const loadHighScore = () => {
    try {
      return parseInt(localStorage.getItem('tunnelRushHighScore') || '0');
    } catch {
      return 0;
    }
  };

  const saveHighScore = (score) => {
    try {
      localStorage.setItem('tunnelRushHighScore', score.toString());
    } catch {
      // localStorage not available
    }
  };

  // Audio system (Web Audio API)
  const createAudioContext = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  };

  const playSound = (frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000022, 5, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000022);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x88ccff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for dynamic lighting
    const pointLight1 = new THREE.PointLight(0xff4444, 1, 50);
    pointLight1.position.set(5, 5, -10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x44ff44, 1, 50);
    pointLight2.position.set(-5, -5, -20);
    scene.add(pointLight2);

    // Create player (advanced sphere with glow effect)
    const playerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,
      emissive: 0x004422,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    // Start at bottom center position
    player.position.set(0, -2.5, 5);
    player.castShadow = true;
    scene.add(player);
    playerRef.current = player;

    // Add player glow effect
    const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3
    });
    const playerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    player.add(playerGlow);

    // Create tunnel group
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);
    tunnelGroupRef.current = tunnelGroup;

    // Create obstacles group
    const obstaclesGroup = new THREE.Group();
    scene.add(obstaclesGroup);
    obstaclesGroupRef.current = obstaclesGroup;

    // Create particle system
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = Math.random() * -200;
      
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.8);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Initialize game elements
    createTunnel();
    createCoinsAndRocks();
    createAudioContext();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create advanced tunnel system
  const createTunnel = () => {
    const tunnelGroup = tunnelGroupRef.current;
    if (!tunnelGroup) return;

    // Clear existing tunnel
    while (tunnelGroup.children.length > 0) {
      tunnelGroup.remove(tunnelGroup.children[0]);
    }

    for (let i = 0; i < 50; i++) {
      // Main tunnel ring
      const ringGeometry = new THREE.TorusGeometry(4, 0.2, 8, 16);
      const hue = (i * 0.05 + Date.now() * 0.0001) % 1;
      const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.4, 0.1),
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.z = -i * 4;
      ring.rotation.z = i * 0.1;
      tunnelGroup.add(ring);

      // Add tunnel segments (hexagonal)
      if (i % 2 === 0) {
        const segmentGeometry = new THREE.CylinderGeometry(3.8, 3.8, 0.5, 6);
        const segmentMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(hue + 0.1, 0.6, 0.3),
          transparent: true,
          opacity: 0.4,
          wireframe: true
        });
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.position.z = -i * 4;
        segment.rotation.z = i * 0.2;
        tunnelGroup.add(segment);
      }
    }
  };

  // Create coins and rocks system
  const createCoinsAndRocks = () => {
    const obstaclesGroup = obstaclesGroupRef.current;
    if (!obstaclesGroup) return;

    // Clear existing obstacles
    while (obstaclesGroup.children.length > 0) {
      obstaclesGroup.remove(obstaclesGroup.children[0]);
    }

    // Create coins (collectible)
    for (let i = 0; i < 40; i++) {
      if (Math.random() > 0.3) { // 70% chance to spawn coin
        const coinGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
        const coinMaterial = new THREE.MeshPhongMaterial({
          color: 0xffff00,
          emissive: 0x444400,
          transparent: true,
          opacity: 0.9,
          shininess: 100
        });
        
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        
        // Position coins randomly around the tunnel
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + Math.random() * 2.5; // Closer to center for easier collection
        coin.position.x = Math.cos(angle) * radius;
        coin.position.y = Math.sin(angle) * radius;
        coin.position.z = -10 - i * 5 - Math.random() * 3;
        
        coin.castShadow = true;
        coin.userData = { type: 'coin', originalZ: coin.position.z };
        obstaclesGroup.add(coin);
      }
    }
    
    // Create rocks (obstacles)
    for (let i = 0; i < 20; i++) {
      if (Math.random() > 0.5) { // 50% chance to spawn rock
        const rockGeometry = new THREE.DodecahedronGeometry(0.4);
        const rockMaterial = new THREE.MeshPhongMaterial({
          color: 0x666666,
          emissive: 0x111111,
          transparent: true,
          opacity: 0.9,
          roughness: 0.8
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        // Position rocks randomly but avoid center area
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 2; // Avoid center area
        rock.position.x = Math.cos(angle) * radius;
        rock.position.y = Math.sin(angle) * radius;
        rock.position.z = -15 - i * 8 - Math.random() * 5;
        
        rock.castShadow = true;
        rock.userData = { type: 'rock', originalZ: rock.position.z };
        obstaclesGroup.add(rock);
      }
    }
  };

  // Convert grid position to world position
  const gridToWorldPosition = (gridX, gridY) => {
    // Grid ranges from -2 to 2, world positions range from -2.5 to 2.5
    const worldX = (gridX / 2) * 2.5;
    const worldY = (gridY / 2) * 2.5;
    return { x: worldX, y: worldY };
  };

  // Update player position based on grid
  const updatePlayerPosition = () => {
    if (!playerRef.current) return;
    
    const worldPos = gridToWorldPosition(
      gameStateRef.current.playerGridPosition.x,
      gameStateRef.current.playerGridPosition.y
    );
    
    // Smooth transition to new position
    const targetX = worldPos.x;
    const targetY = worldPos.y;
    
    playerRef.current.position.x += (targetX - playerRef.current.position.x) * 0.2;
    playerRef.current.position.y += (targetY - playerRef.current.position.y) * 0.2;
  };

  // Advanced game loop with enhanced features
  const animate = useCallback(() => {
    if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused) return;

    const player = playerRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const tunnelGroup = tunnelGroupRef.current;
    const obstaclesGroup = obstaclesGroupRef.current;
    const particles = particlesRef.current;

    if (!player || !camera || !renderer || !scene) return;

    const deltaTime = 0.016; // ~60fps

    // Update tunnel rotation
    gameStateRef.current.tunnelRotation += 0.005;
    if (tunnelGroup) {
      tunnelGroup.rotation.z = gameStateRef.current.tunnelRotation;
      
      // Move and update tunnel segments
      tunnelGroup.children.forEach((segment, index) => {
        segment.position.z += gameStateRef.current.speed;
        segment.rotation.z += 0.01;
        
        // Update colors dynamically
        if (segment.material && segment.material.color) {
          const hue = (Date.now() * 0.001 + index * 0.1) % 1;
          segment.material.color.setHSL(hue, 0.8, 0.6);
          if (segment.material.emissive) {
            segment.material.emissive.setHSL(hue, 0.4, 0.1);
          }
        }
        
        // Recycle tunnel segments
        if (segment.position.z > 10) {
          segment.position.z -= 200;
        }
      });
    }

    // Update player position based on grid
    updatePlayerPosition();

    // Update obstacles and check collisions
    if (obstaclesGroup) {
      obstaclesGroup.children.forEach((obstacle, index) => {
        obstacle.position.z += gameStateRef.current.speed;
        
        // Rotate obstacles for visual appeal
        if (obstacle.userData.type === 'coin') {
          obstacle.rotation.y += 0.1; // Coins spin faster
          obstacle.rotation.x += 0.05;
        } else if (obstacle.userData.type === 'rock') {
          obstacle.rotation.x += 0.02;
          obstacle.rotation.y += 0.015;
          obstacle.rotation.z += 0.01;
        }
        
        // Collision detection
        const distance = player.position.distanceTo(obstacle.position);
        const collisionThreshold = obstacle.userData.type === 'coin' ? 0.6 : 0.7;
        
        if (distance < collisionThreshold && obstacle.position.z > 4 && obstacle.position.z < 6) {
          if (obstacle.userData.type === 'coin') {
            // Collect coin
            gameStateRef.current.score += 50;
            playSound(800, 0.2, 'sine');
            obstaclesGroup.remove(obstacle);
          } else if (obstacle.userData.type === 'rock') {
            // Hit rock - lose life
            gameStateRef.current.lives -= 1;
            gameStateRef.current.cameraShake = 0.5;
            playSound(200, 0.3, 'sawtooth');
            
            if (gameStateRef.current.lives <= 0) {
              // Game Over
              gameStateRef.current.isPlaying = false;
              const finalScore = gameStateRef.current.score;
              const currentHighScore = loadHighScore();
              if (finalScore > currentHighScore) {
                saveHighScore(finalScore);
                setGameState(prev => ({ ...prev, highScore: finalScore }));
              }
              setGameState(prev => ({ 
                ...prev, 
                isPlaying: false, 
                gameOver: true, 
                score: finalScore 
              }));
              return;
            } else {
              setGameState(prev => ({ ...prev, lives: gameStateRef.current.lives }));
              obstaclesGroup.remove(obstacle);
            }
          }
        }
        
        // Recycle obstacles
        if (obstacle.position.z > 10) {
          obstacle.position.z = obstacle.userData.originalZ - 200;
          
          if (obstacle.userData.type === 'coin') {
            // Respawn coins from center area
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 2.5;
            obstacle.position.x = Math.cos(angle) * radius;
            obstacle.position.y = Math.sin(angle) * radius;
          } else {
            // Respawn rocks avoiding center
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 2;
            obstacle.position.x = Math.cos(angle) * radius;
            obstacle.position.y = Math.sin(angle) * radius;
          }
        }
      });
    }

    // Update particles
    if (particles) {
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += gameStateRef.current.speed * 2;
        if (positions[i + 2] > 20) {
          positions[i + 2] = -200;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    }

    // Player visual effects
    player.rotation.z += 0.05;
    player.material.emissive.setHSL((Date.now() * 0.003) % 1, 0.5, 0.2);

    // Update score and level
    gameStateRef.current.score += Math.floor(gameStateRef.current.speed * 10);
    const newLevel = Math.floor(gameStateRef.current.score / 1000) + 1;
    
    if (newLevel !== gameStateRef.current.level) {
      gameStateRef.current.level = newLevel;
      gameStateRef.current.speed = gameStateRef.current.baseSpeed + (newLevel - 1) * 0.02  ;
      setGameState(prev => ({ ...prev, level: newLevel }));
      playSound(1000, 0.1, 'sine');
    }

    // Update UI periodically
    if (gameStateRef.current.score % 50 === 0) {
      setGameState(prev => ({ ...prev, score: gameStateRef.current.score }));
    }

    // Camera effects
    camera.position.x += (player.position.x * 0.1 - camera.position.x) * 0.05;
    camera.position.y += (player.position.y * 0.1 - camera.position.y) * 0.05;
    
    // Camera shake effect
    if (gameStateRef.current.cameraShake > 0) {
      camera.position.x += (Math.random() - 0.5) * gameStateRef.current.cameraShake;
      camera.position.y += (Math.random() - 0.5) * gameStateRef.current.cameraShake;
      gameStateRef.current.cameraShake *= 0.9;
    }

    // Dynamic FOV based on speed
    camera.fov = 75 + gameStateRef.current.speed * 50;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }, []);

  // Enhanced keyboard controls with discrete grid movement
  const handleKeyDown = useCallback((event) => {
    event.preventDefault();
    if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused) return;
    
    switch(event.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        // Move left in grid (max -2)
        if (gameStateRef.current.playerGridPosition.x > -2) {
          gameStateRef.current.playerGridPosition.x -= 1;
          playSound(440, 0.1, 'sine');
        }
        break;
      case 'arrowright':
      case 'd':
        // Move right in grid (max 2)
        if (gameStateRef.current.playerGridPosition.x < 2) {
          gameStateRef.current.playerGridPosition.x += 1;
          playSound(440, 0.1, 'sine');
        }
        break;
      case 'arrowup':
      case 'w':
        // Move up in grid (max 2)
        if (gameStateRef.current.playerGridPosition.y < 2) {
          gameStateRef.current.playerGridPosition.y += 1;
          playSound(440, 0.1, 'sine');
        }
        break;
      case 'arrowdown':
      case 's':
        // Move down in grid (max -2)
        if (gameStateRef.current.playerGridPosition.y > -2) {
          gameStateRef.current.playerGridPosition.y -= 1;
          playSound(440, 0.1, 'sine');
        }
        break;
      case ' ':
        if (gameStateRef.current.isPlaying) {
          togglePause();
        }
        break;
      case 'r':
        if (!gameStateRef.current.isPlaying) {
          startGame();
        }
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event) => {
    // Key up events not needed for discrete movement
  }, []);

  // Game control functions
  const startGame = () => {
    gameStateRef.current = {
      isPlaying: true,
      isPaused: false,
      speed: 0.15,
      baseSpeed: 0.15,
      score: 0,
      lives: 3,
      level: 1,
      playerPosition: { x: 0, y: 0 },
      playerGridPosition: { x: 0, y: -2 }, // Start at bottom center
      keys: { left: false, right: false, up: false, down: false },
      tunnelRotation: 0,
      cameraShake: 0,
      coins: [],
      rocks: [],
      particles: []
    };
    
    if (playerRef.current) {
      playerRef.current.position.set(0, -2.5, 5); // Bottom center position
    }
    
    createTunnel();
    createCoinsAndRocks();
    
    setGameState({ 
      isPlaying: true, 
      isPaused: false, 
      score: 0, 
      lives: 3, 
      level: 1, 
      gameOver: false,
      highScore: loadHighScore()
    });
    
    playSound(440, 0.1, 'sine');
    animate();
  };

  const togglePause = () => {
    gameStateRef.current.isPaused = !gameStateRef.current.isPaused;
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    if (!gameStateRef.current.isPaused) {
      animate();
    }
    playSound(660, 0.1, 'sine');
  };

  const resetGame = () => {
    gameStateRef.current.isPlaying = false;
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false, 
      gameOver: false,
      highScore: loadHighScore()
    }));
  };

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    // Load high score on component mount
    setGameState(prev => ({ ...prev, highScore: loadHighScore() }));

    return () => {
      cleanup && cleanup();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [initScene, handleKeyDown, handleKeyUp, handleResize]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Enhanced Game UI */}
      <div className="absolute top-4 left-4 text-white font-bold z-10 space-y-2">
        <div className="text-2xl text-yellow-400">Score: {gameState.score.toLocaleString()}</div>
        <div className="text-lg text-red-400">Lives: {"❤️".repeat(gameState.lives)}</div>
        <div className="text-lg text-cyan-400">Level: {gameState.level}</div>
        <div className="text-sm text-gray-300">High Score: {gameState.highScore.toLocaleString()}</div>
      </div>
      
      {/* Speed indicator */}
      {gameState.isPlaying && (
        <div className="absolute top-4 right-4 text-white font-bold z-10">
          <div className="text-lg text-green-400">
            Speed: {(gameStateRef.current?.speed * 100 || 15).toFixed(0)}%
          </div>
        </div>
      )}
      
      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <div className="text-center max-w-lg p-8">
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-6 tracking-wider animate-pulse">
              TUNNEL RUSH
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Navigate through the infinite tunnel! Collect coins and avoid rocks!
            </p>
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
            >
              🚀 START GAME
            </button>
            <div className="text-gray-300 space-y-2">
              <p><kbd className="bg-gray-700 px-2 py-1 rounded">ARROW KEYS</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd> to move in grid</p>
              <p>🪙 <span className="text-yellow-400">Collect Coins</span> for points | 🪨 <span className="text-red-400">Avoid Rocks</span> to keep hearts</p>
              <p><kbd className="bg-gray-700 px-2 py-1 rounded">SPACEBAR</kbd> to pause | <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> to restart</p>
            </div>
            {gameState.highScore > 0 && (
              <div className="mt-4 text-yellow-400">
                🏆 Best Score: {gameState.highScore.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Pause Screen */}
      {gameState.isPlaying && gameState.isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-6">⏸️ PAUSED</h2>
            <div className="space-x-4">
              <button 
                onClick={togglePause}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
              >
                ▶️ RESUME
              </button>
              <button 
                onClick={resetGame}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
              >
                🏠 MENU
              </button>
            </div>
            <p className="text-gray-300 mt-4">Press <kbd className="bg-gray-700 px-2 py-1 rounded">SPACEBAR</kbd> to resume</p>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-85 flex items-center justify-center z-20">
          <div className="text-center max-w-md p-8">
            <h2 className="text-6xl font-bold text-red-500 mb-4">💥 GAME OVER</h2>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-3xl text-white mb-2">Final Score</p>
              <p className="text-4xl font-bold text-yellow-400 mb-2">{gameState.score.toLocaleString()}</p>
              <p className="text-lg text-gray-400">Level Reached: {gameState.level}</p>
              {gameState.score > gameState.highScore && (
                <p className="text-xl text-green-400 mt-2">🎉 NEW HIGH SCORE!</p>
              )}
            </div>
            <div className="space-x-4">
              <button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
              >
                🔄 PLAY AGAIN
              </button>
              <button 
                onClick={resetGame}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200"
              >
                📋 MENU
              </button>
            </div>
            <p className="text-gray-400 mt-4">Press <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> to play again</p>
          </div>
        </div>
      )}
      
      {/* Controls hint */}
      {gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute bottom-4 left-4 text-white text-sm opacity-75 z-10 bg-black bg-opacity-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p>🎮 <strong>Movement:</strong></p>
              <p>WASD / Arrow Keys (Grid-based)</p>
            </div>
            <div>
              <p>⚡ <strong>Actions:</strong></p>
              <p>Space: Pause | R: Restart</p>
            </div>
          </div>
        </div>
      )}

      {/* Movement Grid Indicator */}
      {gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute bottom-4 right-4 text-white text-xs opacity-75 z-10 bg-black bg-opacity-50 rounded-lg p-2">
          <div className="text-center mb-1">Position Grid</div>
          <div className="grid grid-cols-5 gap-1">
            {[-2, -1, 0, 1, 2].map(y => (
              [-2, -1, 0, 1, 2].map(x => (
                <div 
                  key={`${x}-${y}`} 
                  className={`w-3 h-3 rounded-sm border ${
                    gameStateRef.current?.playerGridPosition?.x === x && 
                    gameStateRef.current?.playerGridPosition?.y === (2-y) 
                      ? 'bg-green-400 border-green-200' 
                      : 'bg-gray-600 border-gray-400'
                  }`}
                />
              ))
            ))}
          </div>
        </div>
      )}

      {/* Mini tutorial overlay for first-time players */}
      {gameState.isPlaying && gameState.score < 200 && !gameState.isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-10 pointer-events-none">
          <div className="bg-black bg-opacity-60 rounded-lg p-4 animate-bounce">
            <p className="text-lg font-bold">🪙 Collect golden coins!</p>
            <p className="text-sm">🪨 Avoid gray rocks - they cost hearts!</p>
            <p className="text-xs mt-2">Use arrow keys to move in a 5x5 grid</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TunnelRushGame;