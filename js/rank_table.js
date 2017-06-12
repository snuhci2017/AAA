// GLOBAL VARIABLES
var radarColumnNames = ["bills", "bills_pass", "budget", "conservative", "progressive", "election"];
var maxForNormalization = {};
var minForNormalization = {};
var rankTable = d3.select("#rank_table");
var rankTableHeadTr = rankTable.append("thead").append("tr");
var rankTableBody = rankTable.append("tbody");
var color = d3.scale.category10();
var masterData;
var rankTableColumnWidth = 100;
var rankTableRowHeight = 15;

// LOAD MASTER DATA
d3.tsv("data/master_test.tsv", function(d) {
    d.id = +d.id;
    radarColumnNames.forEach(function(item, i) {
        d[item] = +d[item];
    });
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
    sortList([1, 1, 0, 1, 1, 0]);
}

// LOAD BILLBYPERSON DATA
function sortList(priorityList) {
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
    console.log(rankData);

    drawRankTable(tableColumns, rankData);
    //updateGeomap(rankData);
}

function drawRankTable(tableColumns, rankData) {
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

    // rankData.value = "";
    var thead = rankTableHeadTr
        .selectAll("th")
        .data(["rank", "name"].concat(tableColumns));

    thead.enter()
        .append("th")
        .text(function(d) { return d; })
        .style("width", function(d, i) {
            if (i > 1) return rankTableColumnWidth + "px";
        })
        .style("background-color", function(d, i) {
            if (i > 1) return color(i - 2);
        });

    var rows = rankTableBody
        .selectAll("tr")
        .data(rankData);

    rows.enter()
        .append("tr")
        .attr("id", function(d) { return "person" + d.id; });

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
        .text(function(d) { return d.value; });


    // STACKED BAR CHART
    var maxWidth = tableColumns.length * rankTableColumnWidth;
    var x = d3.scale.linear().rangeRound([0, maxWidth]).domain([0, tableColumns.length]);
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
        .attr("width", maxWidth)
        .attr("height", rankTableRowHeight)
        .append("g");

    var rects = chartSvg
        .selectAll("rect")
        .data(function(d) {
            return tableColumns.reduce(function(prev, cur, i) {
                var cum = 0;
                if (i > 0) cum = prev[i - 1].x;
                prev.push({ x: cum + d[cur], x0: cum });
                return prev;
            }, []);
        });

    rects.enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x); })
        .attr("y", 0)
        .attr("height", rankTableRowHeight - 1)
        .style("fill", function(d, i) { return color(i); });

    cells.exit()
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0.0)
        .remove();

    thead.exit()
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
    alert(id);
}

setTimeout(function() {
    sortList([1, 0, 0, 0, 0, 1]);
}, 2000);

setTimeout(function() {
    sortList([1, 1, 1, 1, 1, 0]);
}, 4000);

// rankTable.append("thead")
//     .append("tr")
//     .selectAll("th")
//     .data(columns)
//     .enter()
//     .append("th")
//     .text(function(d) { return d; });






// var columns = ["이름", "정당", "당선#", "의안발의#", "가결#", "부결#"];
// var personTable = d3.select("#person");

// // table header
// personTable.append("thead")
//     .append("tr")
//     .selectAll("th")
//     .data(columns)
//     .enter()
//     .append("th")
//     .text(function(d) { return d; });

// personTable.selectAll("thead").select("tr").append("th").text("DEL");
// personTable.append("tbody");

// function addPerson(idList) {

//     // table body
//     d3.tsv("data/assembly_test.tsv", function(error, data) {
//         // FILTERING
//         data = data.filter(function(d) {
//             return idList.indexOf(Number(d['id'])) >= 0;
//         });

//         var rows = personTable.select("tbody")
//             .selectAll("tr")
//             .data(data);

//         rows.enter()
//             .append("tr")
//             .attr("id", function(d) { return "person" + d['id']; });

//         var cells = rows.selectAll('td')
//             .data(function(row) {
//                 return columns.map(function(column) {
//                     return { column: column, value: row[column] };
//                 });
//             });

//         cells.enter()
//             .append('td')
//             .style("opacity", "0.0")
//             .transition()
//             .delay(300)
//             .duration(300)
//             .style("opacity", "1.0")
//             .text(function(d) { return d.value; });

//         cells.exit()
//             .transition()
//             .delay(200)
//             .duration(500)
//             .style('opacity', 0.0)
//             .remove();

//         rows.append("td")
//             .append("button")
//             .text("X")
//             .on("click", function(d) {
//                 d3.event.stopPropagation();
//                 removePerson(d['id']);
//             })
//             .style("opacity", "0.0")
//             .transition()
//             .delay(300)
//             .duration(300)
//             .style("opacity", "1.0");

//         rows.on("click", function(d) { selectPerson(d['id']); });

//         rows.exit()
//             .transition()
//             .delay(200)
//             .duration(500)
//             .style('opacity', 0.0)
//             .remove();
//     });
// }

// function removePerson(id) {
//     d3.select("#person" + id).remove();
// }

// function selectPerson(id) {
//     alert(id);
// }

// function sortPersonList(conditions) {

// }



// addPerson([1, 2, 3, 4, 5, 6, 7, 8, 9]);
// setTimeout(function() {
//     addPerson([1, 2, 3, 4, 5, 6]);
// }, 2000);