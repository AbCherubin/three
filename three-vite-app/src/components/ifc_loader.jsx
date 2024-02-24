import { useRef, useEffect } from "react";
import * as THREE from "three";
import * as OBC from "openbim-components";
import * as WEBIFC from "web-ifc";

function IFC_loader() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const loadIFCModel = async () => {
      const components = new OBC.Components();
      components.scene = new OBC.SimpleScene(components);
      components.renderer = new OBC.SimpleRenderer(
        components,
        sceneRef.current
      );
      components.camera = new OBC.SimpleCamera(components);
      components.raycaster = new OBC.SimpleRaycaster(components);
      components.init();

      const scene = components.scene.get();
      components.camera.controls.setLookAt(10, 30, 10, 0, 0, 0);

      const grid = new OBC.SimpleGrid(components);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
      const boxGeometry = new THREE.BoxGeometry(3, 3, 3);
      const cube = new THREE.Mesh(boxGeometry, boxMaterial);
      cube.position.set(0, 1.5, 0);
      //scene.add(cube);
      components.scene.setup();
      let fragments = new OBC.FragmentManager(components);
      let fragmentIfcLoader = new OBC.FragmentIfcLoader(components);
      fragmentIfcLoader.settings.wasm = {
        path: "https://unpkg.com/web-ifc@0.0.46/",
        absolute: true,
      };
      const excludedCats = [
        WEBIFC.IFCTENDONANCHOR,
        WEBIFC.IFCREINFORCINGBAR,
        WEBIFC.IFCREINFORCINGELEMENT,
      ];
      for (const cat of excludedCats) {
        fragmentIfcLoader.settings.excludedCategories.add(cat);
      }
      fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
      fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

      async function loadIfcAsFragments() {
        const file = await fetch("src/assets/test.ifc");
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragmentIfcLoader.load(buffer, "example");
        model.position.set(0, 0, 0);

        scene.add(model);
      }
      loadIfcAsFragments();

      // Clean up when component unmounts
      return () => {
        components.dispose();
        fragments.dispose();
      };
    };

    loadIFCModel();
  }, []);
  return (
    <div
      ref={sceneRef}
      id="three-scene"
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    ></div>
  );
}

export default IFC_loader;
