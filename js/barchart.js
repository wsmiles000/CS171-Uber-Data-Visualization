BarChart = function(_parentElement, _data30, _data23) {

	this.parentElement = _parentElement;
	this.data30 = _data30;
	this.data23 = _data23;
	this.displayData30 = this.data30;
	this.displayData23 = this.data23;

	this.initVis();
}

// initialize the bar chart object
BarChart.prototype.initVis = function() {
	var vis = this;

	// create area variables
	vis.margin = {bottom: 50, top:10, right: 20, left: 50};

	vis.width = 450 - vis.margin.left - vis.margin.right;

	vis.height = 500 - vis.margin.top - vis.margin.bottom;

	// append the svg
	vis.svg = d3.select("#"+vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.right + vis.margin.left)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		// create the scales
		vis.x = d3.time.scale()
	  	.domain([0,2])
	  	.range([0, vis.width])

	  vis.y = d3.scale.linear()
	  	.domain([0, 40000])
	  	.range([vis.height, 0])


	  vis.x_axis = d3.svg.axis()
	  	.scale(vis.x)
	  	.tickFormat("")
	  	.tickSize(0)
	  	.orient("bottom");

	  vis.y_axis = d3.svg.axis()
	  	.scale(vis.y)
	  	.orient("left");

	  vis.svg.append("g")
	  	.attr("class", "axis x-axis")
	  	.attr("transform", "translate(0," + vis.height +")")
	  	.style("fill", "none")
	  	.style("stroke", "black")
	  	.call(vis.x_axis)
	  	.selectAll("text")
	  		.style("fill", "black");

	  vis.svg.append("g")
	  	.attr("class", "axis y-axis")
	  	.style("fill", "none")
	  	.style("stroke", "black")
	  	.call(vis.y_axis)
	  	.selectAll("text")
	  		.style("fill", "black");


	 vis.svg.append("text")
	 	.attr("text-anchor", "middle")
	 	.attr("fill", "black")
	 	.text("Day with No Rain (4/23/14)")
	 		.attr("x", 90)
	 		.attr("y", vis.height + 20)

	 vis.svg.append("text")
	 	.attr("text-anchor", "middle")
	 	.attr("fill", "black")
	 	.text("Day with Rain (4/30/14)")
	 		.attr("x", 280)
	 		.attr("y", vis.height +20);

	// call event handling function
	vis.eventHandler();
}

// event handler with brush component
BarChart.prototype.eventHandler = function (brushRegion) {
		var vis = this;

		vis.rideTotal30 = 0;
		vis.rideTotal23 = 0;

		vis.displayData30.forEach(function (d) {
			vis.rideTotal30 += d.trips;
		})

		vis.displayData23.forEach(function (d) {
			vis.rideTotal23 += d.trips;
		})

    vis.updateVis();
};

/*
 *  The drawing function
 */

BarChart.prototype.updateVis = function() {
	var vis = this;

	vis.bars = vis.svg.selectAll(".bar")
		.data([vis.rideTotal23,vis.rideTotal30])

	vis.bars.exit().remove();

	vis.bars.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("fill", function(d,i){
			if (i == 0) {
				return "#F96656";
			}
			else if (i == 1) {
				return "#ADCFF5";
			}
		})

	vis.bars
		.attr("x", function(d,i){
			return vis.x(i)+ 60;
		})
		.attr("width", 60)
		.attr("y", function(d,i){
			console.log(vis.y(d));
			return vis.y(d);
		})
		.attr("height", function(d) { return vis.height - vis.y(d);});

	$("#uber-count").html(("<span>Difference: "+(vis.rideTotal30 - vis.rideTotal23)))
}

// adding to the brusher 

BarChart.prototype.selectionChanged = function (brushRegion) {
		var vis = this;

		if (brushRegion[0].getHours() != brushRegion[1].getHours()) {
				vis.displayData30 = vis.data30.filter(function(d) {
					return (d.date.getHours() >= brushRegion[0].getHours() && d.date.getHours() <= brushRegion[1].getHours());
				});
				vis.displayData23 = vis.data23.filter(function(d) {
					return (d.date.getHours() >= brushRegion[0].getHours() && d.date.getHours() <= brushRegion[1].getHours());
				});
		}

    vis.eventHandler();


};
