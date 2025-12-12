// 
// a09.js
// Template for CSC444 Assignment 09, Fall 2024
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the template code for A11, providing a skeleton
// for how to initialize and compute isocontours   
//

//Chi Thieu
// Implementation for the marching squares algorithm for extracting isocontours in a piecewise manner

////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries, and helper functions

let svgSize = 490;
let bands = 49;

let xScale = d3.scaleLinear().domain([0, bands]).  range([0, svgSize]);
let yScale = d3.scaleLinear().domain([-1,bands-1]).range([svgSize, 0]);

function createSvg(sel)
{
  return sel
    .append("svg")
    .attr("width", svgSize)
    .attr("height", svgSize);
}

function createGroups(data) {
  return function(sel) {
    return sel
      .append("g")
      .selectAll("rect")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + xScale(d.Col) + "," + yScale(d.Row) + ")";
      });
  };
}

d3.selection.prototype.callReturn = function(callable)
{
  return callable(this);
};

// This function returns the pair [min/max] for a cell d.
function gridExtent(d) {
  return [Math.min(d.NW, d.NE, d.SW, d.SE),
          Math.max(d.NW, d.NE, d.SW, d.SE)];
}



////////////////////////////////////////////////////////////////////////
// Functions for isocontouring

// Given a cell d and an isovalude value, this returns a 4-bit polarity
// signature in result.case as an integer [0,15].  Any bit that is 1
// indicates that the associate cell corner is on or above the contour.
function polarity(d, value) {
  let result = {
    NW: d.NW < value ? 0 : 1,
    NE: d.NE < value ? 0 : 1,
    SW: d.SW < value ? 0 : 1,
    SE: d.SE < value ? 0 : 1
  };
  result.case = result.NW + result.NE * 2 + result.SW * 4 + result.SE * 8;
  return result;
}

// currentContour is a global variable which stores the value
// of the contour we are currently extracting
var currentContour;

function includesOutlineContour(d) {
  let extent = gridExtent(d);
  return currentContour >= extent[0] && currentContour <= extent[1];
}

function includesFilledContour(d) {
  let extent = gridExtent(d);
  return currentContour >= extent[0];
}

function generateOutlineContour(d) {
  // HINT: you should set up scales which, given a contour value, can be
  // used to interpolate the function along each side in the boundary of
  // the square
  let wScale = d3.scaleLinear()
                  .domain([d.SW, d.NW])
                  .range([0, 10]);
  let eScale = d3.scaleLinear()
                  .domain([d.SE, d.NE])
                  .range([0, 10]);
  let nScale = d3.scaleLinear()
                  .domain([d.NW, d.NE])
                  .range([0, 10]);
  let sScale = d3.scaleLinear()
                  .domain([d.SW, d.SE])
                  .range([0, 10]);
  
  let w = "0," + wScale(currentContour);
  let e = "10," + eScale(currentContour);
  let n = nScale(currentContour) + ",10";
  let s = sScale(currentContour) + ",0";
  
  switch (polarity(d, currentContour).case) {
    // TODO: WRITE THIS PART.
    case 0:
      return;
    case 1:
      return "M" + w + "L" + n;
    case 2:
      return "M" + n + "L" + e;
    case 3:
      return "M" + w + "L" + e;
    case 4:
      return "M" + w + "L" + s;
    case 5:
      return "M" + n + "L" + s;
    case 6:
      return "M" + e + "L" + n + "M" + s + "L" + w;
    case 7:
      return "M" + s + "L" + e;
    case 8:
      return "M" + s + "L" + e;
    case 9:
      return "M" + n + "L" + e + "M" + w + "L" + s;
    case 10:
      return "M" + n + "L" + s;
    case 11:
      return "M" + w + "L" + s;
    case 12:
      return "M" + w + "L" + e;
    case 13:
      return "M" + n + "L" + e;
    case 14:
      return "M" + w + "L" + n;
  }
}

