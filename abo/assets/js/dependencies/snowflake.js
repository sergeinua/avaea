
var c = document.getElementById("snowflake");
var dimX = c.width;
var dimY = c.height;

var lenFactor = 0.8, polySize = 0.9, starSize = 0.7;

var rotAngle = Math.sin(Date.now()*0.001)*1, dir = -1, demo_is_running = 0;

////
var oldNsides = 10;
var oldParams1;

function snowflakeInit(_canvas, params) {
  var nSides =  10;
  oldParams1 = normalizeParams(params);

  var params1 = oldParams1;
  var start = Date.now();
  //dir = -dir;
  rotAngle += dir * Math.sin((Date.now() - start)*0.001)*0.07;
  computeAndDraw(nSides, params1);
}


// Demo 1
/*
 var s1 = [[-0.5, 0.5], [0.5, 0.5]];
 drawSegment(s1, "red");
 var s2 = rotateSegment(s1, Math.PI / 3);
 drawSegment(s2, "blue");
 var s3 = [midPoint(s2), perpPoint(s2)];
 var poly = [s2, s3];
 drawPolygon(poly);
 */

// Demo 2
/* poly = genPolygon(6);
 drawPolygon(poly);
 */

function randomizeSnowflake() {
  var x = document.getElementById("frm1");
  x.elements[0].value = 5 + Math.floor(Math.random() * 8 + 1);
  for (var i = 1; i < x.length ;i++) {
    x.elements[i].value = Math.random() * 60;
  }
  return;
}

demo_auto_is_running = 0;

function demo_auto() {
  if (demo_auto_is_running != 0) {
    demo_auto_is_running = 0;
    return;
  }
  if (demo_is_running != 0) return;
  demo_auto_is_running = 1;

  {
    demo_is_running = 0;
    custom_snowflake();
    demo_is_running = 1;
  }
  var interval1 = setInterval(function() {
    if (demo_auto_is_running == 0) return;
    randomizeSnowflake();
    {
      demo_is_running = 0;
      custom_snowflake();
      demo_is_running = 1;
    }
  }, 3000);
  setTimeout(function(){
    clearInterval(interval1);
    demo_auto_is_running = 0;
    demo_is_running = 0;
  }, 120000);
  return;
}

function random_snowflake() {
  if (demo_is_running != 0) return;
  demo_is_running = 1;
  randomizeSnowflake();
  demo_is_running = 0;
  custom_snowflake();
  return;
}

function custom_snowflake() {
  if (demo_is_running != 0) return;
  demo_is_running = 1;
  var x = document.getElementById("frm1");
  var nSides =  x.elements[0].value;
  var params = [];
  for (var i = 1; i < x.length ;i++) {
    params.push(x.elements[i].value);
  }
  var params1 = normalizeParams(params);
  var start = Date.now();
  dir = -dir;
  var interval = setInterval(function() {
    rotAngle += dir * Math.sin((Date.now() - start)*0.001)*0.07;
    computeAndDraw(oldNsides, oldParams1);
  }, 100);
  setTimeout(function(){
    clearInterval(interval);
    computeAndDraw(nSides, params1);
    oldNsides = nSides;
    oldParams1 = params;
    demo_is_running = 0;
  }, 1500);
}

function animate_snowflake() {
  if (demo_is_running !== 0) return;
  demo_is_running = 1;
  var x = document.getElementById("frm1");
  var nSides =  x.elements[0].value;
  var params = [];
  for (var i = 1; i < x.length ;i++) {
    params.push(x.elements[i].value);
  }
  var params1 = normalizeParams(params);
  var start = Date.now();
  var interval = setInterval(function() {
    params1[0] += (0 + Math.sin((Date.now() - start)*0.001)*0.1);
    params1[1] += (0 + Math.sin((Date.now() - start)*0.003)*0.5);
    params1[2] += (0 + Math.sin((Date.now() - start)*0.004)*0.7);
    computeAndDraw(nSides, params1);}, 100);
  setTimeout(function(){
    clearInterval(interval);
    // var params1 = normalizeParams(params);
    // computeAndDraw(nSides, params1);
    demo_is_running = 0;
  }, 10000);
}


