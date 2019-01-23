// create global variables
var allData = [];
var geoData;
var weatherData;
var metaData;
var weatherCombo = [];
var NYCMap;
var timer = 0;
var playing = false;
var apr30RideCount;
var apr23RideCount;
// Variable for the visualization instance
var stationMap;

// Start application by loading the data
loadData();


// data wrangling
function loadData() {

	// load multiple csvs
	queue()
		// .defer(d3.csv,"https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-apr14.csv")
		.defer(d3.csv,"data/10thOfJuly14.csv")
		.defer(d3.json,"https://raw.githubusercontent.com/dwillis/nyc-maps/master/boroughs.geojson")
		.defer(d3.csv,"data/430weather.csv")
		.defer(d3.csv,"data/aggregate.csv")
		.defer(d3.csv,"data/apr30.csv")
		.defer(d3.csv,"data/apr23.csv")
		.await(cleanData);
}

// wrangle data to proper types
function cleanData(error,apr,geoj,weather,metaD,apr30Rides,apr23Rides) {

		if(error) { console.log(error); }

		apr.forEach(function (d) {
			d.Lon =+ d.Lon;
			d.Lat =+ d.Lat;
			allData.push(d);
		})

		weather.forEach(function(d){
    	if (d.PrecipitationIn == "N/A"){
    		d.PrecipitationIn = 0;
    	};

   		d.date = new Date(d.DateUTC);
   		d.date = d3.time.hour.offset(d.date, -4)
      d.PrecipitationIn =+d.PrecipitationIn;
    });

		metaD.forEach(function (d) {
			d.Uber = d.Uber.replace(/\,/g,"");
			d.Uber =+ d.Uber;
			d.American = d.American.replace(/\,/g,"");
			d.American =+ d.American;
			d.Firstclass = d.Firstclass.replace(/\,/g,"");
			d.Firstclass =+ d.Firstclass;
			d.Prestige = d.Prestige.replace(/\,/g,"");
      d.Prestige = +d.Prestige;
			d["Yellow Taxis"] = d["Yellow Taxis"].replace(/\,/g,"");
			d["Green Taxis"] = d["Green Taxis"].replace(/\,/g,"");
			d["Yellow Taxis"] =+ d["Yellow Taxis"];
			d["Green Taxis"] =+ d["Green Taxis"];
		})

		var hour_totals = new Array;

		for (var i = 0; i < 24; i++){

			var obj = new Object()
			obj.trips = 0;
			obj.date = new Date (2014, 4, 30, i);

			apr30Rides.forEach(function(d){

					d.starttime = new Date(d.starttime);

					if (d.starttime.getHours() == i)
					{
						obj.trips++;
					};
			});
			hour_totals.push(obj);
		}

		var hour_totals2 = new Array;

		for (var i = 0; i < 24; i++){

			var obj = new Object()
			obj.trips = 0;
			obj.date = new Date (2014, 4, 23, i);

			apr23Rides.forEach(function(d){

					d.starttime = new Date(d.starttime);

					if (d.starttime.getHours() == i)
					{
						obj.trips++;
					};
			});
			hour_totals2.push(obj);
		}

		geoData = geoj;
		weatherData = weather;
		metaData = metaD;
		apr30RideCount = hour_totals;
		apr23RideCount = hour_totals2;

		createVis();
}

// start and stop button for map visualization
$("#playButton").click(function () {
	if (playing) {
		$(this).text("Start");
		playing = false;
	} else {
		$(this).text("Stop");
		playing = true;
	}
})

// global objects

var customVis;
var barChart;
var NYCMap;
var weatherArea;
var myVar;

// call variables 
function createVis() {
  // TO-DO: INSTANTIATE VISUALIZATION
	myVar = setInterval(myTimer, 50);
	NYCMap = new TimeLapse("ny-map",allData,[40.7829, -73.9654],[2014,07,04],geoData);
	customVis = new CustomVis("custom-chart",metaData);
	weatherArea = new WeatherArea("weather-area",weatherData);
	barChart = new BarChart("barchart-area",apr30RideCount, apr23RideCount);

	function myTimer() {
			if (playing) {
				timer++;
				NYCMap.eventHandler();
			}
	}
}

function changed() {
		customVis.eventHandler();
}

function brushed (interval) {
		barChart.selectionChanged(interval)
}
