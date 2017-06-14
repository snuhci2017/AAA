function drawGaugeChart(idList) {
    for (var i = 0; i < idList.length; i++) {
        var inclination = 0;
        for (var fi = 0; fi < masterData.length; fi++) {
            if (+masterData[fi].id === +idList[i]) {
                inclination = masterData[fi].conservative * 20;
            }
        }
        if (inclination > 40) {
            c3.generate({
                bindto: "#gaugeChart" + (i + 1).toString(),
                data: {
                    columns: [
                        ['cons. tendency', inclination]
                    ],
                    type: 'gauge',
                    onclick: function(d, i) {},
                    onmouseover: function(d, i) {},
                    onmouseout: function(d, i) {}
                },
                gauge: {
                    label: {
                        format: function(value, ratio) {
                            return "conservative";
                        }
                    }
                },
                color: {
                    pattern: ["#6baed6", "#3182bd", "#08519c"], // the three color levels for the percentage values.
                    threshold: {
                        //            unit: 'value', // percentage is default
                        //            max: 200, // 100 is default
                        values: [61, 81, 99]
                    }
                },
                size: {
                    width: 200,
                    height: 100
                }
            });
        } else {
            inclination = 100 - inclination;
            c3.generate({
                bindto: "#gaugeChart" + (i + 1).toString(),
                data: {
                    columns: [
                        ['prog. tendency', inclination]
                    ],
                    type: 'gauge',
                    onclick: function(d, i) {},
                    onmouseover: function(d, i) {},
                    onmouseout: function(d, i) {}
                },
                gauge: {
                    label: {
                        format: function(value, ratio) {
                            return "progressive";
                        }
                    }
                },
                color: {
                    pattern: ["#fb6a4a", "#de2d26", "#a50f15"], // the three color levels for the percentage values.
                    threshold: {
                        //            unit: 'value', // percentage is default
                        //            max: 200, // 100 is default
                        values: [61, 81, 99]
                    }
                },
                size: {
                    width: 200,
                    height: 100
                }
            });
        }
    }
}