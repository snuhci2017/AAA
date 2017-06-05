var chartSvgWidth = 1200;
var chartSvgHeight = 400;
var margin = {
    top: 20,
    right: 40,
    bottom: 30,
    left: 40
};

var testData;

function drawChart(id) {
    var svg = d3.select("svg"),
        width = chartSvgWidth - margin.left - margin.right,
        height = chartSvgHeight - margin.top - margin.bottom;

    var parseTime = d3.timeParse("%y-m%");

    var xBar = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var xLine = d3.scale.ordinal().rangeRoundPoints([0, width], .1);
    var yLeft = d3.scale.linear().range([height, 0]);
    var yRight = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(xBar).orient("bottom");
    var yAxisLeft = d3.svg.axis().scale(yLeft).orient("left");
    var yAxisRight = d3.svg.axis().scale(yRight).orient("right");

    var color = d3.scale.category10();

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "billDetailChart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data/bill_detail_test.tsv", function(error, data) {
        if (error) throw error;

        data = data.filter(function(d) {
            return +d['ID'] === +id;
        });

        var cumulativeData = [];
        data.reduce(function(prevVal, curVal, curIndex, array) {
            var val = +prevVal + +curVal['총합계'];
            //cumulativeData[data[curIndex]['DATE']] = val;
            cumulativeData.push(val);
            return val;
        }, 0);
        console.log(cumulativeData);
        xBar.domain(data.map(function(d) {
            return d['DATE'];
        }));
        xLine.domain(data.map(function(d) {
            return d['DATE'];
        }));
        yLeft.domain([0, d3.max(data, function(d) {
            return +d['총합계']
        })]).nice();
        yRight.domain([0, d3.max(cumulativeData, function(d) {
            return +d;
        })]).nice();

        var xAxisPos = svg.append("g")
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

        svg.append("g")
            .attr("class", "y axis axisLeft")
            .call(yAxisLeft)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("의안 발의 수(건)");

        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .style("fill", "steelblue")
            .attr("x", function(d) {
                return xBar(d['DATE']);
            })
            .attr("width", xBar.rangeBand())
            .attr("y", function(d) {
                return yLeft(d['총합계']);
            })
            .attr("height", function(d) {
                return height - yLeft(d['총합계']);
            });

        svg.append("g")
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

        svg.append("g")
            .append("path")
            .datum(cumulativeData)
            .attr("fill", "orange")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d",
                d3.svg.line().x(function(d, i) {
                    return xBar(data[i]['DATE']) + xBar.rangeBand() / 2;
                }).y(function(d) {
                    return yRight(+d);
                }));
    });
}

function addPersonToChart(id) {

}

function removePersonFromChart(id) {

}

drawChart(1);