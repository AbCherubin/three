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
    const create_object = (polylineShape, color) => {
      const depth = 4;
      const extrusionMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
      }); // Red color material
      console.log(color);

      const extrudeSettings = {
        depth: depth,
        bevelEnabled: false,
      };
      const geometry = new THREE.ExtrudeGeometry(
        polylineShape,
        extrudeSettings
      );
      geometry.rotateX(-0.5 * Math.PI);
      const object = new THREE.Mesh(geometry, extrusionMaterial);

      object.position.set(0, 0, 0);
      scene.add(object);
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      scene.add(line);
    };

    Papa.parse("/src/assets/cubes.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.data && results.data.length > 0) {
          // Parse the first data point
          let Polyline_ID = null;
          let Polyline_Color = null;
          // Move to the starting point
          let polylineShape = new THREE.Shape();
          results.data.forEach((row) => {
            if (Polyline_ID !== row.Polyline_ID && Polyline_ID) {
              create_object(polylineShape, Polyline_Color);
              polylineShape = new THREE.Shape();
            }

            if (row.Point_Index == 0) {
              const firstX = parseFloat(row.X);
              const firstZ = parseFloat(row.Y);
              polylineShape.moveTo(firstX, firstZ);
              Polyline_ID = row.Polyline_ID;
              Polyline_Color = row.Color;
            } else {
              const x = parseFloat(row.X);
              const z = parseFloat(row.Y);
              polylineShape.lineTo(x, z);
            }
          });
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