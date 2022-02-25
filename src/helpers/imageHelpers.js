export const createCanvas = (
  rasterVals,
  min,
  max,
  height = 256,
  width = 256,
  color = "yellow"
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const imageData = context.createImageData(width, height);
  const rgbaData = imageData.data;

  // Do something to turn real values into RGBA array 0-255
  const factor = 256 / (max - min);
  let value = 0;
  let j;
  // Loop through elevation array to generate an
  // image that will be displayed.
  // As mentioned above `pixels` is a flat array of color values
  // and alpha [r, g, b, a, r, g, b, a, ...]
  // We need to iterate through elevations and assign color
  // and alpha values respectively.
  for (let i = 0; i < width * height; i++) {
    // read the elevation value at the given index from the elevation
    // array and multiply it by the factor. This will define
    // the shade of yellow color for the pixel.
    // map tile size is 256x256. Elevation values have a
    // tile size of 257 so we skip the last elevation
    // whenever "i" is incremented by 256 to jump to the next row.
    j = i + Math.floor(i / width);
    // read the elevation value at the given index from the elevation
    // array and multiply it by the factor. This will define
    // the shade of yellow color for the pixel.
    value = (rasterVals[j] - min) * factor;

    // create RGBA value for the pixels
    rgbaData[i * 4] = color === "yellow" ? value : 0; // r
    rgbaData[i * 4 + 1] = value; // g
    rgbaData[i * 4 + 2] = color !== "yellow" ? value : 0; // b
    rgbaData[i * 4 + 3] = rgbaData[i * 4 + 3] = 255; // a
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
};
