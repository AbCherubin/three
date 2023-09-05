import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Papa from "papaparse";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import * as dat from "dat.gui"; // Import dat.GUI
import { colors } from "../assets/colors.js";

function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer;
    let gui; // Declare GUI variable

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
    camera.position.set(0, 50, 0);

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
    plane.rotation.x = -0.5 * Math.PI;

    plane.position.x = 2.4;
    plane.position.z = 2.8;
    scene.add(plane);

    // Create gridHelper
    const gridHelper = new THREE.GridHelper(100, 10);
    // scene.add(gridHelper);

    const startPoints = {};
    const xOffset = 104; // Add your X offset here
    const yOffset = 75; // Add your Y offset here

    // Create a set to store unique layers
    const uniqueLayers = new Set();

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
              x: parseFloat(row.X) - xOffset,
              y: parseFloat(row.Y) - yOffset,
            };
          } else {
            const startPoint = startPoints[polylineID];
            const endPoint = {
              x: parseFloat(row.X) - xOffset,
              y: parseFloat(row.Y) - yOffset,
            };

            // Create a line segment from start to end points
            const geometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(startPoint.x, 0.01, -startPoint.y),
              new THREE.Vector3(endPoint.x, 0.01, -endPoint.y),
            ]);

            // Create a material for the line with the specified color
            const material = new THREE.LineBasicMaterial({
              color: new THREE.Color(layerColors[layer]),
              linewidth: 1,
            });

            // Create the line and add it to the scene
            const line = new THREE.Line(geometry, material);

            scene.add(line);

            // // Create a geometry for the line using LineGeometry
            // const geometry = new LineGeometry();
            // geometry.setPositions([
            //   startPoint.x,
            //   1,
            //   startPoint.y,
            //   endPoint.x,
            //   1,
            //   endPoint.y,
            // ]);

            // // Create a material for the line with the specified color
            // const material = new LineMaterial({
            //   color: new THREE.Color(colors[i]),
            //   linewidth: 0.005, // Adjust this value to set the line thickness
            //   vertexColors: false,
            // });

            // const line = new Line2(geometry, material);
            // // line.computeLineDistances(); // Compute line distances if needed
            // scene.add(line);

            // Store the layer information in userData
            line.userData.layer = row.Layer;
            uniqueLayers.add(row.Layer);
          }
        });

        // Create a function to set up the GUI
        function setupGUI() {
          gui = new dat.GUI();
          const layers = Array.from(uniqueLayers);

          // Create an object to store GUI properties
          const guiProperties = {
            selectedLayer: layers[0], // Default to the first layer
          };

          // Add a dropdown for selecting layers
          gui.add(guiProperties, "selectedLayer", layers).onChange((value) => {
            // Hide or show lines based on the selected layer
            scene.children.forEach((child) => {
              if (child.userData.layer === value) {
                child.visible = true;
              } else {
                child.visible = false;
              }
            });
          });
        }

        // Call the setupGUI function after loading your CSV data
        setupGUI();
      });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
      // Remove dat.GUI if it's open
      if (gui) {
        gui.destroy();
      }
    };
  }, []);

  return <div ref={sceneRef} id="three-scene"></div>;
}

export default ThreeScene;
