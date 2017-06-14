// GLOBAL VARIABLES
var radarColumnNames = ["bills", "bills_pass", "budget", "conservative", "progressive", "election"];
var radarColumnNamesShort = ["B", "BP", "BG", "CS", "PG", "EL"];
var maxForNormalization = {};
var minForNormalization = {};
var rankTable = d3.select("#rank_table");
var rankTableHeadTr = rankTable.append("thead").append("tr");
rankTable.select("thead").style("border-width", "0 0 1 0");
var rankTableBody = rankTable.append("tbody");
var color = d3.scale.category10();
var masterData;
var rankTableColumnWidth = 1044;
var rankTableRowMaxHeight = 19;
var rankTableRowMinHeight = 19;
var rankTableMaxFontSize = 0.9;
var rankTableMinFontSize = 0.9;

var rankColor = function(i) {
    return colorbrewer.RdYlGn["6"][i % 6];
};


// LOAD MASTER DATA
d3.tsv("data/master_table.tsv", function(d) {
    d.id = +d.id;
    radarColumnNames.forEach(function(item, i) {
        d[item] = +d[item];
    });
    d.budget /= 10000000;
    return d;
}, function(error, data, i) {
    masterData = data;
    radarColumnNames.forEach(function(item, i) {
        var min, max = 0;
        [min, max] = d3.extent(data, function(d) { return d[item]; });
        maxForNormalization[item] = max;
        minForNormalization[item] = min;
    });
    init();
});

function init() {
    // var rankAndName = { RANK: 60, NAME: 120 };
    // rankTableHeadTr.style("padding", "1px")
    // rankTableHeadTr
    //     .selectAll("th")
    //     .data(Object.keys(rankAndName).concat(radarColumnNames))
    //     .enter()
    //     .append("th")
    //     .style("width", function(d, i) { return (i >= 2 ? rankTableColumnWidth / 6 : rankAndName[d]); })
    //     .style("height", 15)
    //     .style("opacity", 0.8)
    //     .attr("class", "second_tr")
    //     .style("background-color", function(d, i) { return (i >= 2 ? rankColor(i - 2) : ""); })
    //     .text(function(d) { return d; });

    initBillSum();
    drawBillSumChart([]);
    sortList([1, 0.1, 0.1, 0.1, 0.1, 0.1]);
}

// LOAD BILLBYPERSON DATA
function sortList(priorityList) {
    // Normalizing
    var priSum = priorityList.reduce(function(prev, cur) { return prev + cur; }, 0);
    priorityList = priorityList.reduce(function(prev, cur) { prev.push(cur / priSum); return prev; }, []);

    var tableColumns = [];
    var priorityListNoZero = priorityList.reduce(function(prev, cur, i) {
        if (cur !== 0) {
            tableColumns.push(radarColumnNames[i]);
            prev.push(cur);
        }
        return prev;
    }, []);

    var rankData = [];
    // SAVE NORMALIZED (MINMAX Normalization) score.
    masterData.forEach(function(data, i) {
        var row = { id: data.id, name: data.name, precinct: data.precinct };
        row.score = 0;
        tableColumns.forEach(function(item, i) {
            row[item] = (data[item] - minForNormalization[item]) /
                (maxForNormalization[item] - minForNormalization[item]) *
                priorityListNoZero[i];
            row.score += row[item];
            // console.log(row[item], item, i, row.score);
        });
        rankData.push(row);
    });

    // SORTING rankData
    rankData.sort(function(x, y) { return y.score - x.score; });
    var rank = 1;
    rankData.forEach(function(d) {
        d.rank = rank++;
    });

    drawRankTable(priorityList, tableColumns, rankData);
    updateGeomap(rankData);
}

