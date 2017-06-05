var maps_path = {"provinces": "provinces.json", "precinct": "precinct.json"}
	var topo_key = {"provinces": "provinces-geo", "precinct": "precincts"}

	var id_list = [];
	var largest_bill = 0;
	var provinces;

	var width = 960, height = 720;
	var active = d3.select(null);
	
	var proj = d3.geo.mercator()
		.center([128.0, 35.9])
		.scale(6000)
		.translate([width/2, height/2]);

	var path = d3.geo.path()
		.projection(proj);

	var svg = d3.select("svg")
		.attr("width", width)
		.attr("height", height);

	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);

	var g = svg.append("g");

	var precinct_person = {}; 

	var gm = g.append("g"); // group for precincts
	var gp = g.append("g"); // group for province

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
		
		g_provinces.append("text")
			.attr("class", "province-label")
			.attr("id", function(d) { return "subunit-label " + d.properties.code; })
			.attr("transform", function(d) {return "translate(" + [348,121] + ")"; })
			.attr("dy", ".35em")
			.text(function(d) { return d.properties.name; });
			
		g_provinces.select("path.province")
			.classed("selected", true);
		
	});

	d3.json(maps_path["precinct"], function(error, kor) {
		if (error) throw error;
		var precincts = topojson.feature(kor, kor.objects[topo_key["precinct"]]);
		
		var g_precincts = gm.selectAll('g')
			.data(precincts.features, function(d) { return d.properties.precinct_no; })
			.enter()
			.append('g')
			.attr('class', 'g_precinct');
		
		g_precincts
			.append('path')
			.attr('d', path)
			.attr('class', 'precinct')
			.on("click", clicked);
        
		g_precincts.append("text")
			.attr("class", "precinct-label")
			.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
			.attr("dy", ".35em")
			.on("click", clicked)
			.text(function(d) {
				if(d.properties.bills > largest_bill){
					largest_bill = d.properties.bills;
				} 
				 return d.properties.precinct_name; })
			.classed("svgText",true);

		g_precincts.select("path.precinct")
			.style("fill", function(d) { return d3.hcl(255,0,(255-parseInt(d.properties.bills/largest_bill*2*255)));})
			.style("stroke","#000");

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
	});

	function clicked(d){
		if(!d3.select(this).classed("highlighted")){
			d3.select(this).style("fill","blue");
			d3.select(this).classed("highlighted",true);
			id_list.push(d.properties.id);
		}
		else{
			d3.select(this).style("fill", function(d) { return d3.hcl(255,0,(255-parseInt(d.properties.bills/largest_bill*2*255)));});
			d3.select(this).classed("highlighted",false);
			for (var i = 0; i < id_list.length; i++){
				if(id_list[i] === d.properties.id){
					id_list.splice(i,1);
					break;
				}
			}
		}
		console.log(id_list);
		return id_list;
	}