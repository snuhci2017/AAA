var chartSvgWidth = 1200;
var chartSvgHeight = 400;
var margin = { top: 20, right: 20, bottom: 30, left: 40 };

var testData;

function drawChart(id) {
    var svg = d3.select("svg"),
        width = chartSvgWidth - margin.left - margin.right,
        height = chartSvgHeight - margin.top - margin.bottom;

    var parseTime = d3.timeParse("%y-m%");

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .2);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var color = d3.scale.category10();

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "billDetailChart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv("data/bill_detail_test.tsv", function(error, data) {
        if (error) throw error;

        y.domain([0, d3.max(data, function(d) {
            return d['총합계'];
        })]);

    });
}

drawChart(1);