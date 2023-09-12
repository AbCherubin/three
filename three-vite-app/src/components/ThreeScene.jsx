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

    if (sceneRef.current) {
      sceneRef.current.appendChild(renderer.domElement);
    }

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
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.x = 2.4;
    plane.position.z = -0.7;
    plane.position.y = 0;
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = false;
    scene.add(plane);

    Papa.parse("/src/assets/cubes.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function (results) {
        if (results.data && results.data.length > 0) {
          let geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const mesh = new THREE.InstancedMesh(
            geometry,
            material,
            results.data.length / 2
          );
          mesh.rotation.x = -0.5 * Math.PI;
          scene.add(mesh);

          let start_x,
            start_y,
            stop_x,
            stop_y,
            Polyline_ID,
            color = null;

          let i = 0;
          let beam_height = 2;
          let beam_width = 0.01;
          const dummy = new THREE.Object3D();
          dummy.scale.z = beam_height;
          dummy.position.z = beam_height / 2;

          results.data.forEach((row) => {
            if (Polyline_ID !== row.Polyline_ID && Polyline_ID) {
              mesh.setMatrixAt(i, dummy.matrix);
              mesh.setColorAt(i, new THREE.Color(color));
              i++;
            }

            if (row.Point_Index == 0) {
              start_x = parseFloat(row.X);
              start_y = parseFloat(row.Y);

              Polyline_ID = row.Polyline_ID;
              color = row.Color;
            } else {
              stop_x = parseFloat(row.X);
              stop_y = parseFloat(row.Y);

              const dx = start_x - stop_x;
              const dy = start_y - stop_y;

              const length = Math.sqrt(dx * dx + dy * dy);
              const angleRad = Math.atan2(dy, dx);

              const centerX = (start_x + stop_x) / 2;
              const centerY = (start_y + stop_y) / 2;

              dummy.scale.x = length;
              dummy.scale.y = beam_width;
              dummy.position.set(centerX, centerY);
              dummy.rotation.z = angleRad;

              dummy.updateMatrix();

              start_x = stop_x;
              start_y = stop_y;
            }
          });
          mesh.instanceMatrix.needsUpdate = true;
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
      cube_logo.rotation.y += 0.005;
      cube_logo.rotation.z += 0.005;
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
