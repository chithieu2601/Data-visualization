//  
// a10.js
// Template code for CSC444 Assignment 10, Fall 2025
// Joshua A. Levine <josh@arizona.edu>
//
// This implements an editable transfer function to be used in concert
// with the volume renderer defined in volren.js
//
// It expects a div with id 'tfunc' to place the d3 transfer function
// editor
//


////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// D3 layout variables
let size = 500;
let svg = null;

// Scale Variables 
let xScale = null;
let yScale = null;
let colorScale = null;

////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  
  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  // Axis groups
  svg.append("g").attr("class", "xaxis")
     .attr("transform", `translate(0, ${size - 70})`);

  svg.append("g").attr("class", "yaxis")
     .attr("transform", `translate(70, 0)`);

  // One path element for the opacity curve (single path)
  svg.append("path")
     .attr("class", "opacityline")
     .attr("fill", "none")
     .attr("stroke", "#111")
     .attr("stroke-width", 1);

  // Group for points
  svg.append("g").attr("class", "points");

  // Group for colorbar
  svg.append("g").attr("class", "colorbar");

  // initial render
  updateTFunc();
}


// Call this function whenever the TF updates
function updateTFunc() {
  // update x/y scales with actual dataRange
  xScale = d3.scaleLinear()
    .domain([dataRange[0], dataRange[1]])
    .range([70, size - 50]);

  yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([size - 70, 50]);

  // ensure colorScale domain is correct (if colorScale undefined, set a default)
  if (!colorScale) {
    colorScale = d3.scaleSequential(d3.interpolateCool)
      .domain([dataRange[0], dataRange[1]]);
  } else if (typeof colorScale.domain === "function") {
    colorScale.domain([dataRange[0], dataRange[1]]);
  }

  // draw axes
  svg.select(".xaxis")
    .call(d3.axisBottom(xScale).ticks(8));
  svg.select(".yaxis")
    .call(d3.axisLeft(yScale).ticks(8));

  // build a line generator for the opacity curve (monotone smoothing optional)
  const lineGen = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  // draw path
  svg.select(".opacityline")
    .datum(opacityTF)
    .attr("d", lineGen);

  // draw points (enter/update/exit)
  const dragBehavior = d3.drag()
    .on("start", dragInitiated)
    .on("drag", dragged)
    .on("end", dragEnded);

  svg.select(".points")
    .selectAll("circle")
    .data(opacityTF)
    .join(
    enter => enter.append("circle")
                  .attr("r", 7)
                  .attr("stroke", "#222")
                  .attr("stroke-width", 1.2)
                  .style("cursor","pointer")
                  .call(dragBehavior)
  )
  .attr("cx", d => xScale(d[0]))
  .attr("cy", d => yScale(d[1]))
  .attr("fill", d => { return colorScale(d[0]); });

  // draw the colorbar under the axes (sample across dataRange)
  const barGroup = svg.select(".colorbar");
  const samples = 120;
  const barY = size - 40;
  const barH = 20;
  const leftX = xScale(dataRange[0]);
  const rightX = xScale(dataRange[1]);
  const barWidth = rightX - leftX;
  const rectW = barWidth / samples;

  const sampled = d3.range(samples).map(i => {
    return dataRange[0] + (i / (samples - 1)) * (dataRange[1] - dataRange[0]);
  });

  const rects = barGroup.selectAll("rect").data(sampled);

  rects.join(
    enter => enter.append("rect"),
    upd => upd,
    exit => exit.remove()
  )
  .attr("x", d => xScale(d))
  .attr("y", barY)
  .attr("width", Math.max(1, rectW))
  .attr("height", barH)
  .attr("fill", d => colorScale(d))
  .attr("stroke", "none");

  // add numeric ticks under colorbar (small labels)
  // remove existing labels then add new ones
  svg.selectAll(".colorbarTick").remove();
  const ticks = xScale.ticks(6);
  svg.selectAll(".colorbarTick")
    .data(ticks)
    .enter()
    .append("text")
    .attr("class", "colorbarTick")
    .attr("x", d => xScale(d))
    .attr("y", barY + barH + 12)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text(d => d3.format(".2f")(d));
}

// Start system
resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

let selected = null;

function dragInitiated(event, d) {
  selected = parseInt(d3.select(this).attr("index"));
}

function dragged(event, d) {
  if (selected == null) return;

  let posX = event.x;
  let posY = event.y;

  let valX = xScale.invert(posX);
  let valY = yScale.invert(posY);
  valY = Math.max(0, Math.min(1, valY));

  let left = selected === 0 ? dataRange[0] : opacityTF[selected - 1][0];
  let right = selected === opacityTF.length - 1 ? dataRange[1] : opacityTF[selected + 1][0];

  if (selected === 0) valX = dataRange[0];
  else if (selected === opacityTF.length - 1) valX = dataRange[1];
  else valX = Math.max(left, Math.min(right, valX));

  opacityTF[selected] = [valX, valY];

  updateTFunc();
}

function dragEnded() {
  selected = null;
}


////////////////////////////////////////////////////////////////////////
// Data upload function

function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function () {
      let fileData = fReader.result;

      initializeVR(fileData);

      resetTFs();
      updateTFunc();
      updateVR(colorTF, opacityTF, false);
    }
  }
}

var input = document.getElementById("loadData");
input.addEventListener("change", upload);


////////////////////////////////////////////////////////////////////////
// TRANSFER FUNCTION PRESETS

function resetTFs() {
  makeSequential(); // default
  makeOpacity();
}


// Default opacity TF (7 points)
function makeOpacity() {
  opacityTF = [
    [dataRange[0],             0.0],    // 0%
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.25, 0.25],
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.50, 0.50],
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.75, 0.75],
    [dataRange[1],             1.0]     // 100%
  ];
}



// ========== SEQUENTIAL ==========
function makeSequential() {
  colorScale = d3.scaleLinear()
      .domain([dataRange[0], dataRange[1]])
      .range(["#000000", "#ffffcc"])           // or your colors
      .interpolate(d3.interpolateHcl);

  // build colorTF from interpolation
  colorTF = d3.range(9).map((i) => {
    let t = i / 8;
    let x = dataRange[0] + t * (dataRange[1] - dataRange[0]);
    return [x, d3.rgb(colorScale(x))];
  });

}

// ========== BUTTON CALLBACKS ==========

// SEQUENTIAL
d3.select("#sequential").on("click", function () {
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});


// DIVERGING
d3.select("#diverging").on("click", function () {
  colorScale = d3.scaleLinear()
      .domain([dataRange[0], (dataRange[0] + dataRange[1]) / 2, dataRange[1]])
      .range(["blue", "white", "red"])
      .interpolate(d3.interpolateHcl);

  colorTF = d3.range(9).map((i) => {
    let t = i / 8;
    let x = dataRange[0] + t * (dataRange[1] - dataRange[0]);
    return [x, d3.rgb(colorScale(x))];
  });

  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});


// CATEGORICAL
d3.select("#categorical").on("click", function () {
  const colors = d3.schemeSet1;

  colorTF = d3.range(9).map((i) => [
    dataRange[0] + (i / 8) * (dataRange[1] - dataRange[0]),
    d3.rgb(colors[i])
  ]);

  colorScale = d3.scaleQuantize()
      .domain([dataRange[0], dataRange[1]])
      .range(colors);

  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});
