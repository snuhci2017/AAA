(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['d3'], factory);
  } else if (typeof exports === 'object') {
    if (process.browser) {
      // Browserify. Import css too using cssify.
      require('./d3.slider.css');
    }
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('d3'));
  } else {
    // Browser globals (root is window)
    root.d3.slider = factory(root.d3);
  }
}(this, function (d3) {
return function module() {
  "use strict";

var min = 0,
      max = 100,
      step = 0.01,
      animate = true,
      orientation = "horizontal",
      axis = false,
      margin = 50,
      value,
      active = 1,
      snap = false,
      scale;

var axisScale,
      dispatch = d3.dispatch("slide", "slideend"),
      formatPercent = d3.format(".2%"),
      tickFormat = d3.time.format("%Y/%m/%d"),
      handle1,
      handle2 = null,
      divRange,
      sliderLength;

function slider(selection){
    selection.each(function() {
        min = value[0];
        max = value[1];
        if (!scale) {
            scale = d3.time.scale().domain([min, max]);
        }

        value = value || scale.domain()[0];

        var div = d3.select(this).classed("d3-slider d3-slider-" + orientation, true);

        var drag = d3.behavior.drag();
        drag.on('dragend', function () {
            dispatch.slideend(d3.event, value);
        })
        
        handle1 = div.append("a")
        .classed("d3-slider-handle", true)
        .attr("xlink:href", "#")
        .attr("id", "handle1")
        .on("click", stopPropagation)
        .call(drag);
        
        handle2 = div.append("a")
        .classed("d3-slider-handle", true)
        .attr("xlink:href", "#")
        .attr("id", "handle2")
        .on("click", stopPropagation)
        .call(drag);

        div.on("click", onClickHorizontal);

        divRange = d3.select(this).append('div').classed("d3-slider-range", true);

        handle1.style("left", formatPercent(scale(value[0])));
        divRange.style("left", formatPercent(scale(value[0])));
        drag.on("drag", onDragHorizontal);

        var width = 100 - parseFloat(formatPercent(scale(value[1])));
        handle2.style("left", formatPercent(scale(value[1])));
        divRange.style("right", width+'%');
        drag.on("drag", onDragHorizontal);

        sliderLength = parseInt(div.style("width"), 10);

        if (axis){
            createAxis(div);
        }

        function createAxis(dom) {
            if (typeof axis === "boolean") {
                axis = d3.svg.axis()
                .ticks(Math.round(sliderLength / 100))
                .tickFormat(tickFormat);
            }
            axisScale = scale.copy().range([0, sliderLength]);
            axis.scale(axisScale);

            var svg = dom.append("svg")
            .classed("d3-slider-axis d3-slider-axis-" + axis.orient(), true)
            .on("click", stopPropagation);

            var g = svg.append("g");
            
            svg.style("margin-left", -margin + "px");

            svg.attr({
                width: sliderLength + margin * 2,
                height: margin
            });

            if (axis.orient() === "top") {
            svg.style("top", -margin + "px");
            g.attr("transform", "translate(" + margin + "," + margin + ")");
            } else {
            g.attr("transform", "translate(" + margin + ",0)");
            }

            g.call(axis);
        }

        function onClickHorizontal() {
            if (toType(value) != "array") {
                var pos = Math.max(0, Math.min(sliderLength, d3.event.offsetX || d3.event.layerX));
                moveHandle(scale.invert ? stepValue(scale.invert(pos/sliderLength)) : nearestTick(pos/sliderLength));
            }
        }

        function onDragHorizontal() {
            if (d3.event.sourceEvent.target.id === "handle1") {
                active = 1;
            } else if (d3.event.sourceEvent.target.id === "handle2") {
                active = 2;
            }
            var pos = Math.max(0, Math.min(sliderLength, d3.event.x));
            moveHandle(scale.invert ? stepValue(scale.invert(pos/sliderLength)) : nearestTick(pos/sliderLength));
        }

        function stopPropagation(){
            d3.event.stopPropagation();
        }
   });
}

        function moveHandle(newValue) {
            var currentValue = toType(value) == "array" && value.length == 2 ? value[active - 1]: value,
            oldpos = formatPercent(scale(stepValue(currentValue))),
            newpos = formatPercent(scale(stepValue(newValue))),
            position = (orientation === "horizontal") ? "left" : "bottom";

            if (oldpos !== newpos) {
                value[active - 1] = newValue;
                if (d3.event) {
                    dispatch.slide(d3.event, value);
                };
                if(value[0] >= value[1]) return;
                if(active === 1){
                    if (toType(value) == "array" && value.length == 2){
                        (position === "left") ? divRange.style("left", newpos) : divRange.style("bottom", newpos);
                    }
                    if (animate){
                        handle1.transition()
                        .styleTween(position, function(){ return d3.interpolate(oldpos, newpos);})
                        .duration((typeof animate === "number") ? animate : 250);
                    } else {
                        handle1.style(position, newpos);
                    }
                } else {
                    var width = 100 - parseFloat(newpos);
                    var top = 100 - parseFloat(newpos);
                    (position === "left") ? divRange.style("right", width + "%") : divRange.style("top". top + "%");

                    if (animate) {
                        handle2.transition()
                        .styleTween(position, function(){ return d3.interpolate(oldpos, newpos);})
                        .duration((typeof animate === "number") ? animate : 250);
                    } else {
                        handle2.style(position, newpos);
                    }
                }
            }
        }

        function stepValue(val) {
            if (val === scale.domain()[0] || val === scale.domain()[1]){
                return val;
            }

            var alignValue = val;
            if (snap) {
                alignValue = nearestTick(scale(val));
            } else{
                var valModStep = (val - scale.domain()[0]) % step;
                alignValue = val - valModStep;

                if(Math.abs(valModStep) * 2 >= step){
                    alignValue += (valModStep > 0) ? step : -step;
                }
            };
            return alignValue;
        }

        function nearestTick(pos) {
            var ticks = scale.ticks ? scale.ticks() : scale.domain();
            var dist = ticks.map(function(d){return pos - scale(d);});
            var i = -1, index = 0, r = scale.ticks ? scale.range()[1] : scale.rangeExtent()[1];
            do {
                i++;
                if (Math.abs(dist[i] < r)){
                    r = Math.abs(dist[i]);
                    index = i;
                };
            } while (dist[i] > 0 && i < dist.length - 1);

            return ticks[index];
        };

        function toType(v) {
        return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };
    
    // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  };

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  };

  slider.step = function(_) {
    if (!arguments.length) return step;
    step = _;
    return slider;
  };

  slider.animate = function(_) {
    if (!arguments.length) return animate;
    animate = _;
    return slider;
  };

  slider.orientation = function(_) {
    if (!arguments.length) return orientation;
    orientation = _;
    return slider;
  };

  slider.axis = function(_) {
    if (!arguments.length) return axis;
    axis = _;
    return slider;
  };

  slider.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return slider;
  };

  slider.value = function(_) {
    if (!arguments.length) return value;
    if (value) {
      moveHandle(stepValue(_));
    };
    value = _;
    return slider;
  };

  slider.snap = function(_) {
    if (!arguments.length) return snap;
    snap = _;
    return slider;
  };

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  };
    
        d3.rebind(slider, dispatch, "on");

        return slider;
}
}));

