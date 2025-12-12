// Chi Thieu
// The file complete the functions:
// (1) makeScatterplot(), which is used to generically create plots
// (2) onBrush(), which is the callback used to interact 
//

////////////////////////////////////////////////////////////////////////
// Global variables for the dataset and brushes

let data = iris;

// brush1 and brush2 will store the extents of the brushes,
// if brushes exist respectively on scatterplot 1 and 2.
//
// if either brush does not exist, brush1 and brush2 will
// hold the null value.

let brush1 = null;
let brush2 = null;


////////////////////////////////////////////////////////////////////////
// xAccessor and yAccessor allow this to be generic to different data
// fields

function makeScatterplot(sel, xAccessor, yAccessor, xTitle, yTitle)
{
  // Add margin for teh graphs
  let width = 500;
  let height = 500;
  let margin = 35;
  let gwidth = width - margin;
  let gheight = height - margin;

  //  x and y scale
  let xScale = d3.scaleLinear()
                .domain(d3.extent(data, xAccessor))
                .range([margin, gwidth]);
  
  let yScale = d3.scaleLinear()
                .domain(d3.extent(data, yAccessor))
                .range([gheight, margin]);
  
  let colorScale = d3.scaleOrdinal()
                .domain(["setosa","versicolor","virginica"])
                .range(["orange","blue","green"])
  
  let svg = sel
    .append("svg")
    .attr("width", width).attr("height", height);

  // Brushes set up 
  let brush = d3.brush();

  svg.append("g")
    .attr("class", "brush")
    .call(brush);
   
  // Create plots
  svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(xAccessor(d)))
    .attr("cy", d => yScale(yAccessor(d)))
    .attr("r", 3)
    .attr("fill", d => colorScale(d.species))
    .on("click", clickfunc);


  // finish writing the circle creation here.
  // this *must* be done *after* adding the brush group.
  // I just realize if the graphs creation before the brush then brush doesn't work any more
  
  let xAxis = d3.axisBottom(xScale); // create an axis object for the x axis
  let yAxis = d3.axisLeft(yScale); // create an axis object for the y axis

  // add axes / axes labels
  // I add title arguments for the function because i can't find way to put name on the axies
  svg.append("g")
    .attr("transform", `translate(0, ${gheight})`)
    .call(xAxis)
    .append("text")
    .attr("x", width/2)
    .attr("y", margin - 5)
    .attr("fill","black")
    .attr("text-anchor","middle")
    .text(xTitle);
  
  svg.append("g")
    .attr("transform", `translate(${margin}, 0)`)
    .call(yAxis)
    .append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2)
    .attr("y", -margin + 10 )
    .attr("fill","black")
    .attr("text-anchor","middle")
    .text(yTitle);

  return {svg: svg,
    brush: brush,
    xScale: xScale,
    yScale: yScale
  };
}

// Function to show detailed data selected
function clickfunc(event,d) {
  // Change the size 
  d3.selectAll("circle")
    .attr("r",3)
    .filter((data) => {return data == d})
    .attr("r", 6)
  
    // Show all data 
  d3.select("#table-sepalLength").text(d.sepalLength);
  d3.select("#table-sepalWidth").text(d.sepalWidth);
  d3.select("#table-petalLength").text(d.petalLength);
  d3.select("#table-petalWidth").text(d.petalWidth);
  d3.select("#table-species").text(d.species);
}
////////////////////////////////////////////////////////////////////////
// Setup plots

plot1 = makeScatterplot(d3.select("#scatterplot_1"),
                        function(d) { return d.sepalLength; },
                        function(d) { return d.sepalWidth; },
                        "Sepal Length",
                        "Sepal Width");

plot2 = makeScatterplot(d3.select("#scatterplot_2"),
                        function(d) { return d.petalLength; },
                        function(d) { return d.petalWidth; },
                        "Petal Length",
                        "Petal Width");

////////////////////////////////////////////////////////////////////////
// Callback during brushing

// Highlight all selecting data
function onBrush() {
  const allCircles = d3.select("body").selectAll("circle");
  // Reset to initialize sixe and remove the stroke
  allCircles.attr("stroke", "none")
            .attr("r", 3);

  // If both brushes are cleared, reset everything
  if (brush1 === null && brush2 === null) {
    allCircles.attr("stroke", "none")
              .attr("r", 3);
    return;
  }

  // Selection filter function
  function isSelected(d) {
    let inBrush1 = true;
    let inBrush2 = true;

    // Check brush 1 (Sepal)
    // Check if brush exist
    // Turns into pixel coordinate
    // Checks if the circles is inside the brush
    if (brush1 !== null) {
      let [[x0, y0], [x1, y1]] = brush1;
      let xVal = plot1.xScale(d.sepalLength);
      let yVal = plot1.yScale(d.sepalWidth);
      inBrush1 = (xVal >= x0 && xVal <= x1 && yVal >= y0 && yVal <= y1);
    }

    // Check brush 2 (Petal)
    if (brush2 !== null) {
      let [[x0, y0], [x1, y1]] = brush2;
      let xVal = plot2.xScale(d.petalLength);
      let yVal = plot2.yScale(d.petalWidth);
      inBrush2 = (xVal >= x0 && xVal <= x1 && yVal >= y0 && yVal <= y1);
    }

    return inBrush1 && inBrush2;
  }
  
  let selected = allCircles
    .filter(isSelected);
  let notSelected = allCircles
    .filter(function(d) { return !isSelected(d); });

  // selected and notSelected are d3 selections, write code to set their
  // attributes as per the assignment specification.

  // Highlight if selected
  selected
    .attr("stroke", "darkgrey")
    .attr("stroke-width", 2)
    .attr("r", 6);

  // Reset if not selected
  notSelected
    .attr("stroke", "none")
    .attr("r", 3);
}

////////////////////////////////////////////////////////////////////////
//
// d3 brush selection
//
// The "selection" of a brush is the range of values in either of the
// dimensions that an existing brush corresponds to. The brush selection
// is available in the event.selection object.
// 
//   e = event.selection
//   e[0][0] is the minimum value in the x axis of the brush
//   e[1][0] is the maximum value in the x axis of the brush
//   e[0][1] is the minimum value in the y axis of the brush
//   e[1][1] is the maximum value in the y axis of the brush
//
// The most important thing to know about the brush selection is that
// it stores values in *PIXEL UNITS*. Your logic for highlighting
// points, however, is not based on pixel units: it's based on data
// units.
//
// In order to convert between the two of them, remember that you have
// the d3 scales you created with the makeScatterplot function above.
//
// It is not necessary to use, but you might also find it helpful to
// know that d3 scales have a function to *invert* a mapping: if you
// create a scale like this:
//
//  s = d3.scaleLinear().domain([5, 10]).range([0, 100])
//
// then s(7.5) === 50, and s.invert(50) === 7.5. In other words, the
// scale object has a method invert(), which converts a value in the
// range to a value in the domain. This is exactly what you will need
// to use in order to convert pixel units back to data units.
//
//
// NOTE: You should not have to change any of the following:

function updateBrush1(event) {
  brush1 = event.selection;
  onBrush();
}

function updateBrush2(event) {
  brush2 = event.selection;
  onBrush();
}

plot1.brush
  .on("brush", updateBrush1)
  .on("end", updateBrush1);

plot2.brush
  .on("brush", updateBrush2)
  .on("end", updateBrush2);