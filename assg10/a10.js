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

// Chi Thieu
//  Implement two functions initializeTFunc() and updateTFunc() and associated UI callbacks. 
// initializeTFunc() is meant to be called once upon loading the window and creates the svg object and initial interface. 
// updateTFunc() should be called to redraw the visual interface any time colorTF or opacityTF changes.

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

// Variables for the scales
let xScale = null;
let yScale = null;
let colorScale = null;


////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  // Create SVG
  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  // Axes groups
  svg.append("g").attr("class", "xaxis")
     .attr("transform", `translate(0, ${size - 70})`);

  svg.append("g").attr("class", "yaxis")
     .attr("transform", `translate(70, 0)`);

  // Path for opacity curve
  svg.append("path")
     .attr("class", "opacityline")
     .attr("fill", "none")
     .attr("stroke", "#111")
     .attr("stroke-width", 1.5);

  // Group for opacity points
  svg.append("g").attr("class", "points");

  // Group for colorbar
  svg.append("g").attr("class", "colorbar");

  // Drag behavior
  const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  // Draw initial points
  svg.select(".points")
    .selectAll("circle")
    .data(opacityTF)
    .enter()
    .append("circle")
    .attr("index", (d, i) => i)
    .attr("r", 7)
    .attr("stroke", "#222")
    .attr("stroke-width", 1.2)
    .style("cursor", "pointer")
    .call(drag);

  // Initial update
  updateTFunc();
}

function updateTFunc() {
  // Update scales
  xScale = d3.scaleLinear()
             .domain([dataRange[0], dataRange[1]])
             .range([70, size - 50]);
 
  yScale = d3.scaleLinear()
             .domain([0, 1])
             .range([size - 70, 50]);

  if (!colorScale) makeSequential();

  // Update axes
  svg.select(".xaxis").call(d3.axisBottom(xScale).ticks(8));
  svg.select(".yaxis").call(d3.axisLeft(yScale).ticks(8));

  // Update opacity curve
  const lineGen = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));

  svg.select(".opacityline")
    .datum(opacityTF)
    .attr("d", lineGen);

  svg.select(".points")
    .selectAll("circle")
    .data(opacityTF)
    .join(
      enter => enter.append("circle")
                    .attr("index", (d, i) => i)
                    .attr("r", 7)
                    .attr("stroke", "#222")
                    .attr("stroke-width", 1.2)
                    .style("cursor", "pointer"))
    .attr("cx", d => xScale(d[0]))
    .attr("cy", d => yScale(d[1]))
    .attr("fill", d => colorScale(d[0]));

  // Update colorbar
  const barGroup = svg.select(".colorbar");
  const samples = 120;
  const barY = size - 40;
  const barH = 20;
  const leftX = xScale(dataRange[0]);
  const rightX = xScale(dataRange[1]);
  const barWidth = rightX - leftX;
  const rectW = barWidth / samples;

  const sampled = d3.range(samples).map(i => dataRange[0] + (i / (samples - 1)) * (dataRange[1] - dataRange[0]));

  barGroup.selectAll("rect")
    .data(sampled)
    .join(
      enter => enter.append("rect"),
      update => update,
      exit => exit.remove()
    )
    .attr("x", d => xScale(d))
    .attr("y", barY)
    .attr("width", Math.max(1, rectW))
    .attr("height", barH)
    .attr("fill", d => colorScale(d))
    .attr("stroke", "none");

  // Add numeric ticks under colorbar
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

// To start, let's reset the TFs and then initialize the d3 SVG canvas
// to draw the default transfer function

resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

// Will track which point is selected
let selected = null;

// Called when mouse down
function dragstarted(event,d) {
  selected = parseInt(d3.select(this).attr("index"));
}

// Called when mouse drags
function dragged(event,d) {
  if (selected != null) {
    let pos = [];
    pos[0] = xScale.invert(event.x);
    pos[1] = yScale.invert(event.y);

    //based on pos and selected, update opacityTF
    //TODO: WRITE THIS

    if (pos[1] < 0) pos[1] = 0;
    if (pos[1] > 1) pos[1] = 1;

    if (selected === 0) {
      left = dataRange[0];
    } else {
      left = opacityTF[selected - 1][0];
    }

    if (selected === opacityTF.length - 1) {
      right = dataRange[1];
    } else {
      right = opacityTF[selected + 1][0];
    }

    if (selected === 0) {
      pos[0] = dataRange[0];
    } else if (selected === opacityTF.length - 1) {
      pos[0] = dataRange[1];
    } else {
      if (pos[0] < left) pos[0] = left;
      if (pos[0] > right) pos[0] = right;
    }

    opacityTF[selected] = pos;

    //update TF window
    updateTFunc();
    
    //update volume renderer
    updateVR(colorTF, opacityTF);
  }
}

// Called when mouse up
function dragended() {
  selected = null;
}




////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function(e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();
      
      //update the TFs with the volren
      updateVR(colorTF, opacityTF, false);
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", upload);



////////////////////////////////////////////////////////////////////////
// Functions to respond to buttons that switch color TFs

function resetTFs() {
  makeSequential();
  makeOpacity();
}

// Make a default opacity TF
function makeOpacity() {
  //TODO: WRITE THIS

  //Here is a default TF
  //note that opacityTF need not have the same number of points as colorTF
  //nor do those points need to be in same positions.
  opacityTF = [
    [dataRange[0], 0.0],
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.25, 0.25],
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.50, 0.50],
    [dataRange[0] + (dataRange[1]-dataRange[0]) * 0.75, 0.75],
    [dataRange[1], 1.0]
  ];
}

// Make a sequential color TF
function makeSequential() {
  //TODO: WRITE THIS
  colorScale = d3.scaleSequential()
      .domain([dataRange[0], dataRange[1]])
      .interpolator(d3.interpolateBlues);

  // build colorTF from interpolation
  colorTF = d3.range(9).map((i) => {
    let t = i / 8;
    let x = dataRange[0] + t * (dataRange[1] - dataRange[0]);
    return [x, d3.rgb(colorScale(x))];
  });
}

// Configure callbacks for each button
d3.select("#sequential").on("click", function() {
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

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

d3.select("#categorical").on("click", function () {
  let colors = d3.schemeAccent;

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