function drawRankTable(priorityList, tableColumns, rankData) {
    // CLEAR
    rankTableHeadTr
        .selectAll("th")
        .data([])
        .exit()
        .remove();
    rankTableBody
        .selectAll("tr")
        .data([])
        .exit()
        .remove();

    priorityList = priorityList.reduce(function(prev, cur) { if (cur !== 0) prev.push(cur); return prev; }, []);
    var pListStackForHeader = priorityList.reduce(function(prev, cur, i) {
        if (cur === 0) return prev;
        var cum = 0;
        if (i > 0) cum = prev[i - 1].x0 + prev[i - 1].x;
        prev.push({ x: cur, x0: cum });
        return prev;
    }, []);

    var x = d3.scale.linear().range([0, rankTableColumnWidth]);
    var y = d3.scale.linear().rangeRound([rankTableRowMinHeight, rankTableRowMaxHeight])
        .domain([rankData.length, 1]);
    var fontScale = d3.scale.linear().range([rankTableMinFontSize, rankTableMaxFontSize])
        .domain([rankData.length, 1]);
    rankTableHeadTr
        .append("th")
        .style("width", "40")
        .style("text-align", "center")
        .text("RANK");
    rankTableHeadTr
        .append("th")
        .style("text-align", "center")
        .style("width", "80")
        .text("NAME");
    var headSvg = rankTableHeadTr
        .append("th")
        .style("width", rankTableColumnWidth)
        .append("div")
        .append("svg")
        .attr("width", rankTableColumnWidth)
        .attr("height", rankTableRowMaxHeight)
        .append("g");
    headSvg
        .selectAll("rect")
        .data(pListStackForHeader)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x); })
        .attr("y", 0)
        .attr("height", "100%")
        .style("opacity", "0.0")
        .transition()
        .delay(300)
        .duration(300)
        .style("opacity", "0.8")
        .style("fill", function(d, i) { return rankColor(i); })
        .text(function(d) { return x(d.x0); });
    headSvg.selectAll("text")
        .data(tableColumns)
        .enter()
        .append("text")
        .attr("x", function(d, i) { return x(pListStackForHeader[i].x0); })
        .attr("y", 15)
        .text(function(d, i) {
            if (x(pListStackForHeader[i].x) < 55) return radarColumnNamesShort[i];
            else return d;
        })
        .style("font-size", function(d, i) {
            if (x(pListStackForHeader[i].x) < 70) return "0.8em";
            else return "1em";
        });

    var rows = rankTableBody
        .selectAll("tr")
        .data(rankData);

    rows.enter()
        .append("tr")
        .style("height", function(d, i) { return y(i); })
        .attr("id", function(d) { return "person" + d.id; })
        .style("font-size", function(d, i) { return fontScale(i) + "em"; })
        .style("font-weight", "bold")
        .attr("class", function(d, i) { return (i % 2 === 1 ? "even_tr" : "odd_tr"); });
    rows.on("mouseover", function(d){
        hightlightGeo(d.precinct);
    }).on("mouseout", function(d){
        deHighlightGeo(d.precinct);
    });
    // .style("text-decoration", "underline");


    var cells = rows.selectAll('td')
        .data(function(row) {
            return ["rank", "name"].map(function(column) {
                return { column: column, value: row[column] };
            });
        });

    cells.enter()
        .append('td')
        .style("opacity", "0.0")
        .transition()
        .delay(300)
        .duration(300)
        .style("opacity", "1.0")
        .attr("align", "center")
        .text(function(d) { return d.value; });

    // STACKED BAR CHART
    var stack = d3.layout.stack()(
        Object.entries(rankData).reduce(function(prev, elem) {
            [key, values] = elem;
            tableColumns.map(function(d, i) { prev[i].push({ x: key, y: values[d] }); });
            return prev;
        }, tableColumns.reduce(function(p) { p.push([]); return p; }, []))
    );

    var chartSvg = rows.append("td")
        .attr("colspan", tableColumns.length)
        .attr("id", "bars")
        .append("div")
        .append("svg")
        .attr("width", rankTableColumnWidth)
        .style("height", function(d, i) { return y(i); })
        .append("g");

    var rects = chartSvg
        .selectAll("rect")
        .data(function(d, di) {
            return tableColumns.reduce(function(prev, cur, i) {
                var cum = 0;
                if (i > 0) cum = prev[i - 1].x0 + prev[i - 1].x;
                prev.push({ x: d[cur], x0: cum, y: di });
                return prev;
            }, []);
        });

    rects.enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x); })
        .attr("y", 0)
        .style("height", "99%")
        .style("opacity", "0.0")
        .transition()
        .delay(300)
        .duration(300)
        .style("opacity", "0.8")
        .style("fill", function(d, i) { return rankColor(i); });

    cells.exit()
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    rows.exit()
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    rows.on("click", function(d) { selectPerson(d['id']); });
}

function selectPerson(id) {
    addPersonToChart(id);
}