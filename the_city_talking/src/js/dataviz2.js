const d3 = require('d3');
d3.tip = require('d3-tip');
const utils = require("./utils.js");

var width=500,
	height=250;

var chart = d3.select(".dataviz2")
	.attr("width",width)
	.attr("height",height);

let padding_y = 20 ;
let scale_y = d3.scale.linear().range([height,0]).domain([0,utils.max_NO2]);
let scale_x = d3.scale.ordinal().rangePoints([0, width],0.5);

let months_demo = ["01-2014","02-2014","03-2014"];
let months = ['January','February','March','April','May','June','July','August','September','October','November','December']
let years = [2010,2011,2012,2013,2014,2015]
let facilities = [
	{name:"Centre",uri:"json_centre/"},
	{name:"Headingley Kerbside",uri:"json_kerbside/"}]
let current_month = 0 ;
let current_year = 0 ;
let current_facility = 0 ;

let tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.NO2; });

months.forEach((e,i) => {
	var button = document.createElement("button");
	button.innerHTML = e ;
	button.classList.add("dataviz2_button");
	document.getElementById("buttons_dataviz2_months").appendChild(button);
})
years.forEach((e,i) => {
	var button = document.createElement("button");
	button.innerHTML = e ;
	button.classList.add("dataviz2_button");
	document.getElementById("buttons_dataviz2_years").appendChild(button);
})
facilities.forEach((e,i) => {
	var button = document.createElement("button");
	button.innerHTML = e.name ;
	button.classList.add("dataviz2_button");
	document.getElementById("buttons_dataviz2_facilities").appendChild(button);
})

function getPollutionCategory(value){
	for (var i = 1 ; i < utils.pollution_values.length ; i++){
		if (value < utils.pollution_values[i]){
			return utils.pollution_classes[i-1];
		}
	}
}

chart.call(tip);

chart.selectAll('.bg_square').data(utils.pollution_values.filter((d) => (d != utils.max_NO2)))
	.enter()
	.append("rect")
	.classed('bg_square',true)
	.attr('x',0)
	.attr('y',(d,i) => scale_y(utils.pollution_values[i+1]))
	.attr('width',width)
	.attr('height',(d,i) => scale_y(utils.max_NO2 - (utils.pollution_values[i+1]-utils.pollution_values[i])))
	.each(function (d,i){d3.select(this).classed(utils.pollution_classes[i],true)});

function loopMonth(){

	d3.json("json_kerbside/"+months_demo[current_month]+".json",(err,data) => {
		scale_x = scale_x.domain(data.map((dataOneHour) => dataOneHour.Hour)) ;
		//scale_y = scale_y.domain(d3.extent(data.map((dataOneHour) => dataOneHour.NO2)));
		var circles = chart.selectAll("circle").data(data);
		circles.enter().append("circle")
			.attr("cx", (d,i) => { return scale_x(d.Hour) })
			.attr("cy", (d,i) => { return scale_y(d.NO2) })
			.attr("r", 10)
			.attr("class","dot_pollution")
			.each(function (d,i){
				d3.select(this)
					.classed(utils.pollution_classes.join(' '),false)
					.classed(getPollutionCategory(d.NO2),true)
			})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)

		circles
			.transition()
			.attr("cy", (d,i) => { return scale_y(d.NO2) })
			.attr("cx", (d,i) => { return scale_x(d.Hour) })
			.each(function (d,i){
				d3.select(this)
					.classed(utils.pollution_classes.join(' '),false)
					.classed(getPollutionCategory(d.NO2),true)
			});
		current_month = (current_month + 1) % months.length ;
		setTimeout(loopMonth,2000);
	});
}

loopMonth();
