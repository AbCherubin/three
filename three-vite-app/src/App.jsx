import "./App.css";
import ThreeScene from "./components/ThreeScene";
import IFC_loader from "./components/ifc_loader";
import KMLViewer from "./components/KMLViewer";
import Map_BKK from "./components/Map_BKK";
function App() {
  return (
    <>
      <div className="app">
        <IFC_loader />
        {/* <ThreeScene /> */}
        {/* <KMLViewer /> */}
        {/* <Map_BKK /> */}
      </div>
    </>
  );
}

export default App;
