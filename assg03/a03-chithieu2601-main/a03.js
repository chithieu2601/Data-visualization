// Author: Chi Thieu
// Function from iteraction_8.js
function rectWidth(svgWidth) { 
    return function() { 
        return Math.ceil(svgWidth / ukDriverFatalities.length);
    };
}

function rectHeight(svgHeight) {
    return function(row, index) { 
        return row.count / 2500 * svgHeight; 
    };
}

function rectX(svgWidth) { 
    return function(row, index) {
        return index * svgWidth / ukDriverFatalities.length; 
    };
}

function rectY(svgHeight) {
    return function(row, index) {
        return svgHeight - (row.count / 2500 * svgHeight);
    };
}

function clamp(v) {
    return Math.floor(Math.max(0, Math.min(255, v)));
}

function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function color(count) {
    // count = 2500 -> rgb(0, 127, 127) (dark cyan)
    // count = 0 -> rgb(255, 255, 255) (cyan)

    var amount = (2500 - count) / 2500 * 255;
    var s = clamp(amount), s2 = clamp(amount / 2 + 127), s3 = clamp(amount / 2 + 127);
  
    return rgb(s, s2, s3);
}

//Charts (1 to 3) with similar contribute from iteration_8.js
//Chart1 from iteration_8.js: heat map
const svg1 = d3.select("#div1")
  .append("svg")
  .attr("id", "chart1")
  .attr("width", 600)
  .attr("height", 300);

svg1.selectAll("rect")
  .data(ukDriverFatalities).enter()
  .append("rect")
  .attr("x", function(row) { return Math.ceil(600 / (1984 - 1969 + 1)) * (row.year - 1969); })
  .attr("y", function(row) { return Math.ceil(300 / 12) * (11 - row.month); })
  .attr("width", Math.ceil(600 / (1984 - 1969 + 1)))
  .attr("height", Math.ceil(300 / 12))
  .attr("fill", function(row) {
        return color(row.count);});

//Chart2 from iteration_8.js: circle grid
const svg2 = d3.select("#div2")
  .append("svg")
  .attr("id", "chart1")
  .attr("width", 600)
  .attr("height", 300);

svg2.selectAll("circle")
    .data(ukDriverFatalities).enter()
    .append("circle")
    .attr("cx", function(row) { return Math.ceil(600 / (1984 - 1969 + 1)) * (row.year - 1969 + 0.5); })
    .attr("cy", function(row) { return Math.ceil(300 / 12) * (11 - row.month + 0.5); })
    .attr("r", function(row) {
        return row.count / 500 * 3;})
    .attr("stroke", function() { return "white"; })
    .attr("fill", function() { return "blue"; })

//Chart3 from iteration_8.js: bar chart
const svg3 = d3.select("#div3")
  .append("svg")
  .attr("id", "chart1")
  .attr("width", 600)
  .attr("height", 300);

svg3.selectAll("rect")
  .data(ukDriverFatalities).enter()
  .append("rect")
  .attr("x", rectX(600))
  .attr("y", rectY(300))
  .attr("width", rectWidth(600))
  .attr("height", rectHeight(300))
  .attr("fill", "gray");

//Scatterplot 2 from assignment 02
const height = 500;
const width = 500;

const svg4 = d3.select("#div4")
  .append("svg")
  .attr("id","scatterplot2")
  .attr("width", width)
  .attr("height", height);

const GPAval = d3.scaleLinear()
  .domain([0,4])
  .range([20,480]);

const ACTval = d3.scaleLinear()
  .domain([1,36])
  .range([480,20]);  

const SATVval = d3.scaleLinear()
  .domain([200,800])
  .range([1,10]);

const fillval = d3.scaleLinear()
  .domain(d3.extent(scores, val => val.SATM))
  .range(["lightgreen", "darkgreen"]);

svg4.append("g")
  .attr("transform", `translate(0,480)`)
  .call(d3.axisBottom(GPAval));

svg4.append("g")
  .attr("transform", `translate(20,0)`)
  .call(d3.axisLeft(ACTval));

svg4.append("g")
  .selectAll("circle")
  .data(scores).enter()
  .append("circle")
  .attr("cx", val => GPAval(val.GPA)) 
  .attr("cy", val => ACTval(val.ACT))
  .attr("r", val => SATVval(val.SATV))
  .attr("fill", val => fillval(val.SATM));

svg4.append("text")
  .attr("x", width/2)
  .attr("y", height-25)
  .attr("text-anchor", "middle")
  .text("GPA");

svg4.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height/2)
  .attr("y", 10)
  .attr("text-anchor", "middle")
  .text("ACT");