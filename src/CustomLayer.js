import { useEffect } from 'react';

import { loadModules } from 'esri-loader';
import { Pool } from 'geotiff';
import LRU from 'lru-cache';

import { createCanvas } from './helpers/imageHelpers';

export default function CustomLayer(props) {
  const { map } = props;
  useEffect(() => {
    addCustomLayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCustomLayer = async (tileCache = null, color = "yellow") => {
    if (!map.findLayerById("19")) {
      let myLayer = await loadLayer();
      props.map.addMany([myLayer]);
    }
  };

  const updateColor = () => {
    let layer = props.map.findLayerById("19");

    layer.cancelRequestsInProgress();
    layer.refresh();
    layer.visible = false;
    layer.visible = true;
  };

  const loadLayer = async () => {
    const [BaseTileLayer, esriRequest, LercDecode] = await loadModules([
      "esri/layers/BaseTileLayer",
      "esri/request",
      "lerc/LercDecode",
    ]);

    let options = {
      max: 600, // randomly choose 600. Js memory seems to stay under 50mb
    };

    /**
     * Custom Layer Class
     */
    let CustomTileLayer = BaseTileLayer.createSubclass({
      properties: {
        urlTemplate: null,
        pool: null,
        min: 0,
        max: 4000,
      },
      color: "yellow",
      tileCache: new LRU(options),
      abortController: new AbortController(),
      cancelRequestsInProgress: function () {
        //this.abortController.abort(); //stop all drawing work in progress
        this.color = this.color === "yellow" ? "blue" : "yellow";
        //this.abortController = new AbortController();
      },
      getTileUrl: function (level, row, col) {
        return this.urlTemplate
          .replace("{z}", level)
          .replace("{x}", col)
          .replace("{y}", row)
          .replace("{access_token}", this.accessToken);
      },

      fetchTile: function (level, row, col, options) {
        let url = this.getTileUrl(level, row, col);
        console.log(this.tileCache.size);
        let existingTile = this.tileCache.get(`${level}-${row}-${col}`);
        if (existingTile) {
          let rasterVals = existingTile;
          const canvas = createCanvas(
            rasterVals,
            this.min,
            this.max,
            256,
            256,
            this.color
          );
          return new Promise((resolve) => resolve(canvas));
        } else {
          // request for the tile based on the url returned from getTileUrl() method.
          // the signal option ensures that obsolete requests are aborted.
          return esriRequest(url, {
            responseType: "array-buffer",
            signal: this.abortController.signal,
          })
            .then((response) => {
              const lerc = LercDecode.decode(response.data, { noDataValue: 0 });
              const rasterVals = lerc.pixels[0];
              this.tileCache.set(`${level}-${row}-${col}`, rasterVals);

              const canvas = createCanvas(
                rasterVals,
                this.min,
                this.max,
                256,
                256,
                this.color
              );
              return canvas;
            })
            .catch((err) => {
              if (err.name === "AbortError") {
                console.log("Request aborted");
              } else {
                console.error("Error encountered", err);
              }
            });
        }
      },
    }); // end class

    const url =
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer/tile/{z}/{y}/{x}";

    const pool = new Pool();
    let myLayer = new CustomTileLayer({
      urlTemplate: url,
      pool: pool,
      id: "19",
      max: 6000,
    });
    return myLayer;
  };

  return (
    <div style={{ position: "absolute", left: "30px", bottom: "30px" }}>
      <button
        onClick={updateColor}
        id="btncolor"
        style={{ width: "100px", height: "40px" }}
      >
        Switch Color
      </button>
    </div>
  );
}
