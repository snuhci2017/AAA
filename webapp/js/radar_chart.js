var RadarChart = {
    draw: function(id, d){
        var cfg = {
            radius: 6,
            width: 600,
            height: 600, 
            factor: 1,
            factorLegend: .85,
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            opacityArea: 0.5,
            color: d3.scale.category10()
        };
        

        cfg.maxValue = Math.max(cfg.maxValue, d3.max(d.map(function(o){return o.value})));
        var allAxis = (d.map(function(i, j){return i.axis}));
        var total = allAxis.length;
        var radius = cfg.factor*Math.min(cfg.width/2, cfg.height/2);
        var data = [];

        d3.select(id).select("svg").remove();
        var g = d3.select(id).append("svg").attr("width", cfg.width).attr("height", cfg.height).append("g");

        var tooltip;

        drawFrame();
        var maxAxisValues = [];
        drawAxis();
        var dataValues = [];
        reCalculatePoints();

        var areagg = initPolygon();
        drawPolygon();
        drawnode();

        function drawFrame(){
            for(var j=0; j<cfg.levels; j++){
                var levelFactor = cfg.factor * radius * ((j+1)/cfg.levels);
                g.selectAll(".levels").data(allAxis).enter().append("svg:line")
                .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px")
                .attr("transform", "translate(" + (cfg.width/2-levelFactor) + ", " + (cfg.height/2-levelFactor) + ")");
            }
        }

        function drawAxis(){
            var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

            axis.append("line")
            .attr("x1", cfg.width/2)
            .attr("y1", cfg.height/2)
            .attr("x2", function(j, i){
                maxAxisValues[i] = {x:cfg.width/2 * (1-cfg.factor*Math.sin(i*cfg.radians/total)), y:0};
                return maxAxisValues[i].x;
            })
            .attr("y2", function(j, i){
                maxAxisValues[i].y = cfg.height/2 * (1-cfg.factor*Math.cos(i*cfg.radians/total));
                return maxAxisValues[i].y;
            })
            .attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

            axis.append("text").attr("class", "legend")
            .text(function(d){return d}).style("font-family", "Arial").style("font-size", "10px")
            .attr("transform", function(d, i){return "translate(0, -10)";})
            .attr("x", function(d, i){return cfg.width/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-20*Math.sin(i*cfg.radians/total);})
            .attr("y", function(d, i){return cfg.height/2*(1-Math.cos(i*cfg.radians/total))+20*Math.cos(i*cfg.radians/total);});
        }

        function reCalculatePoints(){
            g.selectAll(".nodes")
            .data(d, function(j, i){
                dataValues[i] = [
                    cfg.width/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                    cfg.height/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
                ];
            });
            dataValues[d[0].length] = dataValues[0];

            data = [];
            for(i=0;i<d.length;i++){
                data.push(d[i]['value']);
            }
        }

        function initPolygon(){
            return g.selectAll("area").data([dataValues])
            .enter().append("polygon")
            .attr("class", "radar-chart-serie0")
            .style("stroke-width", "2px")
            .style("stroke", cfg.color(0))
            .style("fill", function(j, i){return cfg.color(0);})
            .style("fill-opacity",cfg.opacityArea);
        }

        function drawPolygon(){
            areagg.attr("points", function(d){
                var str = "";
                for(var pti=0; pti<d.length; pti++){
                    str = str + d[pti][0] + "," + d[pti][1] + " ";
                }
                return str;
            });
        }

        function drawnode(){
            g.selectAll(".nodes")
            .data(d).enter()
            .append("svg:circle").attr("class", "radar-chart-serie0")
            .attr("r", cfg.radius)
            .attr("alt", function(j){return Math.max(j.value, 0);})
            .attr("cx", function(j, i){
                return cfg.width/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
            })
            .attr("cy", function(j, i){
                return cfg.height/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
            })
            .attr("data-id", function(j){return j.axis;})
            .style("fill", cfg.color(0)).style("fill-opacity", 0.9)
            .call(d3.behavior.drag().on("drag", move))
            .append("svg:title")
            .text(function(j){return Math.max(j.value, 0)});
        }

        tooltip = g.append("text").style("opacity", 0).style("font-family", "Arial").style("font-size", 13);

        function move(obj, i){
            this.parentNode.appendChild(this);
            
            var dragTarget = d3.select(this);
            var oldData = dragTarget.data()[0];
            var oldX = parseFloat(dragTarget.attr("cx")) - 300;
            var oldY = 300 - parseFloat(dragTarget.attr("cy"));
            var newY = 0, newX = 0, newValue = 0;
            var maxX = maxAxisValues[i].x - 300;
            var maxY = 300 - maxAxisValues[i].y;

            if (oldX === 0) {
                newY = oldY - d3.event.dy;
                if (Math.abs(newY) > Math.abs(maxY)) {
                    newY = maxY;
                }
                newValue = (newY/oldY) * oldData.value;
            } else {
                var slope = oldY/oldX;
                newX = d3.event.dx + parseFloat(dragTarget.attr("cx")) - 300;
                if(Math.abs(newX) > Math.abs(maxX)) {
                    newX = maxX;
                }
                newY = newX * slope;

                var ratio = newX / oldX;
                newValue = ratio * oldData.value;
            }

            dragTarget
            .attr("cx", function(){return newX + 300;})
            .attr("cy", function(){return 300 - newY;});

            d[oldData.order].value = newValue;
            reCalculatePoints();
            drawPolygon();
        }
    }
};