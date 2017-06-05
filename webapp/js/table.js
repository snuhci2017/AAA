function addPerson(idList) {
    var columns = ["이름", "정당", "당선#", "의안발의#", "가결#", "부결#"];
    var personTable = d3.select("#person");

    // table header
    personTable.append("thead")
        .append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (d) {return d;});
    
    personTable.selectAll("thead").select("tr").append("th").text("DEL");

    // table body
    d3.tsv("data/assembly_test.tsv", function(error, data) {
        // FILTERING
        data = data.filter(function (d) {
            return idList.indexOf(Number(d['id'])) >= 0;
        });

        var rows = personTable.append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
                .attr("id", function (d) { return "person" + d['id'];})

   		var cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
                .text(function (d) { return d.value; });
        
        rows.append("td")
            .append("button")
            .text("X")
            .on("click", function(d) {
                d3.event.stopPropagation();
                removePerson(d['id']);
            });
        
        rows.on("click", function(d) { selectPerson(d['id']); });
    });
}

function removePerson(id) {
    d3.select("#person" + id).remove();
}

function selectPerson(id) {
    alert(id);
}

function sortPersonList(contidions) {

}



addPerson([1,2,3]);