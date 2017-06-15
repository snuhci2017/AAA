var drawedIdList = [];
var billSumData;
var billPassSumData;
var budgetSumData;
var parseTime = d3.timeParse("%y-%m");

var billChartSvgWidth = 1183;
var billChartSvgHeight = 300;
var billMargin = {
    top: 20,
    right: 30,
    bottom: 50,
    left: 40
};
var detailChartSvgWidth = 1200;
var detailChartSvgHeight = 150;

var maxPersonCount = 5;

var detailColor = function(i) {
    return colorbrewer.Paired["10"][i % 5 * 2 + 1];
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

function addPersonToChart(id) {
    if (drawedIdList.length >= maxPersonCount) {
        alert("Limited to 5 items");
        return;
    }

    if (drawedIdList.indexOf(id) >= 0) {
        return;
    }

    drawedIdList.push(id);
    drawDetails();
}

function removePersonFromChart(id) {
    if (drawedIdList.length <= 0) {
        alert("no item left");
        return;
    }
    // Remove Gauge chart when id removed from IdList
    for (i = 0; i < drawedIdList.length; i++) {
        var name = "#gaugeChart" + (i + 1).toString();
        d3.select(name).select("svg").remove();
    }
    var search = drawedIdList.indexOf(id);
    if (search >= 0) drawedIdList.splice(search, 1);
    drawDetails();
}

function drawDetails() {
    drawSelectedPersonList(drawedIdList);

    drawDetailBarChart("billPassSumChart", "bills_pass", "통과 수(건)", drawedIdList);
    drawDetailBarChart("budgetSumChart", "budget", "예산 (억원)", drawedIdList);
    drawDetailBarChart("electionChart", "election", "당선 (회)", drawedIdList);
    drawBillSumChart(drawedIdList);
    drawGaugeChart(drawedIdList);
}

function drawSelectedPersonList(idList) {
    d3.selectAll(".person")
        .remove();

    var listDiv = d3.select("#selection")
        .selectAll("div");
    var dDiv = listDiv.data(idList);
    dDiv.enter()
        .append("div")
        .text(function(d) {
            for (var fi = 0; fi < masterData.length; fi++) {
                if (+masterData[fi].id === +d) return masterData[fi].name;
            }
            return "";
        })
        .style("background-color", function(d, i) { return detailColor(i); })
        .style("color", "white")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("float", "left")
        .style("width", "20%")
        .attr("id", function(d, i) { return "person" + i; })
        .attr("align", "center")
        .attr("class", "person")
        .append("button")
        .style("vertical-align", "center")
        .style("font-size", "16px")
        .style("height", "25")
        .style("color", "#555555")
        .text("X")
        .on("click", function(d) {
            removePersonFromChart(d);
        });
}

function drawBillSumChart(idList) {
    // CLEARANCE
    d3.select("#billSumChart")
        .transition()
        .delay(50)
        .duration(50)
        .style('opacity', 0.0)
        .remove();
    d3.selectAll("p").remove();
    if (idList.length === 0) {
        d3.select("#detail")
            .append("p")
            .attr("id", "billSumChart")
            .attr("align", "center")
            .text("상세 비교 분석할 의원을 위 Rank List에서 선택하세요 (최대 5명)");
        return;
    }

    // chart initialization
    var width = billChartSvgWidth - billMargin.left - billMargin.right,
        height = billChartSvgHeight - billMargin.top - billMargin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var yLeft = d3.scale.linear().range([height, 0]);
    var yRight = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%y-%m"));
    var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");
    var yAxisRight = d3.svg.axis().scale(yRight).orient("right");

    var chartSvg = d3.select("#detailBillSumChartsDiv").append("svg")
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
        .style("fill", function(d, i) { return detailColor(i); });

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
            .attr("fill", function(d) { return detailColor(i); })
            .attr("stroke", function(d) { return detailColor(i); })
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

function drawDetailBarChart(divId, itemName, text, idList) {
    var margin = {
        top: 10,
        right: 42,
        bottom: 10,
        left: 10
    };
    // chart initialization 
    //var width = billChartSvgWidth - billMargin.left - billMargin.right,
    //    height = billChartSvgHeight - billMargin.top - billMargin.bottom;
    var svgWidth = detailChartSvgWidth,
        svgHeight = detailChartSvgHeight;
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // var xScaleWidth =
    var xWidth = width - 40;
    var x = d3.scale.ordinal().rangeRoundBands([0, xWidth / maxPersonCount * idList.length], 0);
    var yLeft = d3.scale.linear().rangeRound([height, 0]);
    //if (itemName === "election") yLeft = d3.scale.linear().range([height, 0]);
    var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left").tickFormat(d3.format("d"));
    var ySubAxis = d3.svg.axis().scale(yLeft).orient("right").tickSize(width);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");

    d3.select("#" + divId)
        .remove();

    if (idList.length === 0) return;

    var chartSvg = d3.select("#detailCharts").append("svg")
        .attr("width", width)
        .attr("height", svgHeight)
        .attr("id", divId)
        .append("g")
        .attr("transform", "translate(" + billMargin.left + "," + margin.top + ")");

    data = idList.reduce(function(prev, cur) {
        for (var fi = 0; fi < masterData.length; fi++) {
            if (+cur === masterData[fi].id) {
                prev.push(masterData[fi]);
                break;
            }
        }
        return prev;
    }, []);

    x.domain(data.map(function(d) { return d.id; }));
    var min = d3.max(data, function(d) { return d[itemName]; });
    var max = d3.max(data, function(d) { return d[itemName]; });
    yLeft.domain([0, max]).nice();

    var subAxis = chartSvg.append("g")
        .attr("class", "y axis axisSub")
        .call(ySubAxis);
    subAxis.selectAll(".tick line")
        .style("stroke", "#DDDDDD");
    subAxis.selectAll("text").remove();
    subAxis.selectAll("path").remove();
    chartSvg.append("g")
        .attr("class", "y axis axisLeft")
        .call(yAxisLeft)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 7)
        .attr("dy", ".51em")
        .style("text-anchor", "end")
        .text(text);

    var xPadding = 40;
    chartSvg.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .style("fill", function(d, i) { return detailColor(i); })
        .attr("x", function(d) { return x(d.id) + xPadding; })
        .attr("width", x.rangeBand() - xPadding * 2)
        .attr("y", function(d) { return yLeft(d[itemName]); })
        .attr("height", function(d) { return height - yLeft(d[itemName]); });

    chartSvg.append("g")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) { return Math.round(d[itemName]); })
        .attr("text-anchor", "middle")
        .style("fill", "#FFFFFF")
        .attr("x", function(d) { return (x(d.id) * 2 + x.rangeBand()) / 2; })
        .attr("y", function(d) { return yLeft(d[itemName]) + 12; });

    var xAxisPos = chartSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll(".tick")
        .remove();
}