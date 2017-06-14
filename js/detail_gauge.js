function drawGaugeChart(idList) {
    for (var i = 0; i < idList.length; i++) {
        var inclination = 0;
        for (var fi = 0; fi < masterData.length; fi++) {
            if (+masterData[fi].id === +idList[i]) {
                inclination = masterData[fi].progressive * 20;
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
                                return "conservative";
                            } else if(value > 40 && value < 80){
                                return "neutral";
                            } else {
                                return "progressive";
                            }
                        }
                    }
                },
                color: {
                    pattern: ["#a50f15"], // the three color levels for the percentage values.
                    threshold: {
                        //            unit: 'value', // percentage is default
                        //            max: 200, // 100 is default
                        values: [0]
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