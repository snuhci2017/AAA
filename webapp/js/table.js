var columns = ["이름", "정당", "당선#", "의안발의#", "가결#", "부결#"];
var personTable = d3.select("#person");

// table header
personTable.append("thead")
    .append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(d) { return d; });

personTable.selectAll("thead").select("tr").append("th").text("DEL");
personTable.append("tbody");

function addPerson(idList) {

    // table body
    d3.tsv("data/assembly_test.tsv", function(error, data) {
        // FILTERING
        data = data.filter(function(d) {
            return idList.indexOf(Number(d['id'])) >= 0;
        });

        var rows = personTable.select("tbody")
            .selectAll("tr")
            .data(data);

        rows.enter()
            .append("tr")
            .attr("id", function(d) { return "person" + d['id']; });

        var cells = rows.selectAll('td')
            .data(function(row) {
                return columns.map(function(column) {
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

        cells.exit()
            .transition()
            .delay(200)
            .duration(500)
            .style('opacity', 0.0)
            .remove();

        rows.append("td")
            .append("button")
            .text("X")
            .on("click", function(d) {
                d3.event.stopPropagation();
                removePerson(d['id']);
            })
            .style("opacity", "0.0")
            .transition()
            .delay(300)
            .duration(300)
            .style("opacity", "1.0");

        rows.on("click", function(d) { selectPerson(d['id']); });

        rows.exit()
            .transition()
            .delay(200)
            .duration(500)
            .style('opacity', 0.0)
            .remove();
    });
}

function removePerson(id) {
    d3.select("#person" + id).remove();
}

function selectPerson(id) {
    alert(id);
}

function sortPersonList(conditions) {

}



addPerson([1, 2, 3, 4, 5, 6, 7, 8, 9]);
setTimeout(function() {
addPerson([1, 2, 3, 4, 5, 6]);    
}, 2000);
