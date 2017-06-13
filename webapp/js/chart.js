var drawedIdList = [];
var billSumData;
var billPassSumData;
var parseTime = d3.timeParse("%y-%m");

var billChartSvgWidth = 1200;
var billChartSvgHeight = 300;
var billMargin = {
    top: 20,
    right: 60,
    bottom: 66,
    left: 40
};

function initBillSum() {
    d3.tsv("data/bill_all_sum.tsv", function(d) {
        d.id = +d.id;
        d.count = +d.count;
        d.date = parseTime(d.date);
        return d;
    }, function(error, data) {
        if (error) throw error;
        billSumData = data;
    });
}

function initBillPassSum() {
    d3.tsv("data/bill_pass_sum.tsv", function(d) {
        d.id = +d.id;
        d.count = +d.count;
        return d;
    }, function(error, data) {
        if (error) throw error;
        billPassSumData = data;
    });
}

function addPersonToChart(id) {
    if (drawedIdList.length >= 5) {
        alert("Limited to 5 items");
        return;
    }

    if (drawedIdList.indexOf(id) >= 0) {
        return;
    }
    console.log(id, drawedIdList);
    drawedIdList.push(id);
    console.log(id, drawedIdList);
    drawSelectedPersonList(drawedIdList);
    drawBillSumChart(drawedIdList);
    drawBillPassSumChart(drawedIdList);
}

function removePersonFromChart(id) {
    if (drawedIdList.length <= 0) {
        alert("no item left");
        return;
    }

    drawedIdList.pop(drawedIdList.indexOf(id));
    drawSelectedPersonList(drawedIdList);
    drawBillSumChart(drawedIdList);
    drawBillPassSumChart(drawedIdList);
}

function drawSelectedPersonList(idList) {
    var listDiv = d3.select("#selection").selectAll("div");
    var div = listDiv.data(idList);

    div.enter().append("div").text(function(d) {
            return d;
        })
        .style("background-color", function(d, i) { return color(i); })
        .style("float", "left")
        .style("width", "20%")
        .append("button")
        .text("X")
        .on("click", function(d) {
            removePersonFromChart(d);
        });
    div.exit().remove();
}

function drawBillSumChart(idList) {
    // chart initialization
    var width = billChartSvgWidth - billMargin.left - billMargin.right,
        height = billChartSvgHeight - billMargin.top - billMargin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var yLeft = d3.scale.linear().range([height, 0]);
    var yRight = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%y-%m"));
    var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");
    var yAxisRight = d3.svg.axis().scale(yRight).orient("right");

    d3.select("#billSumChart")
        .transition()
        .delay(50)
        .duration(50)
        .style('opacity', 0.0)
        .remove();

    if (idList.length === 0) return;
    var chartSvg = d3.select("#detail").append("svg")
        .attr("width", billChartSvgWidth)
        .attr("height", billChartSvgHeight)
        .attr("id", "billSumChart")
        .append("g")
        .attr("transform", "translate(" + billMargin.left + "," + billMargin.top + ")");

    var data = billSumData;
    // Data filtering by ID
    data = data.filter(function(d) {
        for (var fi = 0; fi < idList.length; fi++) {
            if (+idList[fi] === +d.id) return true;
        }
        return false;
    });

    data = data.sort(function(x, y) {
        return d3.ascending(x.date, y.date);
    });

    // chart common elements
    x.domain(data.map(function(d) {
        return d.date;
    }));

    //////////////////////////////////////////
    // draw stackedBarChart
    var barChartData = data.reduce(function(prev, elem) {
        key = elem.date;
        if (elem.date in prev === false) {
            prev[key] = idList.reduce(function(p) { p.push(0); return p; }, []);
        }
        prev[key][idList.indexOf(elem.id)] = +elem.count;
        return prev;
    }, {});

    var layers = d3.layout.stack()(
        Object.entries(barChartData).reduce(function(prev, elem) {
            [key, yList] = elem;
            yList.map(function(d, i) { prev[i].push({ x: key, y: d }); });
            return prev;
        }, idList.reduce(function(p) { p.push([]); return p; }, []))
    );

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
            return "rotate(-40)";
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
}

function drawBillPassSumChart(idList) {
    // chart initialization
    //var width = billChartSvgWidth - billMargin.left - billMargin.right,
    //    height = billChartSvgHeight - billMargin.top - billMargin.bottom;
    var width = billChartSvgWidth,
        height = billChartSvgHeight / 3;
    width = width / 5 * idList.length;
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0);
    var yLeft = d3.scale.linear().range([height, 0]);
    var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");

    var data = billPassSumData;
    d3.select("#billPassSumChart")
        .transition()
        .delay(50)
        .duration(50)
        .style('opacity', 0.0)
        .remove();

    var chartSvg = d3.select("#detail").append("svg")
        .attr("width", width)
        .attr("height", billChartSvgHeight)
        .attr("id", "billPassSumChart")
        .append("g")
        .attr("transform", "translate(" + billMargin.left + "," + billMargin.top + ")");
    console.log(data);
    data = data.filter(function(d) {
        for (var fi = 0; fi < idList.length; fi++) {
            if (+idList[fi] === +d.id) return true;
        }
        return false;
    });
    console.log(data);
    x.domain(data.map(function(d) { return d.id; }));
    yLeft.domain([0, d3.max(data, function(d) { return d.count; })]);
    var layer = chartSvg
        .append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .style("fill", function(d, i) { return color(i); })
        .attr("x", function(d) { return x(d.id); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return yLeft(d.count); })
        .attr("height", function(d) { return height - yLeft(d.count); });

    chartSvg.append("g")
        .attr("class", "y axis axisLeft")
        .call(yAxisLeft)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("통과 수(건)");
}