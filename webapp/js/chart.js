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
    
    div.enter().append("div").text(function (d) {
            return d;
        })
        .style("background-color", function (d, i) {return color(i);})
        .append("button")
        .text("X")
        .on("click", function (d) {
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

    if (drawedIdList.lenght != 0) drawChart(drawedIdList);
}

function removePersonFromChart(id) {
    if (drawedIdList.length <= 0) {
        alert("no item left");
        return;
    }
    
    drawedIdList.pop(drawedIdList.indexOf(id+""));
    drawSelectedPersonList(drawedIdList);
    if (drawedIdList.lenght != 0) drawChart(drawedIdList);
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
    d3.select("svg").remove();
    var chartSvg = d3.select("body").append("svg")
        .attr("width", chartSvgWidth)
        .attr("height", chartSvgHeight)
        .attr("id", "billDetailChart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data/bill_detail_test.tsv", function (d) {
        d['DATE'] = parseTime(d['DATE']); return d;
    }, function (error, data) {
        if (error) throw error;
        
        // Data filtering by ID
        data = data.filter(function (d) {
            for (var fi = 0; fi < idList.length; fi++) {
                if (+idList[fi] === +d['ID']) return true;
            }
            return false;
        });

        // chart common elements
        x.domain(data.map(function (d) {
            return d['DATE'];
        }));

        //////////////////////////////////////////
        // draw stackedBarChart
        var barChartData = data.reduce(function (prev, elem) {
            // console.log(prev, elem, idList);
            key = elem['DATE'];
            if (elem['DATE'] in prev === false) {
                prev[key] = idList.reduce(function (p) {p.push(0); return p;}, []);
            }
            // console.log("asdf", elem['ID'], idList.indexOf(elem['ID']), prev);
            prev[key][idList.indexOf(elem['ID'])] = +elem['총합계'];
            // prev[data['DATE']][idList.length] += +data['총합계'];
            return prev;
        }, {});

        var layers = d3.layout.stack()(
            Object.entries(barChartData).reduce(function (prev, elem) {
                [key, yList] = elem;
                yList.map(function (d, i) { prev[i].push({x: key, y: d}); });
                return prev;
            }, idList.reduce(function (p) {p.push([]); return p;}, []))
        );

        yLeft.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();
        var layer = chartSvg.selectAll("bar")
                            .data(layers)
                            .enter().append("g")
                            .attr("class", "layer")
                            .style("fill", function(d, i) { return color(i); });
                            
        var rects = layer.selectAll("rect")
            .data(function (d) {return d;});

        rects.enter().append("rect")
            .attr("x", function (d) {return x(d.x);})
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return yLeft(d.y + d.y0); })
            .attr("height", function(d) { return yLeft(d.y0) - yLeft(d.y + d.y0); })

        var xAxisPos = chartSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        xAxisPos.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.15em")
            .attr("dy", ".7em")
            .attr("transform", function (d) {
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
        var cumulativeDataList = idList.reduce(function (p) {p.push([]); return p;}, []);
        idList.map(function (id) {
            data.filter(function (d) { return +d['ID'] === +id; })
                .reduce(function (prevVal, curVal, curIndex, array) {
                    var val = +prevVal + +curVal['총합계'];
                    cumulativeDataList[idList.indexOf(id)].push(val);
                    return val;
                }, 0);
        });
        yRight.domain([0, d3.max(cumulativeDataList, function (d) {
            return +d[d.length-1];
        })]).nice();
        
        cumulativeDataList.map(function (chartData, i) {
            chartSvg.append("g")
                .append("path")
                .datum(chartData)
                .attr("fill", function (d) {return color(i);})
                .attr("stroke", function (d) {return color(i);})
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d",
                    d3.svg.line().x(function(d, i) {
                        return x(data[i]['DATE']) + x.rangeBand() / 2;
                    }).y(function(d) {
                        return yRight(+d);
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
}

addPersonToChart(1);

setTimeout(function() {
    addPersonToChart(2);
}, 1000);
setTimeout(function() {
    addPersonToChart(3);
}, 2000);
// setTimeout(function() {
//     removePersonFromChart(2);
// }, 3000);




// function drawChart_bak(id) {
//     var svg = d3.select("svg"),
//         width = chartSvgWidth - margin.left - margin.right,
//         height = chartSvgHeight - margin.top - margin.bottom;

//     var parseTime = d3.timeParse("%y-%m");

//     // var xBar = d3.scale.ordinal().rangeRoundBands([0, width], .1);
//     var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
//     var yLeft = d3.scale.linear().range([height, 0]);
//     var yRight = d3.scale.linear().range([height, 0]);

//     var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%y-%m"));
//     var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");
//     var yAxisRight = d3.svg.axis().scale(yRight).orient("right");

//     var color = d3.scale.category10();

//     var svg = d3.select("body").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .attr("id", "billDetailChart")
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     d3.tsv("data/bill_detail_test.tsv", function (d) {
//         d['DATE'] = parseTime(d['DATE']); return d;
//     }, function (error, data) {
//         if (error) throw error;
        
//         data = data.filter(function (d) {
//             return +d['ID'] === +id;
//         });

//         var cumulativeData = [];
//         data.reduce(function (prevVal, curVal, curIndex, array) {
//             var val = +prevVal + +curVal['총합계'];
//             //cumulativeData[data[curIndex]['DATE']] = val;
//             cumulativeData.push(val);
//             return val;
//         }, 0);
//         console.log(cumulativeData);
//         // xBar.domain(data.map(function(d) {
//         //     return d['DATE'];
//         // }));
//         x.domain(data.map(function (d) {
//             return d['DATE'];
//         }));
//         yLeft.domain([0, d3.max(data, function (d) {
//             return +d['총합계']
//         })]).nice();
//         yRight.domain([0, d3.max(cumulativeData, function (d) {
//             return +d;
//         })]).nice();
//         var xAxisPos = svg.append("g")
//             .attr("class", "x axis")
//             .attr("transform", "translate(0," + height + ")")
//             .call(xAxis);
//         xAxisPos.selectAll("text")
//             .style("text-anchor", "end")
//             .attr("dx", "-.15em")
//             .attr("dy", ".7em")
//             .attr("transform", function (d) {
//                 return "rotate(-40)"
//             });

//         xAxisPos.append("text")
//             .attr("class", "label")
//             .style("text-anchor", "end")
//             .text("시간(월)")
//             .attr("x", 10)
//             .attr("y", 16);

//         svg.append("g")
//             .attr("class", "y axis axisLeft")
//             .call(yAxisLeft)
//             .append("text")
//             .attr("transform", "rotate(-90)")
//             .attr("y", 6)
//             .attr("dy", ".71em")
//             .style("text-anchor", "end")
//             .text("의안 발의 수(건)");

//         svg.selectAll("bar")
//             .data(data)
//             .enter().append("rect")
//             .style("fill", "steelblue")
//             .attr("x", function (d) {
//                 return x(d['DATE']);
//             })
//             .attr("width", x.rangeBand())
//             .attr("y", function (d) {
//                 return yLeft(d['총합계']);
//             })
//             .attr("height", function (d) {
//                 return height - yLeft(d['총합계']);
//             });

//         svg.append("g")
//             .attr("class", "y axis axisRight")
//             .style("text-anchor", "start")
//             .attr("transform", "translate(" + (width) + ",0)")
//             .call(yAxisRight)
//             .append("text")
//             .attr("y", -16)
//             .attr("dy", ".71em")
//             .style("text-anchor", "end")
//             .attr("transform", "rotate(-90)")
//             .text("의안 발의 수 누적(건)");

//         svg.append("g")
//             .append("path")
//             .datum(cumulativeData)
//             .attr("fill", "orange")
//             .attr("stroke", "steelblue")
//             .attr("stroke-linejoin", "round")
//             .attr("stroke-linecap", "round")
//             .attr("stroke-width", 1.5)
//             .attr("d",
//                 d3.svg.line().x(function(d, i) {
//                     return x(data[i]['DATE']) + x.rangeBand() / 2;
//                 }).y(function(d) {
//                     return yRight(+d);
//                 }));
//         drawedIdList.push(id);
//     });
// }
