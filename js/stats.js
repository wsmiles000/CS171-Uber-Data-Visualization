// Heatmap inspiration borrowed from https://www.trulia.com/vis/tru247/

// Create margin variable
var margin = { top: 50, right: 0, bottom: 10, left: 30 };

// Set global variables for height and width
var width = 780- margin.left - margin.right;
var height = 430 - margin.top - margin.bottom;


// Append svg canvas
var svg = d3.select("#tile-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set global variable for determining grid size based on svg width
var gridSize = Math.floor(width / 24);

// Global variable for each legend component width
var legendElement = gridSize * 2;
var buckets = 9;

// Color array based off of Colorbrewer
var colors = ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"];

// Array containing strings for time
var times = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p",
"7p", "8p", "9p", "10p", "11p"];

// Array containing strings for days
var days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Global data variable
var data;

// Call function
loadData();

// Function that wrangles data and formats it correctly
function loadData() {
  d3.csv("data/average.csv", function(error, csv){
    csv.forEach(function(d){
      d.Uber = d.Uber.replace(/\,/g,"");
      d.Uber = +d.Uber;
      d["other 8 bases"] = d["other 8 bases"].replace(/\,/g,"");
      d["other 8 bases"] = +d["other 8 bases"];
      d.Lyft = +d.Lyft;
      d.Weekday = +d.Weekday;
      d.Hour = +d.Hour;
    });
    data = csv;

    // Call visualization function with select value
    visualize("Uber");
  });
}

// Primary function to visualize heatmap
function visualize(selectValue) {
  // Create labels for each day
  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
      .text(function (d) {
        return d;
      })
      .attr("x", 0)
      .attr("y", function(d,i){
        return i * gridSize;
      })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")");

  // Create labels for each hour
  var timeLabels = svg.selectAll(".timeLabel")
      .data(times)
      .enter().append("text")
        .text(function(d) {
          return d;
        })
        .attr("x", function(d,i){
          return i * gridSize;
        })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)");

  // Create a color scaled based on quantiles
  var colorScale = d3.scale.quantile()
      .domain([0, buckets - 1, d3.max(data, function (d){
        return d[selectValue];
        })
      ])
      .range(colors);

  // Initialize the card element
  var cards = svg.selectAll(".hour")
      .data(data, function(d) {
        return d.Weekday+':'+d.Hour;
      });

  cards.append("title");

  // use the enter, exit, update pattern for the cards
  cards.enter().append("rect")
      .attr("x", function(d) {
        return (d.Hour) * gridSize;
      })
      .attr("y", function(d) {
        return (d.Weekday - 1) * gridSize;
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "hour bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0]);

  cards.transition().duration(500)
      .style("fill", function(d) {
        return colorScale(d[selectValue]);
      });

  cards.select("title").text(function(d) {
    return "Rides: "+d[selectValue];
  });

  cards.exit().remove();

  // Initialize the legend
  var legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), function(d) {
      return d;
    });

  // Enter, exit, update pattern for legend
  legend.exit().remove();

  legend.enter().append("g")
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("x", function(d, i) {
      return legendElement * i;
    })
    .attr("y", height - 90)
    .attr("width", legendElement)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) {
      return colors[i];
    });


  legend.append("text")
      .attr("class", "mono")
      .text(function(d) {
        return "≥ "+ Math.round(d);
      })
      .attr("x", function(d, i) {
        return legendElement * i;
      })
      .attr("y", height - 100);

}

// Function called when select box changed
function changeTile() {
  var selectBox = document.getElementById('tile-selector');
  var selectValue = selectBox.options[selectBox.selectedIndex].value;

  return visualize(selectValue);
}
