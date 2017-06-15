// Function for updateGeomap (When criteria changed)
function updateGeomap(data) {
		var maxVal = -1;
		var minVal = 2;
        d3.select("#geo").selectAll(".g_precinct").select("path.precinct").style("fill", function(d) {
                // Recalculate assembly score
				for (i = 0; i < data.length; i++) {
                    if (data[i].score > maxVal) maxVal = data[i].score;
                    if (data[i].score < minVal) minVal = data[i].score;
                    if (d.properties.precinct_name === data[i].precinct) {
                        score = data[i].score;
                    }
                }
				// Remapping color
                return d3.hcl(-97, 150, 200 - (255 * ((score-minVal)/(maxVal-minVal))));
            })
            .style("stroke", "#000");
}
// Function for linking between ranktable and geomap
function hightlightGeo(data){
	d3.select("#geo").selectAll(".g_precinct").select("path.precinct").filter(function(d){
		return (d.properties.precinct_name === data);
	}).style({'stroke': 'red',"stroke-width": "0.3px"});
}
// Function for linking between ranktable and geomap
function deHighlightGeo(data){
	d3.select("#geo").selectAll(".g_precinct").select("path.precinct").filter(function(d){
		return (d.properties.precinct_name === data);
	}).style({'stroke': '#777',"stroke-width": "0.07px"});
}
// Function for draw geomap
function drawGeo(id, data){
	var maps_path = {"provinces": "provinces.json", "precinct": "precinct.json"}
	var topo_key = {"provinces": "provinces-geo", "precinct": "precincts"}

	var id_list = [];
	var largest_bill = 0;
	var min_bill = 99999999;
	var provinces;
	var width = 600, height = 500;
	var active = d3.select(null);
	
	var proj = d3.geo.mercator()
		.center([128.0, 35.9])
		.scale(6000)
		.translate([width/2, height/2]);

	var path = d3.geo.path()
		.projection(proj);

	var svg = d3.select("#geo")
		.attr("width", width)
		.attr("height", height);

	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);

	d3.select(id).select("svg").remove();
	var g = d3.select(id).append("svg").attr("width", width).attr("height", height).append("g");

	var precinct_person = {}; 

	var gm = g.append("g"); // group for precincts
	var gp = g.append("g"); // group for province

	// Get province info and draw province (Seoul only)
	d3.json(maps_path["provinces"], function(error, kor) {
		if (error) throw error;
		provinces = topojson.feature(kor, kor.objects[topo_key["provinces"]]);
		
		var g_provinces = gp.selectAll('g')
			.data(provinces.features, function(d) { return d.properties.code; })
			.enter()
			.append('g')
			.attr('class', 'g_province');
		
		g_provinces.append('path')
			.attr('d', path)
			.attr('class', 'province')
			.append("title")
			.text(function(d) { return d.properties.name; });
		
		g_provinces.select("path.province")
			.classed("selected", true);
		
	});
	// Get precinct info and draw precincts
	d3.json(maps_path["precinct"], function(error, kor) {
		if (error) throw error;
		var precincts = topojson.feature(kor, kor.objects[topo_key["precinct"]]);
		
		var g_precincts = gm.selectAll('g')
			.data(precincts.features, function(d) { return d.properties.precinct_no; })
			.enter()
			.append('g')
			.attr('class', 'g_precinct')
			.attr('id', '#precincts');
		
		g_precincts
			.append('path')
			.attr('d', path)
			.attr('class', 'precinct');
        
		g_precincts.append("text")
			.attr("class", "precinct-label")
			.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
			.attr("dy", ".35em")
			.text(function(d) {
				// Get largest bill and min bill for color mapping
				if(d.properties.bills > largest_bill){
					largest_bill = d.properties.bills;
				}
				if(d.properties.bills < min_bill){
					min_bill = d.properties.bills;
				}
				 return d.properties.precinct_name; })
			.classed("svgText",true);

		g_precincts.select("path.precinct")
			.style("fill", function(d) {
				// Color mapping. Initially, use bill info only 
				return d3.hcl(-97, 150, 200 - (255 * ((d.properties.bills-min_bill)/(largest_bill-min_bill))));})
			.style("stroke","#000");

		// Calculate bounds and translate geomap for proper view
		var state = provinces.features.filter(function(d) { return d.properties.code === '11'; })[0];
        var bounds = path.bounds(state),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = .7 / Math.max(dx / width, dy / height),
			translate = [width / 2 - scale * x, height / 2 - scale * y];

        g.transition()
			.duration(0)
			.style("stroke-width", 1.5 / scale + "px")
			.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	
		d3.selectAll(".province").style("stroke-width", 2 / scale + "px");
		d3.selectAll(".precinct").style("stroke-width", 1 / scale + "px");

		// Function for linking between geomap and rank table
		g_precincts.on("mouseover", function(data){
			d3.select("#geo").selectAll(".g_precinct").select("path.precinct").filter(function(d){
			return (d.properties.precinct_name === data.properties.precinct_name);
		}).style({'stroke': 'red',"stroke-width": "0.3px"});
			highlightperson(data.properties.assembly);
		});

		g_precincts.on("mouseout", function(data){
			d3.select("#geo").selectAll(".g_precinct").select("path.precinct").filter(function(d){
			return (d.properties.precinct_name === data.properties.precinct_name);
		}).style({'stroke': '#777',"stroke-width": "0.07px"});
			deHighlightperson(data.properties.assembly);
		});
	});
}