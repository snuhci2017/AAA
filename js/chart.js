var chartSvgWidth = 800;
var chartSvgHeight = 400;
var margin = {
    top: 20,
    right: 40,
    bottom: 30,
    left: 40
};

var testData;
var drawedIdList = [];
var color = d3.scale.category10();

function drawSelectedPersonList(idList) {
    console.log(idList);
    var listDiv = d3.select("#selection").selectAll("div");
    var div = listDiv.data(idList);

    div.enter().append("div").text(function(d) {
            return d;
        })
        .style("background-color", function(d, i) { return color(i); })
        .append("button")
        .text("X")
        .on("click", function(d) {
            removePersonFromChart(d);
        });
    div.exit().remove();
}

function addPersonToChart(id) {
    if (drawedIdList.length > 5) {
        alert("Limited to 5 items");
        return;
    }
    drawedIdList.push(id + "");
    drawSelectedPersonList(drawedIdList);
    drawChart(drawedIdList);
}

function removePersonFromChart(id) {
    if (drawedIdList.length <= 0) {
        alert("no item left");
        return;
    }

    drawedIdList.pop(drawedIdList.indexOf(id + ""));
    drawSelectedPersonList(drawedIdList);
    drawChart(drawedIdList);
}


// chart initialization
var parseTime = d3.timeParse("%y-%m");

var width = chartSvgWidth - margin.left - margin.right,
    height = chartSvgHeight - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
var yLeft = d3.scale.linear().range([height, 0]);
var yRight = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%y-%m"));
var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");
var yAxisRight = d3.svg.axis().scale(yRight).orient("right");

function drawChart(idList) {
    d3.select("svg")
        .transition()
        .delay(50)
        .duration(50)
        .style('opacity', 0.0)
        .remove();

    if (idList.length === 0) return;
    setTimeout(function() {
        var chartSvg = d3.select("body").append("svg")
            .attr("width", chartSvgWidth)
            .attr("height", chartSvgHeight)
            .attr("id", "billDetailChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.tsv("data/bill_detail_test.tsv", function(d) {
            d['DATE'] = parseTime(d['DATE']);
            return d;
        }, function(error, data) {
            if (error) throw error;

            // Data filtering by ID
            data = data.filter(function(d) {
                for (var fi = 0; fi < idList.length; fi++) {
                    if (+idList[fi] === +d['ID']) return true;
                }
                return false;
            });

            data = data.sort(function(x, y) {
                return d3.ascending(x['DATE'], y['DATE']);
            });

            // chart common elements
            x.domain(data.map(function(d) {
                return d['DATE'];
            }));

            //////////////////////////////////////////
            // draw stackedBarChart
            var barChartData = data.reduce(function(prev, elem) {
                key = elem['DATE'];
                if (elem['DATE'] in prev === false) {
                    prev[key] = idList.reduce(function(p) { p.push(0); return p; }, []);
                }
                prev[key][idList.indexOf(elem['ID'])] = +elem['총합계'];
                return prev;
            }, {});

            var layers = d3.layout.stack()(
                Object.entries(barChartData).reduce(function(prev, elem) {
                    [key, yList] = elem;
                    yList.map(function(d, i) { prev[i].push({ x: key, y: d }); });
                    return prev;
                }, idList.reduce(function(p) { p.push([]); return p; }, []))
            );
            console.log(layers);
            yLeft.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();
            var layer = chartSvg.selectAll("bar")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .style("fill", function(d, i) { return color(i); });

            var rects = layer.selectAll("rect")
                .data(function(d) { return d; });

            rects.enter().append("rect")
                .attr("x", function(d) { return x(d.x); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return yLeft(d.y + d.y0); })
                .attr("height", function(d) { return yLeft(d.y0) - yLeft(d.y + d.y0); });

            var xAxisPos = chartSvg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            xAxisPos.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.15em")
                .attr("dy", ".7em")
                .attr("transform", function(d) {
                    return "rotate(-40)"
                });
            xAxisPos.append("text")
                .attr("class", "label")
                .style("text-anchor", "end")
                .text("시간(월)")
                .attr("x", 10)
                .attr("y", 16);

            chartSvg.append("g")
                .attr("class", "y axis axisLeft")
                .call(yAxisLeft)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("의안 발의 수(건)");

            //////////////////////////////////////////
            // draw lineChart
            var cumulativeDataList = idList.reduce(function(p) { p.push([]); return p; }, []);

            // using cumulativeDataList by barchartdata
            // fill empty data by "0"
            idList.map(function(id, i) {
                var dateList = Object.keys(barChartData);
                var sum = 0;
                for (var fi = 0; fi < dateList.length; fi++) {
                    sum += barChartData[dateList[fi]][i];
                    cumulativeDataList[i].push({ x: dateList[fi], y: sum });
                }
            });

            yRight.domain([0, d3.max(cumulativeDataList, function(d) {
                return +d[d.length - 1].y;
            })]).nice();

            cumulativeDataList.map(function(chartData, i) {
                chartSvg.append("g")
                    .append("path")
                    .datum(chartData)
                    .attr("fill", function(d) { return color(i); })
                    .attr("stroke", function(d) { return color(i); })
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d",
                        d3.svg.line().x(function(d, i) {
                            return +x(d.x) + x.rangeBand() / 2;
                        }).y(function(d) {
                            return yRight(+d.y);
                        }));
            });

            chartSvg.append("g")
                .attr("class", "y axis axisRight")
                .style("text-anchor", "start")
                .attr("transform", "translate(" + (width) + ",0)")
                .call(yAxisRight)
                .append("text")
                .attr("y", -16)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .text("의안 발의 수 누적(건)");
        });
    }, 500);
}

addPersonToChart(1);

setTimeout(function() {
    addPersonToChart(2);
}, 1000);
setTimeout(function() {
    addPersonToChart(3);
}, 2000);