function computeAndDraw(nSides, params) {
  var poly = genKochSnowflake(nSides, params);
  starSizeAdj = starSize * (2.0 / 3 + 1.0 / nSides);
  var star = genStar(nSides);
  var snowflake = poly.concat(star);
  fillCanvas();
  snowflake = normalizePolygon(snowflake);
  drawPolygon(snowflake, params);
}

// ------ The function to be called --------
function genKochSnowflake(nSides, paramsArray) {
  var poly = genPolygon(Math.round(nSides));
  for (var i = 0; i < Math.min(paramsArray.length, 3); ++i) {
    var param = paramsArray[i];
    if (i == 0) param *= 0.8;
    if (i == 1) param *= 0.7;
    if (i == 2) param *= 0.6;
    poly = splitPolygon(poly, param);
  }
  return poly;
}

// normalize an arbitrary-range param x to range [-a, a]
function normalizeOneParam(x, a) {
  tmp = Math.sin (Math.PI * x / (2.0 * a));
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
  if (rotAngle) seg = rotateSegment(seg, rotAngle);
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
  if (rotAngle) seg = rotateSegment(seg, rotAngle);
  var polygon = [seg];
  for (var i = 1; i < n; ++i ) {
    seg = rotateSegment(seg, angle);
    polygon.push(seg);
  }
  return polygon;
}

function normalizePolygon(segments) {
  var max_dist = 0;
  var segs = Math.min(segments.length, 200);
  for (i = 0; i < segs; ++i) {
    var dist = segments[i][0][0] + segments[i][0][1];
    if (dist > max_dist) max_dist = dist;
    dist = Math.abs(segments[i][1][0]) + Math.abs(segments[i][1][1]);
    if (dist > max_dist) max_dist = dist;
  }
  var scale = (max_dist > 0 ? 0.8 / max_dist : 1);

  for (i = 0; i < segments.length; ++i) {
    segments[i] = scaleSegment(segments[i], scale);
  }
  return segments;
}

// Drawing functions

function drawPolygon(segments, colors) {
  for (i = 0; i < segments.length; ++i) {
    var style = "azure";
    if (colors.length > 0) {
      var c = colors[i % colors.length];
      var color = Math.round( 220 + normalizeOneParam(35 * c, 35));
      style = "#00" + color.toString(16) + "ff";
    }
    drawSegment(segments[i], style);
  }
}

function drawSegment(seg, style) {
  x0 = seg[0][0] * dimX / 2;
  y0 = seg[0][1] * dimY / 2;
  x1 = seg[1][0] * dimX / 2;
  y1 = seg[1][1] * dimY / 2;

  ctrX = dimX / 2;
  ctrY = dimY / 2;

  var c = document.getElementById("snowflake");
  var ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(ctrX + x0, ctrY + y0);
  ctx.lineTo(ctrX + x1, ctrY + y1);
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.closePath();
}

function fillCanvas() {
  var c = document.getElementById("snowflake");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  var grd=ctx.createRadialGradient(dimX /2 , dimY /2, 10 ,  dimX / 2 ,  dimX /  2, 4 * dimX / 5);
  grd.addColorStop(0,"#000206");
  grd.addColorStop(1,"#004080");
  //grd.addColorStop(1,"DeepSkyBlue");

  // Fill with gradient
  ctx.fillStyle=grd;
  ctx.fillRect(0, 0, dimX, dimY);

  ctx.font = "10px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "azure";
  /*
   ctx.translate(c.width / 2, c.height /2);
   ctx.rotate(Math.sin(Date.now()*0.001)*10);
   ctx.translate(- c.width / 2, - c.height /2);
   */
}

/*
 {
 var c1 = document.getElementById('snowflake');
 var glOpts = { antialias: true, depth: false, preserveDrawingBuffer: true };
 var gl = c1.getContext('webgl', glOpts) || c1.getContext('experimental-webgl', glOpts);
 if(!gl) { console.log("Your browser doesn't seem to support WebGL."); }
 }
 */

