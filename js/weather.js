WeatherArea = function(_parentElement, _data) {

	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = this.data;

	this.initVis();
}

/*
 *  Initialize station map
 */

WeatherArea.prototype.initVis = function() {
	var vis = this;

	// Establishing margin variables
  vis.margin_precip = {bottom: 100, top:10, right: 20, left:60};

  vis.precip_width = 480- vis.margin_precip.left - vis.margin_precip.right;

  vis.precip_height = 550 - vis.margin_precip.top - vis.margin_precip.bottom;

  vis.svg = d3.select("#"+vis.parentElement)
      .append("svg")
      .attr("width", vis.precip_width + vis.margin_precip.right + vis.margin_precip.left)
      .attr("height", vis.precip_height + vis.margin_precip.top + vis.margin_precip.bottom)
      .append("g")
      .attr("transform", "translate(" + vis.margin_precip.left + "," + vis.margin_precip.top + ")");

  vis.precip_max = d3.max(vis.data,function(d){
      return d.PrecipitationIn;
  });

	// Setting up scales for X and Y axes
  vis.x = d3.time.scale()
    .domain(d3.extent(vis.data, function(d) {return d.date;}))
    .range([0,vis.precip_width]);

  vis.y = d3.scale.linear()
    .domain([0,vis.precip_max])
    .range([vis.precip_height, 0]);

	// Format Time Ticks by Hour
  vis.x_axis = d3.svg.axis()
      .scale(vis.x)
      .tickFormat(d3.time.format("%I:%M %p"))
      .orient("bottom");

  vis.y_axis = d3.svg.axis()
      .scale(vis.y)
      .orient("left");

	// Appending the Axes
  vis.svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", "translate(0,"+ vis.precip_height +")")
      .style("fill", "none")
      .call(vis.x_axis)
      .selectAll("text")
      .attr("transform", function(d) {
          return " translate (0, 0)";
      })
      .style("text-anchor", "middle")
      .style("fill", "black");

  vis.svg.append("g")
      .attr("class", "axis y-axis")
      .style("stroke", "black")
      .style("fill", "none")
      .call(vis.y_axis)
      .selectAll("text")
      .style("fill", "black");

	// Axes Title for Precip. Levels
	vis.svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "translate("+ (-40) +","+(vis.precip_height/2)+")rotate(-90)")
		.text("Precipitation Levels (In.) for 4/30/14");

	// Setting up drawing area for Chart
  vis.chart_area = d3.svg.area()
			.interpolate("cardinal")
      .x(function(d){
          return vis.x(d.date);
      })
      .y0(vis.precip_height)
      .y1(function(d){
          return vis.y(d.PrecipitationIn);
      });
  console.log(vis.data);

	// Drawing the path
  vis.path = vis.svg.append("path")
      .datum(vis.data)
      .attr("class", "area")
      .style("fill", "#97D4ED")
      .style("opacity", .6)
      .attr("d", vis.chart_area);

	vis.eventHandler();
}

WeatherArea.prototype.eventHandler = function () {
		var vis = this;

    vis.updateVis();
};

/*
 *  The drawing function
 */

WeatherArea.prototype.updateVis = function() {
	var vis = this;

	// Initiating Scale for the Brusher
  var brush_scale = d3.time.scale()
        .domain(d3.extent(vis.data, function(d) {return d.date;}))
        .range([0,vis.precip_width]);

	// Helper function that returns domain for X
  function brush_helper() {
      vis.x.domain(brusher.empty() ? brush_scale.domain() : brusher.extent());
      brushed(brusher.extent());
    }

	// Initialize Brusher
   var brusher = d3.svg.brush()
      .x(brush_scale)

        .on("brush", brush_helper);

    var brush_range = vis.svg.append("g")
        .attr("class", "brush-range");

	// Calls the brusher
    brush_range.append("path")
        .datum(vis.data)
        .attr("d", vis.chart_area)
        .style("fill", "blue")
        .style("opacity", .1)
        brush_range.append("g")
        .attr("class", "brush")
        .call(brusher)
        .selectAll("rect")
            .attr("y", 40)
            .style("fill", "gray")
            .style("opacity", .5)
            .attr("height", vis.precip_height - 39);

}
