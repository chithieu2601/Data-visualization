// Author: Chi Thieu
// Code form a03 but with different value

const height = 500;
const width = 500;

// function to make value fit to the graph
// SATV is used to define the x-coordinate
// ACT is used to define the y-coordinate
// SATM is used to define the radius
// GPA is used to define the color.

let cxScale = d3.scaleLinear()
  .domain([200,800])
  .range([20,480]);

let cyScale = d3.scaleLinear()
  .domain([1,36])
  .range([480,20]);

let rScale = d3.scaleSqrt()
  .domain([200,800])
  .range([2,12]);  

// I use color code because it didn't work when I use ["blue","red"]
let colorScale1 = d3.scaleLinear()
  .domain([0,4])
  .range(["#0000FF","#FF0000"]);

let colorScale2 = d3.scaleLinear()
  .domain([0,2,4])
  .range(["#2c7bb6","#ffffbf","#d7191c"]);

let colorScale3 = d3.scaleQuantize()
  .domain([0,4])
  .range(["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"]);

svg1 = d3.select("#div1")
  .append("svg")
  .attr("id","scatterplot1")
  .attr("width", width)
  .attr("height", height);

svg1.selectAll("circle")
  .data(scores).enter()
  .append("circle")
  .attr("cx", d => cxScale(d.SATV))
  .attr("cy", d => cyScale(d.ACT))
  .attr("r", d => rScale(d.SATM))
  .attr("fill", d => colorScale1(d.GPA));

svg1.append("g")
  .attr("transform", `translate(0,480)`)
  .call(d3.axisBottom(cxScale));

svg1.append("g")
  .attr("transform", `translate(20,0)`)
  .call(d3.axisLeft(cyScale));

svg1.append("text")
  .attr("x", width/2)
  .attr("y", height-25)
  .attr("text-anchor", "middle")
  .text("SATV");

svg1.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height/2)
  .attr("y", 10)
  .attr("text-anchor", "middle")

  .text("ACT");
