function drawGaugeChart(idList) {
    for (var i = 0; i < idList.length; i++) {
        var inclination = 0;
        for (var fi = 0; fi < masterData.length; fi++) {
            if (+masterData[fi].id === +idList[i]) {
                inclination = masterData[fi].progressive * 20; // Find progressive tendency from master table
            }
        }
            c3.generate({
                bindto: "#gaugeChart" + (i + 1).toString(),
                data: {
                    columns: [
                        ['cons. tendency', inclination]
                    ],
                    type: 'gauge',
                },
                gauge: {
                    label: {
                        format: function(value, ratio) {
                            if(value > 0 && value < 41){
                                return "conservative"; // If progressive tendency is between 0 and 40, conservative
                            } else if(value > 40 && value < 80){
                                return "neutral"; // If progressive tendency is between 40 and 80, neutral
                            } else {
                                return "progressive"; // If progressive tendency is over 80, progressive
                            }
                        }
                    }
                },
                color: {
                    pattern: ["#fb6a4a"], // Red color for progressive tendency
                    threshold: {
                        values: [0] // No threshold used
                    }
                },
                size: {
                    width: 200,
                    height: 100
                }
            });
    }
    d3.selectAll(".c3-chart-arcs-gauge-min").remove();
    d3.selectAll(".c3-chart-arcs-gauge-max").remove();
}