export function getColor(item) {
  var hue = 0; // default hue (red)
  var lightness = 60; // default lightness
  var str = item[1]; // the code label e.g. "version", "txIn[0]hash", "txOut[0]script", etc.

  if (str === "version") {
    hue = 30;
    lightness -= 10;
  }

  if (str === "marker" || str === "flag" || str.startsWith("witness")) {
    hue = 200;
    lightness += 10;
  }

  if (str.startsWith("txIn")) {
    // txIn hash
    hue = 120; 
    if (str.endsWith("index")) {
      hue -= 50; 
    }
    if (str.endsWith("script")) {
      hue += 50; 
    }
    if (str.endsWith("sequence")) {
      hue = 310; 
    }
  }

  if (str.startsWith("txOut")) {
    hue = 30;
    lightness += 10;
    if (str.endsWith("script")) {
      hue += 20;
    }
  }

  if (str === "locktime") {
    hue = 260;
    lightness += 10;
  }

  if (str.endsWith("VarInt")) {
    hue = 340;
  }

  return `hsl(${hue}, 100%, ${lightness}%);`;
}
