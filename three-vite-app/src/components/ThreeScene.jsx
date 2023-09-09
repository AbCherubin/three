import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Papa from "papaparse";

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
    camera.position.set(0, 50, 0);

    // Create a renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Append renderer's canvas only once on mount
    if (sceneRef.current) {
      sceneRef.current.appendChild(renderer.domElement);
    }

    // lights
    // probe

    // const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 3);
    // scene.add(ambient);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    // directionalLight.position.set(1, 4, 3).multiplyScalar(3);
    // directionalLight.castShadow = true;
    // directionalLight.shadow.mapSize.width = 2048;
    // directionalLight.shadow.mapSize.height = 2048;
    // directionalLight.shadow.camera.top = 10;
    // directionalLight.shadow.camera.bottom = -10;
    // directionalLight.shadow.camera.left = -10;
    // directionalLight.shadow.camera.right = 10;
    // scene.add(directionalLight);

    scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));

    addShadowedLight(1, 20, 1, 0xffffff, 3.5);
    addShadowedLight(0.5, 20, -1, 0xffd500, 3);
    function addShadowedLight(x, y, z, color, intensity) {
      const directionalLight = new THREE.DirectionalLight(color, intensity);
      directionalLight.position.set(x, y, z);
      scene.add(directionalLight);

      directionalLight.castShadow = true;

      const d = 30;
      directionalLight.shadow.camera.left = -d;
      directionalLight.shadow.camera.right = d;
      directionalLight.shadow.camera.top = d;
      directionalLight.shadow.camera.bottom = -d;

      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 40;

      directionalLight.shadow.bias = -0.002;
    }

    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    controls.enablePan = true;
    controls.enableDamping = true;
    controls.minDistance = 5;
    controls.maxDistance = 80;
    controls.enableRotate = true;
    controls.update();

    // Create plane
    const planeGeometry = new THREE.PlaneGeometry(1974 / 34.3, 1372 / 34.3);
    const texture = new THREE.TextureLoader().load("/src/assets/plan.png");
    const planeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      color: 0xcbcbcb,
      specular: 0x474747,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.x = 2.4;
    plane.position.z = -0.7;
    plane.position.y = 0;
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;
    scene.add(plane);
    // Ground

    // Create gridHelper
    // const gridHelper = new THREE.GridHelper(100, 1000);
    // gridHelper.rotation.x = -0.5 * Math.PI;
    // scene.add(gridHelper);

    Papa.parse("/src/assets/cubes.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.data && results.data.length > 0) {
          const extrusionMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
          }); // Red color material
          const depth = 0.4; // Adjust this value based on your data

          const polylineShape = new THREE.Shape(); // Create a single shape for the entire polyline
          // Parse the first data point
          const firstRow = results.data[0];
          const firstX = parseFloat(firstRow.X);
          const firstZ = parseFloat(firstRow.Y); // Use 'z' for the Y coordinate

          // Move to the starting point
          polylineShape.moveTo(firstX, firstZ);
          results.data.forEach((row) => {
            // Parse X and Y coordinates from CSV
            const x = parseFloat(row.X);
            const z = parseFloat(row.Y); // Use 'z' for the Y coordinate

            // Add points to the polyline shape
            polylineShape.lineTo(x, z);
          });

          // Extrude the entire polyline shape along the Y-axis to create a 3D object
          const extrudeSettings = {
            depth: depth, // Extrusion depth based on your yOffset
            bevelEnabled: false,
          };
          const geometry = new THREE.ExtrudeGeometry(
            polylineShape,
            extrudeSettings
          );

          // Create a mesh with the red material
          const object = new THREE.Mesh(geometry, extrusionMaterial);

          // Position the object at (0, 0, 0) or adjust as needed
          object.position.set(0, 0, -depth / 2);
          //  object.rotation.x = -0.5 * Math.PI;

          // Add the object to the scene
          scene.add(object);
        }
      },
    });

    const texture_logo = new THREE.TextureLoader().load(
      "/src/assets/autoboq.jpg"
    );
    texture_logo.colorSpace = THREE.SRGBColorSpace;
    const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      map: texture_logo,
      roughness: 0.5, // Adjust the roughness to control the surface roughness
      metalness: 0.5, // Adjust the metalness to control how metallic the surface looks
    });
    const cube_logo = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube_logo.castShadow = true;
    cube_logo.receiveShadow = true;

    // Load the texture

    const animateCube = () => {
      cube_logo.rotation.y += 0.005; // Rotate the cube around the x-axis
      cube_logo.rotation.z += 0.005; // Rotate the cube around the y-axis
    };
    cube_logo.position.set(23, 3, -12);
    scene.add(cube_logo);
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      animateCube();
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
    };
  }, []);

  return <div ref={sceneRef} id="three-scene"></div>;
}

export default ThreeScene;
