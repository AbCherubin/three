import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import proj4 from "proj4";

function KMLViewer() {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

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
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;
    document.body.appendChild(renderer.domElement);

    // Set the camera position
    camera.position.set(11215234.941874081, 1537882.7148304281, 100);

    // Fetch and parse the KML data when the component mounts
    fetchAndParseKML();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Add any animation or camera control logic here if needed

      renderer.render(scene, camera);
    };

    animate();

    // Clean up Three.js resources when the component unmounts
    return () => {
      const domElement = rendererRef.current.domElement;
      scene.remove(...scene.children);
      camera.clear();
      domElement.parentNode.removeChild(domElement);
    };
  }, []);

  // Function to fetch and parse the KML data
  function fetchAndParseKML() {
    fetch("src/assets/bkk_map.kml")
      .then((response) => response.text())
      .then((kml) => {
        // Now 'kml' contains the content of your KML file
        const parsedData = parseKML(kml);

        // Convert the coordinates to EPSG:3857 and display the parsed KML data on the plane
        const convertedData = convertCoordinatesTo3857(parsedData);
        displayKMLData(convertedData);
      })
      .catch((error) => console.error("Error fetching KML:", error));
  }

  // Modify the KML parsing function to extract coordinates
  function parseKML(kml) {
    const coordinates = [];

    // Use a KML parsing library or custom code to extract coordinates from KML
    // Example: Use regex to extract coordinates from KML
    const coordinateRegex = /<coordinates>(.*?)<\/coordinates>/g;
    let match;

    while ((match = coordinateRegex.exec(kml)) !== null) {
      const coordinatesText = match[1];
      const coordinatesArray = coordinatesText.split(" ").map((coordStr) => {
        const [lon, lat, alt] = coordStr.split(",").map(parseFloat);
        return { x: lon, y: lat, z: alt };
      });

      coordinates.push(coordinatesArray);
    }

    return coordinates;
  }

  // Convert coordinates to EPSG:3857
  function convertCoordinatesTo3857(data) {
    return data.map((vertices) => {
      const convertedVertices = vertices.map((vertex) => {
        // Convert each vertex from EPSG:4326 to EPSG:3857
        const [x, y] = proj4("EPSG:4326", "EPSG:3857", [vertex.x, vertex.y]);
        return new THREE.Vector3(x, y, vertex.z || 0);
      });

      return convertedVertices;
    });
  }

  // Display parsed KML data on a plane
  function displayKMLData(data) {
    // Create a plane geometry
    const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    sceneRef.current.add(plane);

    // Position the plane as needed
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(11215234.941874081, 1537882.7148304281, 0);
    // Create a line mesh using the converted KML data
    data.forEach((vertices) => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
      const line = new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({ color: 0xff0000 })
      );
      sceneRef.current.add(line);
    });
  }

  return null; // No need to render anything, as Three.js handles rendering
}

export default KMLViewer;
