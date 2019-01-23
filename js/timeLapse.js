/*
 *  TimeLapse - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

TimeLapse = function(_parentElement, _data, _center, _startDate, _geoData) {

	this.parentElement = _parentElement;
	this.data = _data;
	this.displayData = this.data;
	this.center = _center;
	this.startDate = new Date(_startDate);
	this.currentDate = this.startDate;
	this.geoData = _geoData;
	this.plotData = [];
	this.initVis();
}

/*
 *  Initialize map
 */

TimeLapse.prototype.initVis = function() {
	var vis = this;

	vis.margin = { top: 20, right: 0, bottom: 200, left: 140 };

	vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
	vis.height = 500 - vis.margin.top - vis.margin.bottom;

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

	// appen svg for counter

	vis.counterSVG = d3.select("#counter-svg").append("svg").attr("width",200).attr("height",100);

	// initialize map
	vis.projection = d3.geo.mercator()
	    .scale(50000)
	    .center([-73.9654,40.7829])
	    .translate([vis.width / 2 - 100, vis.height / 2]);

	vis.path = d3.geo.path()
	    .projection(vis.projection);

    // Render the U.S. by using the path generator
  vis.svg.selectAll("path")
            .data(vis.geoData.features)
        .enter().append("path")
        .attr("fill","#d1f3fa")
            .attr("d", vis.path);

	vis.xScale = d3.scale.linear()
		.domain([0,900])
		.range([0,150]);

	vis.xAxis = d3.svg.axis()
    .scale(vis.xScale)
		.ticks(3)
    .orient("bottom");

	vis.counterSVG.append("g")
        .attr("class", "axis")
        .call(vis.xAxis)
        .attr("transform", "translate(5,30)");



	vis.eventHandler();
}

// function to specify certain day
TimeLapse.prototype.eventHandler = function () {
		var vis = this;

		vis.currentDate = new Date(vis.currentDate.getTime() + 2*60000);

		if (vis.currentDate.getDate() != 9) {
			vis.currentDate.setDate(9);
		}

		vis.dateHolder;

		vis.displayData = vis.data.filter(function (d) {
			vis.dateHolder = new Date(d.starttime);

			return (Math.abs(vis.dateHolder.getTime() - vis.currentDate.getTime()) < 600000);
		})

    vis.updateVis();
};

/*
 *  The drawing function
 */

TimeLapse.prototype.updateVis = function() {
	var vis = this;

	function getTimeString(date) {
			var minutes = vis.currentDate.getMinutes();
			var buffer;
			if (minutes< 10) {
				buffer = "0";
			}else {
				buffer = "";
			}
			var ampm;
			if (vis.currentDate.getHours() < 12) {
				ampm = "am";
			} else {
				ampm = "pm";
			}
			var hours = vis.currentDate.getHours() % 12;
			if (hours == 0) {
				hours = 12;
			}
			return (hours+":"+minutes+buffer+" "+ampm);
	}
	$("#clock").html(("<span>July "+vis.currentDate.getDate())+"th, 2014: </span>"+getTimeString(vis.currentDate));
	$("#total-count").html("Number of Pickups Within 2 Minutes");


	// counter for additional information

	var counter = vis.counterSVG.selectAll(".counter")
		.data(vis.displayData);

	counter.exit().remove();

	counter
		.enter()
		.append("rect")
		.attr("height",20)
		.attr("fill","#F96656")
		.attr("class", "counter")
		.transition()
		.duration(1000)
		.attr("x",5)
		.attr("y",9)
		.attr("width", vis.xScale(vis.displayData.length));

	// add uber pickup circles 
	var circles = vis.svg.selectAll(".port")
			.data(vis.displayData);

	circles.exit().remove();

	circles
			.enter()
			.append("circle")
			.attr("class", "port")
			.attr("r", 3)
			.attr("fill","#F96656")

		circles
			.attr("transform", function(d) {
              return "translate(" + vis.projection([d.Lon, d.Lat]) + ")";
          });

}
