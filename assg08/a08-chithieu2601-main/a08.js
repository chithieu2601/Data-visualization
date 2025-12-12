// 
// a08.js
// Template for CSC444 Assignment 08, Fall 2025
// Joshua A. Levine <josh@arizona.edu>
//
// This file provides the template code for A08, providing a skeleton
// for how to initialize and draw tree maps  
//

//Chi Thieu
// Implementation for treemap without using d3.layout.treemap
// The basic treemapping heuristic draws a tree by progressively 
// splitting a rectangle along vertical and horizontal lines such 
// that the areas of the rectangles correspond to the weights of the subtrees.

////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

// HINT: Start with one of the smaller test datesets included in
// test-cases.js instead of the larger tree in flare.js
//let data = test_1;
//let data = test_2;
let data = flare;



////////////////////////////////////////////////////////////////////////
// Tree related helper functions

function setTreeSize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeSize(tree.children[i]);
    }
    tree.size = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.size;
};

function setTreeCount(tree)
{
  if (tree.children !== undefined) {
    let count = 0;
    for (let i=0; i<tree.children.length; ++i) {
      count += setTreeCount(tree.children[i]);
    }
    tree.count = count;
  }
  if (tree.children === undefined) {
    tree.count = 1;
  }
  return tree.count;
}

//Set tree depth with similar algorithm as setTreeCount and setTreeSize
function setTreeDepth(tree, depth)
{
  // TODO: WRITE THIS PART. Use the code above as example
  tree.depth = depth;
  let maxDepth = depth;
  if (tree.children !== undefined) {
    let depth_temp = 0;
    for (let i=0; i<tree.children.length; ++i) {
      depth_temp = setTreeDepth(tree.children[i], depth + 1);
    }
    if (depth_temp > maxDepth){
      maxDepth = depth_temp;
    }
  }
  if (tree.children == undefined) {
    tree.depth = depth;
    maxDepth = depth;
  }
  return maxDepth;
};


// Initialize the size, count, and depth variables within the tree
setTreeSize(data);
setTreeCount(data);
let maxDepth = setTreeDepth(data, 0);

let color = d3.scaleLinear()
               .domain([maxDepth+2, 0]) // maxDepth+2 because if I leave it as maxDepth then the treemap is way to white and it seems like when i increment to macDepth 
               .range(["white","purple"]) // If I reverse the domain then the graph is way to dark and I can't recognize the color in the solution photo so I choose white and purple
               .interpolate(d3.interpolateHcl);


////////////////////////////////////////////////////////////////////////
// Main Code for the Treemapping Technique

// Assigns rectangle to tree node and recursively divides rectangle among the node's children
function setRectangles(rect, tree, attrFun, button = "best")
{
  tree.rect = rect;

  if (tree.children !== undefined) {
    let cumulativeSizes = [0];
    for (let i=0; i<tree.children.length; ++i) {
      cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
    }
    
    let rectWidth = rect.x2 - rect.x1;
    let rectHeight = rect.y2 - rect.y1; 
    let border = 5;
    
    let scale = d3.scaleLinear()
                  .domain([0, cumulativeSizes[cumulativeSizes.length-1]]);

    // TODO: WRITE THIS PART.
    // Hint: set the range of the "scale" variable above appropriately,
    // depending on the shape of the current rectangle and the splitting
    // direction.  This will help you define newRect for each child.

    // If tree depth is even then split vertically
    let vertical_split = (tree.depth %2 === 0);

    // if choosing best-size or best-count button then split vertically when the width is larger than height
    if (button == "best") {
      vertical_split = (rectWidth > rectHeight);
    }
    
    if (vertical_split){
      scale.range([rect.x1, rect.x1 + rectWidth]); // x values change
    } else {
      scale.range([rect.y1, rect.y1 + rectHeight]); // y values change
    }

    for (let i=0; i<tree.children.length; ++i) {
      let newRect;

      if (vertical_split) {
        // Slice along x-axis
        newRect = {
          x1: scale(cumulativeSizes[i]) + border,
          x2: scale(cumulativeSizes[i + 1]) - border,
          y1: rect.y1 + border, //y remains full height
          y2: rect.y2 - border
        };
      } else {
        // Slice along y-axis
        newRect = {
           x1: rect.x1 + border, //x remains full height
           x2: rect.x2 - border,
           y1: scale(cumulativeSizes[i]) + border,
           y2: scale(cumulativeSizes[i + 1]) - border
        };
      }

      setRectangles(newRect, tree.children[i], attrFun);
    }
  }
}

// initialize the tree map
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;

// compute the rectangles for each tree node
setRectangles(
  {x1: 0, y1: 0, x2: winWidth, y2: winHeight}, data,
  function(t) { return t.size; }
);

// make a list of all tree nodes;
function makeTreeNodeList(tree, lst)
{
  lst.push(tree);
  if (tree.children !== undefined) {
    for (let i=0; i<tree.children.length; ++i) {
      makeTreeNodeList(tree.children[i], lst);
    }
  }
}

let treeNodeList = [];
makeTreeNodeList(data, treeNodeList);



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion

// d3 selection to draw the tree map 
let gs = d3.select("#svg")
           .attr("width", winWidth)
           .attr("height", winHeight)
           .selectAll("g")
           .data(treeNodeList)
           .enter()
           .append("g");

function setAttrs(sel) {
  // TODO: WRITE THIS PART.
  sel.attr("x",  d => d.rect.x1)
     .attr("y", d => d.rect.y1)
     .attr("width", d => Math.max(0, d.rect.x2 - d.rect.x1))
     .attr("height", d => Math.max(0, d.rect.y2 - d.rect.y1))
     .attr("fill", d => color(d.depth))
     .attr("stroke", "black")
}

gs.append("rect").call(setAttrs);



////////////////////////////////////////////////////////////////////////
// Callbacks for buttons

d3.select("#size").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.size;}, button = "normal"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#count").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data,
    function(t) { return t.count;}, button = "normal"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#best-size").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.size;}, button = "best"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#best-count").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data,
    function(t) { return t.count;}, button = "best"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});


