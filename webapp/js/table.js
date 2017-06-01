function addPerson(id) {
    var personTable = d3.select("#person");
    console.log(personTable);
    d3.tsv("data/assembly_test.tsv", function(error, data) {
        // data.forEach(function insertData(tuple) {
        var tr = personTable.select("tbody")
            .data(data)
            .enter()
            .append("tr")
console.log(Object.keys(data[0]));
        tr.append("td").html(function td(d) {return d;});
        tr.append("td").html("aa");
        tr.append("td").html("aa");
        tr.append("td").html("aa");
        tr.append("td").html("aa");

        // console.log(tuple    );
        // });
    });
}

function removePerson(id) {

}

function selectPerson(id) {

}

function sortPersonList(contidions) {

}



addPerson();