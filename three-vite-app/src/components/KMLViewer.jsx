import { useEffect } from "react";
import * as THREE from "three";
import proj4 from "proj4";

function KMLViewer() {
  proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
  proj4.defs(
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"
  );

  useEffect(() => {
    fetchAndParseKML();

    return () => {};
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
    const features = [];

    // Use a KML parsing library or custom code to extract features from KML
    // Example: Use regex to extract Placemark elements from KML
    const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
    let match;

    while ((match = placemarkRegex.exec(kml)) !== null) {
      const placemark = match[1];
      const coordinatesMatch = /<coordinates>(.*?)<\/coordinates>/s.exec(
        placemark
      );

      if (coordinatesMatch) {
        const coordinatesText = coordinatesMatch[1];
        const coordinatesArray = coordinatesText.split(" ").map((coordStr) => {
          const [lon, lat, alt] = coordStr.split(",").map(parseFloat);
          return { x: lon, y: lat, z: alt };
        });

        // Extract color and Layer_overlay
        const colorMatch = /<SimpleData name="color">(.*?)<\/SimpleData>/s.exec(
          placemark
        );
        const layerOverlayMatch =
          /<SimpleData name="Layer_overlay">(.*?)<\/SimpleData>/s.exec(
            placemark
          );

        const fidMatch = /<SimpleData name="fid">(.*?)<\/SimpleData>/s.exec(
          placemark
        );
        const fid = fidMatch[1];
        const layerMatch = /<SimpleData name="layer">(.*?)<\/SimpleData>/s.exec(
          placemark
        );
        const layer = layerMatch[1];

        const layerOverlay = layerOverlayMatch
          ? parseInt(layerOverlayMatch[1])
          : 8; // Default is 0

        let color = "#FF0000FF"; // Default color is red (fully opaque)

        if (colorMatch) {
          const colorValue = colorMatch[1]; // Extracted color value
          const colorComponents = colorValue.split(",");

          if (colorComponents.length === 4) {
            // Remove the alpha component
            colorComponents.pop();
          }

          const [r, g, b] = colorComponents.map(Number); // Convert to individual components
          color = `#${r.toString(16).padStart(2, "0")}${g
            .toString(16)
            .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        }

        // Store the extracted data
        features.push({
          coordinates: coordinatesArray,
          color: color,
          layerOverlay: layerOverlay,
          fid: fid,
          layer: layer,
        });
      }
    }

    return features;
  }

  // Convert coordinates to EPSG:3857
  function convertCoordinatesTo3857(data) {
    return data.map((feature) => {
      const convertedVertices = feature.coordinates.map((vertex) => {
        // Convert each vertex from EPSG:4326 to EPSG:3857
        const [x, y] = proj4("EPSG:4326", "EPSG:3857", [vertex.x, vertex.y]);
        return new THREE.Vector3(x, y, vertex.z || 0);
      });

      return {
        ...feature, // Keep the other properties (color, layerOverlay, etc.)
        coordinates: convertedVertices, // Replace coordinates with the converted ones
      };
    });
  }

  function displayKMLData(data) {
    console.log(data);
  }

  return null;
}

export default KMLViewer;
