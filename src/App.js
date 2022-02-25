import "./App.css";

import { Map } from "@esri/react-arcgis";

import CustomLayer from "./CustomLayer";

const loaderOptions = {
  url: process.env.REACT_APP_HTTPS
    ? "https://js.arcgis.com/4.22"
    : "http://js.arcgis.com/4.22",
};
function App() {
  const handleMapLoad = (map, view) => {
    console.log("the Map was loaded");
  };
  return (
    <div style={{ height: "100vH", width: "100%" }}>
      <Map
        loaderOptions={loaderOptions}
        loadElement={<div />}
        mapProperties={{
          basemap: "satellite",
        }}
        viewProperties={{
          zoom: 12,
          center: [74.5535, 36.50879],
        }}
        onLoad={handleMapLoad}
      >
        <CustomLayer />
      </Map>
    </div>
  );
}

export default App;
