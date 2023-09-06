import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Papa from "papaparse";
import { colors } from "../assets/colors.js";

function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;

    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create a camera
    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      200
    );
    camera.position.set(0, 0, 50);

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Append renderer's canvas only once on mount
    if (sceneRef.current) {
      sceneRef.current.appendChild(renderer.domElement);
    }

    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 80;
    controls.enableRotate = true;

    // Create plane
    const planeGeometry = new THREE.PlaneGeometry(1974 / 34.5, 1372 / 34.5);
    const texture = new THREE.TextureLoader().load("/src/assets/plan.png");
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true, // Enable transparency
      opacity: 0.9,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.x = 2.4;
    plane.position.y = -2.8;
    scene.add(plane);

    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphereHeight = 2;
    sphere.position.set(0, 0, sphereHeight); // Initial position
    scene.add(sphere);

    let targetPositions = [];
    let targetPositionIndex = 0;
    const speed = 0.05; // Speed of movement
    const lerpFactor = 0.05;
    // Create gridHelper
    // const gridHelper = new THREE.GridHelper(100, 1000);
    // gridHelper.rotation.x = -0.5 * Math.PI;
    // scene.add(gridHelper);

    const startPoints = {};
    const xOffset = 104; // Add your X offset here 104
    const yOffset = 75; // Add your Y offset here 75

    // Define a mapping of layers to colors
    const layerColors = {};

    fetch("/src/assets/cubes.csv")
      .then((response) => response.text())
      .then((data) => {
        const parsedData = Papa.parse(data, { header: true }).data;

        parsedData.forEach((row) => {
          const polylineID = row["Polyline ID"];
          const layer = row.Layer;
          if (!layerColors[layer]) {
            // If the layer does not exist in the mapping, assign a color
            layerColors[layer] =
              colors[Object.keys(layerColors).length % colors.length];
          }

          if (!startPoints[polylineID]) {
            startPoints[polylineID] = {
              x: parseFloat(row.X).toFixed(6) - xOffset,
              y: parseFloat(row.Y).toFixed(6) - yOffset,
            };
          } else {
            const startPoint = startPoints[polylineID];
            const endPoint = {
              x: parseFloat(row.X).toFixed(6) - xOffset,
              y: parseFloat(row.Y).toFixed(6) - yOffset,
            };

            let beam_height = 1;
            let beam_width = 0.2;

            // Create profile for extrusion
            let shape = new THREE.Shape();
            shape.moveTo(0, beam_width / 2);
            shape.lineTo(beam_height, beam_width / 2);
            shape.lineTo(beam_height, -beam_width / 2);
            shape.lineTo(0, -beam_width / 2);
            shape.lineTo(0, beam_width / 2);

            // Create a path for extrusion
            let path = new THREE.LineCurve3(
              new THREE.Vector3(startPoint.x, startPoint.y, beam_height),
              new THREE.Vector3(endPoint.x, endPoint.y, beam_height)
            );

            // Create an extrusion geometry
            let extrudeSettings = {
              steps: 100, // The higher the number here, the smoother your object will be
              bevelEnabled: false,
              extrudePath: path,
            };
            let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            // Create a material for the extrusion
            let material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(layerColors[layer]),
            });

            let extrusion = new THREE.Mesh(geometry, material);
            scene.add(extrusion);
            targetPositions.push({
              start: new THREE.Vector3(
                startPoint.x,
                startPoint.y,
                sphereHeight
              ),
              stop: new THREE.Vector3(endPoint.x, endPoint.y, sphereHeight),
            });
          }
        });
      });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      if (targetPositions[targetPositionIndex]) {
        const targetPosition = targetPositions[targetPositionIndex];

        sphere.position.add(
          targetPosition.stop.clone().sub(sphere.position).multiplyScalar(speed)
        );
        if (sphere.position.distanceTo(targetPosition.stop) < 0.1) {
          targetPositionIndex =
            (targetPositionIndex + 1) % targetPositions.length;
          sphere.position.lerp(
            targetPositions[targetPositionIndex].start,
            lerpFactor
          );
        }
      }
      renderer.render(scene, camera);
    };

    animate();

    window.onresize = function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Clean up when component unmounts
    return () => {
      renderer.dispose();
    };
  }, []);

  return <div ref={sceneRef} id="three-scene"></div>;
}

export default ThreeScene;
