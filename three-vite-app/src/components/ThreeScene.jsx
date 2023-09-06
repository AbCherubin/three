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

    plane.position.x = 2.2;
    plane.position.z = 2.8;
    plane.position.y = -0.1;
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;
    scene.add(plane);
    // Ground

    // Create gridHelper
    // const gridHelper = new THREE.GridHelper(100, 1000);
    // gridHelper.rotation.x = -0.5 * Math.PI;
    // scene.add(gridHelper);

    const startPoints = {};
    const xOffset = 104; // Add your X offset here 104
    const yOffset = 75; // Add your Y offset here 75

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
              x: parseFloat(row.X).toFixed(6) - xOffset,
              y: parseFloat(row.Y).toFixed(6) - yOffset,
            };
          } else {
            const startPoint = startPoints[polylineID];
            const endPoint = {
              x: parseFloat(row.X).toFixed(6) - xOffset,
              y: parseFloat(row.Y).toFixed(6) - yOffset,
            };

            let beam_height = 0.6;
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
            let material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(layerColors[layer]),
              flatShading: true,
            });

            let extrusion = new THREE.Mesh(geometry, material);
            extrusion.rotation.x = -0.5 * Math.PI;
            extrusion.castShadow = true;
            extrusion.receiveShadow = true;
            scene.add(extrusion);

            // Store the layer information in userData
            extrusion.userData.layer = row.Layer;
            uniqueLayers.add(row.Layer);
          }
        });
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
