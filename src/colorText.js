export function getColor(item, txInCount, txOutCount) {
  var hue = 0; // default hue (red)
  var lightness = 40; // default lightness
  var str = item[1]; // the code label e.g. "version", "txIn[0]hash", "txOut[0]script", etc.

  if (str === "version") {
    hue = 30;
    lightness = 30;
  }

  if (str === "marker" || str === "flag") {
    hue = 200;
  }

  if (str.startsWith("txIn")) {
    hue = 70; // green
    if (str.endsWith("index")) {
      hue += 50; 
    }
    if (str.endsWith("script")) {
      hue += 70; 
    }
    if (str.endsWith("sequence")) {
      hue = 280; 
    }
  }

  if (str.startsWith("txOut")) {
    hue = 50;
    if (str.endsWith("script")) {
      hue += 10;
    }
  }

  if (str.startsWith("witness")) {
    hue = 200;
  }

  if (str === "locktime") {
    hue = 260;
    lightness = 50;
  }

  if (str.endsWith("VarInt")) {
    hue = 340;
  }

  return `hsl(${hue % 360}, 100%, ${lightness}%);`;
}
