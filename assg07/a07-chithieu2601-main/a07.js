// Chi Thieu
// This files practice with more advanced uses of brushes and callback handlers in d3. Specific objectives include:
//
//Implementing a parallel coordinates view suitable for viewing multi-dimensional datasets
//Experimenting with using SVG path types for drawing polylines.
//Practicing interactions with a parallel coordinates plot, particularly through implementing click events for selection and d3.brush’s for brushing and linking.
//Designing callback handlers that support the above interactions of selection and filtering
//Understanding the types of tasks that parallel coordinates are suitable for.





////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

let data = penguins
//this would instead work with a smaller random subset:
//let data = d3.shuffle(penguins).slice(0,50)

// dims will store the four axes in left-to-right display order
let dims = [
  "bill_length",
  "bill_depth",
  "flipper_length",
  "body_mass"
];

// mapping from dimension id to dimension name used for text labels
let dimNames = {
  "bill_length": "Bill Length",
  "bill_depth": "Bill Depth",
  "flipper_length": "Flipper Length",
  "body_mass": "Body Mass",
};




////////////////////////////////////////////////////////////////////////
// Global variables for the svg

let width = dims.length*125;
let height = 500;
let padding = 50;

let svg = d3.select("#pcplot")
  .append("svg")
  .attr("width", width).attr("height", height);




////////////////////////////////////////////////////////////////////////
// Initialize the x and y scales, axes, and brushes.  
//  - xScale stores a mapping from dimension id to x position
//  - yScales[] stores each y scale, one per dimension id
//  - axes[] stores each axis, one per id
//  - brushes[] stores each brush, one per id
//  - brushRanges[] stores each brush's event.selection, one per id

let xScale = d3.scalePoint()
  .domain(dims)
  .range([padding, width-padding]);

let yScales = {};
let axes = {};
let brushes = {};
let brushRanges = {};

// For each dimension, we will initialize a yScale, axis, brush, and
// brushRange
dims.forEach(function(dim) {
  //create a scale for each dimension
  yScales[dim] = d3.scaleLinear()
    .domain( d3.extent(data, function(datum) { return datum[dim]; }) )
    .range( [height-padding, padding] );

  //set up a vertical axis for each dimensions
  axes[dim] = d3.axisLeft()
    .scale(yScales[dim])
    .ticks(10);
  
  //set up brushes as a 20 pixel width band
  //we will use transforms to place them in the right location
  brushes[dim] = d3.brushY()
    .extent([[-10, padding], [+10, height-padding]]);
  
  //brushes will be hooked up to their respective updateBrush functions
  brushes[dim]
    .on("brush", updateBrush(dim))
    .on("end", updateBrush(dim))

  //initial brush ranges to null
  brushRanges[dim] = null;
});




////////////////////////////////////////////////////////////////////////
// Make the parallel coordinates plots 

// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
function path(d){
  return d3.line()(dims.map(function(dim) { return [xScale(dim), yScales[dim](d[dim])]}));
}

let strokeScale = d3.scaleOrdinal()
                    .domain(["Adelie", "Chinstrap", "Gentoo"])
                    .range(["orange","blue","green"]);

// add the actual polylines for data elements, each with class "datapath"
svg.append("g") 
  .selectAll(".datapath")
  .data(data)
  .enter()
  .append("path")
  .attr("class", "datapath")
  .attr("d", path) // Draw the lines
  .attr("stroke", d => strokeScale(d.species))
  .attr("stroke-width", 1)
  .attr("fill", "none")
  .attr("opacity", 0.75);

// add the axis groups, each with class "axis"
svg.selectAll(".axis")
   .data(dims)
   .enter()
   .append("g")
   .attr("class", "axis")
   .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; })
   .each(function(d) {
      d3.select(this).call(axes[d]); });


// add the axes labels, each with class "label"
svg.selectAll(".label")
   .data(dims)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => xScale(d))
    .attr("y", padding / 2)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text(d => dimNames[d])
    .on("click", onClick);

// add the brush groups, each with class ".brush" 
svg.selectAll(".brush")
   .data(dims)
   .enter()
   .append("g")
   .attr("class", "brush")
   .attr("transform", d => "translate(" + xScale(d) + ",0)")
   .each(function(d) { d3.select(this).call(brushes[d]); });




////////////////////////////////////////////////////////////////////////
// Interaction Callbacks

// Callback for swapping axes when a text label is clicked.
function onClick(event,d) {
  //TODO: write this  

  // Finds the index of the dimension
  let index = dims.indexOf(d);
  
  let swapIndex;
  if (index === dims.length - 1) {
  // If it's the last axis, swap with the one before it
    swapIndex = index - 1;
  } else {
  // Otherwise, swap with the next one
    swapIndex = index + 1;
  }

  // Swaps the 2 positions in the dims array
  let temp = dims[index];
  dims[index] = dims[swapIndex];
  dims[swapIndex] = temp;

  // Updates the x-axis scale
  xScale.domain(dims);

  // Smooth transition of axes and labels
  svg.selectAll(".axis")
    .transition().duration(1000)
    .attr("transform", d => "translate(" + xScale(d) + ",0)");

  svg.selectAll(".label")
    .transition().duration(1000)
    .attr("x", d => xScale(d));

  svg.selectAll(".brush")
    .transition().duration(1000)
    .attr("transform", d => "translate(" + xScale(d) + ",0)");

  // Redraw data paths smoothly
  svg.selectAll(".datapath")
    .transition().duration(1000)
    .attr("d", path);


}

// Returns a callback function that calls onBrush() for the brush
// associated with each dimension
function updateBrush(dim) {
  return function(event) {
    brushRanges[dim] = event.selection;
    onBrush();
  };
}

// Callback when brushing to select elements in the PC plot
function onBrush() {
  let allLines = d3.selectAll(".datapath");

  function isSelected(d) {
    //TODO: write this
    for (let dim of dims) {
      let range = brushRanges[dim];
      if (range === null) continue; // Ignores if there is no brush

      // Convert pixel range to data range
      let [y0, y1] = range;
      let yVal = yScales[dim](d[dim]);
      if (yVal < y0 || yVal > y1) {
        return false; // outside brush
      }
    }
    return true; // inside all brushes
  }

  let selected = allLines
    .filter(isSelected);
  let notSelected = allLines
    .filter(function(d) { return !isSelected(d); });

  // Update the style of the selected and not selected data
  selected
    .attr("stroke-width", 2)
    .attr("opacity", 1);

  notSelected
    .attr("stroke-width", 1)
    .attr("opacity", 0.1);
}