function generateFilledContour(d) {
  // HINT: you should set up scales which, given a contour value, can be
  // used to interpolate the function along each side in the boundary of
  // the square
  let wScale = d3.scaleLinear()
                  .domain([d.SW, d.NW])
                  .range([0, 10]);
  let eScale = d3.scaleLinear()
                  .domain([d.SE, d.NE])
                  .range([0, 10]);
  let nScale = d3.scaleLinear()
                  .domain([d.NW, d.NE])
                  .range([0, 10]);
  let sScale = d3.scaleLinear()
                  .domain([d.SW, d.SE])
                  .range([0, 10]);
  
  let w = "0," + wScale(currentContour);
  let e = "10," + eScale(currentContour);
  let n = nScale(currentContour) + ",10";
  let s = sScale(currentContour) + ",0";

  let sw = "0,0";
  let nw = "0,10";
  let se = "10,0";
  let ne = "10,10";

  switch (polarity(d, currentContour).case) {
    // TODO: WRITE THIS PART.
    case 0:
      return "M0,0" + "L" + se + "L" + ne + "L" + nw + "Z";
    case 1:
      return "M" + w + "L" + n + "L" + ne + "L" + se + "L" + sw + "Z";
    case 2:
      return "M" + n + "L" + e + "L" + se + "L" + sw + "L" + nw + "Z";
    case 3:
      return "M" + w + "L" + e + "L" + se + "L" + sw + "Z";
    case 4:
      return "M" + w + "L" + s + "L" + se + "L" + ne + "L" + nw + "Z";
    case 5:
      return "M" + n + "L" + s + "L" + se + "L" + ne + "Z";
    case 6:
      return "M" + e + "L" + n + "L" + nw + "L" + w + "L" + s + "L" + se + "Z";
    case 7:
      return "M" + s + "L" + e + "L" + se + "Z";
    case 8:
      return "M" + s + "L" + e + "L" + ne + "L" + nw + "L" + sw + "Z";
    case 9:
      return "M" + e + "L" + n + "L" + ne + "Z" + "M" + w + "L" + s + "L" + sw + "Z";
    case 10:
      return "M" + n + "L" + s + "L" + sw + "L" + nw + "Z";
    case 11:
      return "M" + w + "L" + s + "L" + sw + "Z";
    case 12:
      return "M" + w + "L" + e + "L" + ne + "L" + nw + "Z";
    case 13:
      return "M" + n + "L" + e + "L" + ne + "Z";
    case 14:
      return "M" + w + "L" + n + "L" + nw + "Z";
    case 15:
      return "M0,0" + "L" + se + "L" + ne + "L" + nw + "Z";
  }
}



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects


// d3 function to compute isocontours for all cells that span given a
// range of values, [minValue,maxValues], this function produces a set
// of size "steps" isocontours to be added to the selection "sel"
function createOutlinePlot(minValue, maxValue, steps, sel)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=1; i<=steps; ++i) {
    currentContour = contourScale(i);
    sel.filter(includesOutlineContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateOutlineContour)
      .attr("fill", "none")
      .attr("stroke", "black");
  }
}

// d3 function to compute filled isocontours for all cells that span
// given a range of values, [minValue,maxValues], this function produces
// a set of size "steps" isocontours to be added to the selection "sel".
// colorScale is used to assign their fill color.
function createFilledPlot(minValue, maxValue, steps, sel, colorScale)
{
  let contourScale = d3.scaleLinear().domain([1, steps]).range([minValue, maxValue]);
  for (let i=steps; i>=1; --i) {
    currentContour = contourScale(i);
    sel.filter(includesFilledContour).append("path")
      .attr("transform", "translate(0, 10) scale(1, -1)") // ensures that positive y points up
      .attr("d", generateFilledContour)
      .attr("fill", function(d) { return colorScale(currentContour); });
  }
}

// Compute the isocontour plots
let plot1T = d3.select("#plot1-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot1P = d3.select("#plot1-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createOutlinePlot(-70, -60, 10, plot1T);
createOutlinePlot(-500, 200, 10, plot1P);

// Compute the filled isocontour plots
let plot2T = d3.select("#plot2-temperature")
    .callReturn(createSvg)
    .callReturn(createGroups(temperatureCells));
let plot2P = d3.select("#plot2-pressure")
    .callReturn(createSvg)
    .callReturn(createGroups(pressureCells));

createFilledPlot(-70, -60, 10, plot2T, 
              d3.scaleLinear()
                .domain([-70, -60])
                .range(["blue", "red"]));
createFilledPlot(-500, 200, 10, plot2P, 
              d3.scaleLinear()
                .domain([-500, 0, 500])
                .range(["#ca0020", "#f7f7f7", "#0571b0"]));
