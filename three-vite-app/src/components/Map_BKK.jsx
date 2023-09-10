import { useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import proj4 from "proj4";
import { bkk_map } from "../assets/bkk_map_array.js";
function Map_BKK() {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const EPSG3857_offsetX = 11215513.406111;
  const EPSG3857_offsetY = 1539202.143335;
  const EPSG3857_RotationY = 1.82145115;
  // Define the projection strings for EPSG:4326 (WGS 84) and EPSG:3857 (Web Mercator)
  proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
  proj4.defs(
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"
  );

  useEffect(() => {
    // Your Three.js scene, camera, and renderer setup here
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;
    document.body.appendChild(renderer.domElement);

    // Set the camera position
    camera.position.set(0, 4000, 2000);

    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 4000;
    controls.enableRotate = true;

    controls.maxPolarAngle = Math.PI / 2;
    // Fetch and parse the KML data when the component mounts
    displayKMLData(bkk_map);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Add any animation or camera control logic here if needed

      renderer.render(scene, camera);
    };

    animate();

    window.onresize = function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    // Clean up Three.js resources when the component unmounts
    return () => {
      const domElement = rendererRef.current.domElement;
      scene.remove(...scene.children);
      camera.clear();
      domElement.parentNode.removeChild(domElement);
    };
  }, []);

  // Display parsed KML data on a plane
  function displayKMLData(data) {
    // Create a plane geometry
    const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    sceneRef.current.add(plane);

    // Position the plane as needed
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0, 0);
    // Create a line mesh using the converted KML data
    let count = 0;
    data.forEach((vertices) => {
      //if (count > 1) return;
      const polylineShape = new THREE.Shape(); // Create a single shape for the entire polyline

      // Parse the first data point
      const firstRow = vertices[0];
      const firstX = parseFloat(firstRow.x) - EPSG3857_offsetX;
      const firstZ = parseFloat(firstRow.y) - EPSG3857_offsetY; // Use 'z' for the Y coordinate

      // Move to the starting point
      polylineShape.moveTo(firstX, firstZ);

      vertices.forEach((row) => {
        // Parse X and Y coordinates from CSV
        const x = parseFloat(row.x) - EPSG3857_offsetX;
        const z = parseFloat(row.y) - EPSG3857_offsetY; // Use 'z' for the Y coordinate

        // Add points to the polyline shape
        polylineShape.lineTo(x, z);
      });
      const extrudeSettings = {
        depth: count * 2, // Extrusion depth based on your yOffset
        bevelEnabled: false,
      };
      const geometry = new THREE.ExtrudeGeometry(
        polylineShape,
        extrudeSettings
      );

      geometry.rotateX(-0.5 * Math.PI);
      geometry.rotateY(EPSG3857_RotationY);
      const extrusionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true, // Make the material transparent
        opacity: 0.3,
      });
      // Create a mesh with the red material
      const object = new THREE.Mesh(geometry, extrusionMaterial);

      // Position the object at (0, 0, 0) or adjust as needed

      object.position.set(0, 0, 0);
      sceneRef.current.add(object);
      count++;
    });
  }

  return null; // No need to render anything, as Three.js handles rendering
}

export default Map_BKK;
