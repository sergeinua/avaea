  var canvas, dimX, dimY;

  var lenFactor = 0.8, polySize = 0.9, starSize = 0.7, starSizeAdj;

  function snowflakeInit(_canvas, params) {

    canvas = _canvas;
    dimX = canvas.width;
    dimY = canvas.height;

    var nSides =  10;
    var poly = genKochSnowflake(nSides, params);
    starSizeAdj = starSize * (2.0 / 3 + 1.0 / nSides);
    var star = genStar(nSides);
    var snowflake = poly.concat(star);
    fillCanvas();
    drawPolygon(snowflake, params);
  }

// ------ The function to be called --------
  function genKochSnowflake(nSides, paramsArray) {
    paramsArray = normalizeParams(paramsArray);
    var poly = genPolygon(nSides);
    for (var i = 0; i < Math.min(paramsArray.length, 3); ++i) {
      poly = splitPolygon(poly, paramsArray[i]);
    }
    return poly;
  }

// normalize an arbitrary-range param x to range [-a, a]
  function normalizeOneParam(x, a) {
    var tmp = Math.sin (Math.PI * x / (2.0 * a));
    return a * tmp;
  }

  function normalizeParams(paramsArray) {
    for (var i = 0; i < paramsArray.length; ++i) {
      paramsArray[i] = normalizeOneParam(paramsArray[i], 7);
      paramsArray[i] = paramsArray[i] * paramsArray[i] / 7;
    }
    return paramsArray;
  }

// angle in radians
  function rotatePoint(pt, angle) {
    var newx = pt[0] * Math.cos(angle) + pt[1] * Math.sin(angle);
    var newy = - pt[0] * Math.sin(angle) + pt[1] * Math.cos(angle);
    return [newx, newy];
  }

  function scalePoint(pt, scale) {
    var newx = pt[0] * scale;
    var newy = pt[1] * scale;
    return [newx, newy];
  }


// angle in radians
  function rotateSegment(seg, angle) {
    return [rotatePoint(seg[0], angle), rotatePoint(seg[1], angle)];
  }

  function scaleSegment(seg, scale) {
    return [scalePoint(seg[0], scale), scalePoint(seg[1], scale)];
  }


// param normally in [0, 1]
  function linCombo(ptA, ptB, param) {
    var x = param * ptA[0] + (1 - param) * ptB[0];
    var y = param * ptA[1] + (1 - param) * ptB[1];
    return [x, y];
  }

  function midPoint(seg) {
    return linCombo (seg[0], seg[1], 0.5);
  }

// given a segment, we build a perp segment of the same length
// starting at mid-point; we return the far end-point of the per segment
  function perpPoint(seg) {
    var midPt = midPoint(seg);
    var pt = [seg[1][0] - midPt[0], seg[1][1] - midPt[1]];
    var ptRotated = rotatePoint(pt, Math.PI / 2);
    return [midPt[0] + lenFactor * ptRotated[0],
      midPt[1] + lenFactor * ptRotated[1]];
  }

// param in [0, 2]
  function splitSegment(seg, param) {
    var midPt = midPoint(seg);
    var ptA = linCombo(seg[0], midPt, param / 2);
    var ptB = linCombo(seg[1], midPt, param / 2);
    var perpPt = perpPoint(seg);

    var s0 = [seg[0], ptA];
    var s1 = [ptA, perpPt];
    var s2 = [perpPt, ptB];
    var s3 = [ptB, seg[1]];
    return [s0, s1, s2, s3];
  }

// param in [0, 2]
  function splitPolygon(segments, param) {
    var newPoly = [];
    for (i = 0; i < segments.length; ++i) {
      var newSegs = splitSegment(segments[i], param);
      newPoly = newPoly.concat(newSegs);
    }
    return newPoly;
  }

// Functions that work with polygons

  function genPolygon(n) {
    var angle = 2 * Math.PI / n;
    var seg = [[0.4, - Math.sin(angle / 2) / 1.70], [0.4 , Math.sin(angle / 2) / 1.70]];
    seg = scaleSegment(seg, polySize);
    seg = rotateSegment(seg, angle / 2);
    var polygon = [seg];
    for (var i = 1; i < n; ++i ) {
      seg = rotateSegment(seg, angle);
      var special = (n > 8 && n % 2 == 0 && i % 2 == 1);
      if (special) seg = scaleSegment(seg, 0.9);
      polygon.push(seg);
      if (special) seg = scaleSegment(seg, 1 / 0.9);
    }
    return polygon;
  }

  function genStar(n) {
    var angle = 2 * Math.PI / n;
    var seg = [[0, 0], [starSizeAdj, 0]];
    seg = rotateSegment(seg, angle / 2);
    var polygon = [seg];
    for (var i = 1; i < n; ++i ) {
      seg = rotateSegment(seg, angle);
      polygon.push(seg);
    }
    return polygon;
  }

// Drawing functions

  function drawPolygon(segments, colors) {
    for (i = 0; i < segments.length; ++i) {
      var style = "azure";
      if (typeof colors == "array") {
        var c = colors[i % colors.length];
        var color = Math.round( 172 + normalizeOneParam(64 * c, 64));
        style = "#00" + color.toString(16) + "ff";
      }
      drawSegment(segments[i], style);
    }
  }

  function drawSegment(seg, style) {
    var x0 = seg[0][0] * dimX / 2,
      y0 = seg[0][1] * dimY / 2,
      x1 = seg[1][0] * dimX / 2,
      y1 = seg[1][1] * dimY / 2;

    var ctrX = dimX / 2,
      ctrY = dimY / 2;

    var c = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.StrokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(ctrX + x0, ctrY + y0);
    ctx.lineTo(ctrX + x1, ctrY + y1);
    ctx.stroke();
    ctx.closePath();
  }

  function fillCanvas() {
    canvas.width = canvas.width;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var grd=ctx.createRadialGradient(dimX /2 , dimY /2, 10 ,  dimX / 2 ,  dimX /  2, 4 * dimX / 5);
    grd.addColorStop(0,"DeepSkyBlue");
    grd.addColorStop(1,"white");

    // Fill with gradient
    ctx.fillStyle=grd;
    ctx.fillRect(0, 0, dimX, dimY);

    ctx.font = "10px Arial";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "azure";
  }
