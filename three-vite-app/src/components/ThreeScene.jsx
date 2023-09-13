import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Papa from "papaparse";
import * as TWEEN from "@tweenjs/tween.js";

function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, mesh;
    let isDownArrowKeyPressed = false;
    let isUpArrowKeyPressed = false;
    let animating = false;
    let displaying3D = false;
    let isLeftArrowKeyPressed = false;
    let isRightArrowKeyPressed = false;
    let list_dummy = [];
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
          mesh = new THREE.InstancedMesh(
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
            color = null;

          let i = 0;
          let beam_height = 4;
          let beam_width = 0.01;
          const dummy = new THREE.Object3D();

          results.data.forEach((row) => {
            if (row.Point_Index == 0) {
              start_x = parseFloat(row.X);
              start_y = parseFloat(row.Y);
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
              list_dummy.push({
                height: beam_height,
                color: color,
              });

              dummy.scale.z = 0.001;
              dummy.position.z = 0.001 / 2;

              dummy.updateMatrix();

              start_x = stop_x;
              start_y = stop_y;

              mesh.setMatrixAt(i, dummy.matrix);
              mesh.setColorAt(i, new THREE.Color("#ffffff"));

              i++;
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
    cube_logo.position.set(23, 3, -12);
    scene.add(cube_logo);

    const animateCube = () => {
      cube_logo.rotation.y += 0.005;
      cube_logo.rotation.z += 0.005;
    };

    function MeshGoUp() {
      let timer = 3000;

      for (let i = 0; i < mesh.count; i++) {
        let dummy = new THREE.Object3D();
        let mat4 = new THREE.Matrix4();
        let t = 2000;
        const startColor = new THREE.Color(0xffffff); // Red
        const endColor = new THREE.Color(list_dummy[i].color); // Green
        const colorTween = new TWEEN.Tween(startColor)
          .to(endColor, 0)
          .onUpdate(() => {
            mesh.setColorAt(i, startColor);
            mesh.instanceColor.needsUpdate = true;
          });

        mesh.getMatrixAt(i, mat4);
        mat4.decompose(dummy.position, dummy.quaternion, dummy.scale);

        const mesh_current = {
          scale_z: dummy.scale.z,
          position_z: dummy.position.z,
        };
        const upMeshPosition = new TWEEN.Tween(mesh_current)
          .to({ scale_z: list_dummy[i].height }, t)
          .onUpdate(() => {
            dummy.scale.z = mesh_current.scale_z;
            dummy.position.z = mesh_current.scale_z / 2;
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.instanceMatrix.needsUpdate = true;
          })
          .easing(TWEEN.Easing.Exponential.Out)
          .onComplete(() => {
            // mesh.setColorAt(i, new THREE.Color(list_dummy[i].color));
            // mesh.instanceColor.needsUpdate = true;
          })
          .start()
          .chain(colorTween);
      }

      const resetAnimate = new TWEEN.Tween()
        .to({}, 0)
        .onUpdate(() => {
          animating = false;
        })
        .delay(timer)
        .start();
    }

    function MeshGoDown() {
      let timer = 2000;
      for (let i = 0; i < mesh.count; i++) {
        let dummy = new THREE.Object3D();
        let mat4 = new THREE.Matrix4();
        let t = Math.random() * timer;
        mesh.getMatrixAt(i, mat4);
        mat4.decompose(dummy.position, dummy.quaternion, dummy.scale);

        const mesh_current = {
          scale_z: dummy.scale.z,
          position_z: dummy.position.z,
        };

        const downMeshPosition = new TWEEN.Tween(mesh_current)
          .to({ scale_z: 0.001 }, t)
          .onUpdate(() => {
            dummy.scale.z = mesh_current.scale_z;
            dummy.position.z = mesh_current.scale_z / 2;
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
            mesh.instanceMatrix.needsUpdate = true;
          })
          .easing(TWEEN.Easing.Sinusoidal.Out)
          .onStart(() => {
            mesh.setColorAt(i, new THREE.Color("#ffffff"));
            mesh.instanceColor.needsUpdate = true;
          })
          .start();
      }

      const resetAnimate = new TWEEN.Tween()
        .to({}, 0)
        .onUpdate(() => {
          animating = false;
        })
        .delay(timer)
        .start();
    }
    function rotatePlaneRight() {
      const t = 1000;
      const buffer_rotation = plane.rotation.y;
      const current = {
        y_rotation: plane.rotation.y,
        z_scale: mesh.scale.z,
        y_scale: mesh.scale.y,
        x_scale: mesh.scale.x,
      };

      const tween1 = new TWEEN.Tween(current)
        .to({ y_rotation: buffer_rotation + Math.PI }, t)
        .onUpdate(() => {
          plane.rotation.y = current.y_rotation;
          mesh.rotation.y = current.y_rotation;
        })
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .onComplete(() => {
          //plane.rotation.y = 0;
          //mesh.rotation.y = 0;
          plane.material.map = texture;
          plane.material.needsUpdate = true;
        });

      const resetAnimate = new TWEEN.Tween(current).to({}, 0).onUpdate(() => {
        animating = false;
      });

      tween1.start().chain(resetAnimate);
    }
    function rotatePlaneLeft() {
      const t = 1000;
      const buffer_z = mesh.scale.z;
      const buffer_x = mesh.scale.x;
      const buffer_y = mesh.scale.y;
      const buffer_rotation = plane.rotation.y;
      const current = {
        y_rotation: plane.rotation.y,
        z_scale: mesh.scale.z,
        y_scale: mesh.scale.y,
        x_scale: mesh.scale.x,
      };

      const tween1 = new TWEEN.Tween(current)
        .to({ y_rotation: buffer_rotation - Math.PI }, t)
        .onUpdate(() => {
          plane.rotation.y = current.y_rotation;
          mesh.rotation.y = current.y_rotation;
          console.log(current.y_rotation);
        })
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .onComplete(() => {
          //plane.rotation.y = 0;
          //mesh.rotation.y = 0;
          plane.material.map = texture;
          plane.material.needsUpdate = true;
        });

      const tween2 = new TWEEN.Tween(current)
        .to({ z_scale: 0 }, t / 8)
        .onUpdate(() => {
          // mesh.scale.z = current.z_scale;
        })
        .onComplete(() => {});

      const resetMeshPosition = new TWEEN.Tween(current)
        .to({ z_scale: buffer_z, y_scale: buffer_y, x_scale: buffer_x }, t / 4)
        .onUpdate(() => {
          mesh.scale.z = current.z_scale;
          mesh.scale.y = current.y_scale;
          mesh.scale.x = current.x_scale;
        });

      const resetAnimate = new TWEEN.Tween(current).to({}, 0).onUpdate(() => {
        animating = false;
      });

      tween1.start().chain(resetAnimate);
      tween2.start();
    }

    const animate = () => {
      requestAnimationFrame(animate);
      if (isDownArrowKeyPressed) {
        animating = true;
        displaying3D = false;
        MeshGoDown();
        isDownArrowKeyPressed = false;
      }
      if (isUpArrowKeyPressed) {
        animating = true;
        displaying3D = true;
        MeshGoUp();
        isUpArrowKeyPressed = false;
      }
      if (isLeftArrowKeyPressed) {
        animating = true;

        rotatePlaneLeft();
        isLeftArrowKeyPressed = false;
      }
      if (isRightArrowKeyPressed) {
        animating = true;

        rotatePlaneRight();
        isRightArrowKeyPressed = false;
      }
      animateCube();
      TWEEN.update();
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && !animating && displaying3D) {
        isDownArrowKeyPressed = true;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" && !animating && !displaying3D) {
        isUpArrowKeyPressed = true;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" && !animating) {
        isLeftArrowKeyPressed = true;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" && !animating) {
        isRightArrowKeyPressed = true;
      }
    });
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
