'use-strict';

// path to where the csv data is located
let dataPath = "./data/barData.csv";

// margin of the chart
let margin = { top: 50, left: 70, bottom: 20, right: 10 };

// axes length;
let width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

let xFeature = "year";
let yFeature = "avg_views";

// populates options on load
window.onload = function () {
  svgContainer = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  d3.csv(dataPath)
    .then(data => drawPlot(data, xFeature, yFeature));
}

// draws the plot
function drawPlot(data, xFeature, yFeature) {
  let limits = getMinMax(data, yFeature);
  let scaleValues = drawAxes(data, limits, xFeature);
  drawLabels();
  let tooltip = drawBars(data, scaleValues, xFeature, yFeature);
  drawHorizontalLine(limits, scaleValues, tooltip);
}

function drawBars(data, scaleValues, xFeature, yFeature) {
  // mapping functions
  let x = scaleValues.xScale;
  let y = scaleValues.yScale;

  // make tooltip
  let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // append data to SVG and plot as points
  svgContainer.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d[xFeature]) + 1)
    .attr('y', d => y(d[yFeature]))
    .attr('width', 25)
    .attr('height', d => height - y(d[yFeature]))
    .attr('fill', (d) => {
      if (d['Data'] == "Actual") {
        return "steelblue";
      } else {
        return "gray"
      }
    })
    .on("mousemove", (d) => {
      tooltip.transition()
        .duration(10)
        .style("opacity", 1);
      tooltip.html(
        "Season #" + d["Season"] + "<br/>" +
        "Year: " + d[xFeature] + "<br/>" +
        "Episodes: " + d['num_episodes'] + "<br/>" +
        "Average Viewers (millions): " + (Math.round(d[yFeature] * 10) / 10) + "<br/>" + "<br/>" +
        "Most Watched Episode: " + d['most_viewed_title'] + "<br/>" +
        "Viewers (millions): " + d['max_views'] + "<br/>")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition()
        .style("opacity", 0);
    });
    return tooltip;
}

// draws mean line
function drawHorizontalLine(limits, scaleValues, tooltip) {
  let y = scaleValues.yScale;
  svgContainer.append("g")
    .attr("transform", "translate(0, " + y(limits.mean) + ")")
    .attr("class", "horizontal")
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width)
    .style("stroke-dasharray", ("10, 3"))
    .style("stroke", "black")
    .style("stroke-width", "3px")
    .on("mousemove", () => {
      tooltip.transition()
        .duration(10)
        .style("opacity", 1);
      tooltip.html("Overall Average = " + (Math.round(limits.mean * 10) / 10))
      .style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY + 10) + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition()
        .style("opacity", 0);
    });
}

// draws the x axis and y axis labels
function drawLabels() {
  // x axis label
  svgContainer.append("text")
    .attr("transform", "translate(" + ((width + margin.left) / 2) + " ," + (height + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

  // y axis label
  svgContainer.append("text")
    .attr("y", 15)
    .attr("x", - (margin.top + height) / 2)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Average Viewers (millions)");
}

// draws the chart axes
function drawAxes(data, limits, xFeature) {
  // defining the x axis
  let xScale = d3.scaleBand()
    .domain(data.map(function (d) { return d[xFeature] }))
    .range([margin.left, width]);
  let xAxis = d3.axisBottom(xScale);

  // appending the x axis
  svgContainer.append("g")
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis);

  // defining the y axis
  let yScale = d3.scaleLinear()
    .domain([0, limits.yMax]).nice()
    .range([height, margin.top]);
  let yAxis = d3.axisLeft(yScale);

  // appending the y axis
  svgContainer.append("g")
    .attr('transform', 'translate(' + margin.left + ', 0)')
    .call(yAxis);

  // returns scale values
  return {
    xScale: xScale,
    yScale: yScale,
  };
}

// get min and max values from data
function getMinMax(data, yFeature) {
  let yMax = Number.MIN_VALUE;
  let mean = 0;

  for (i = 0; i < data.length; i++) {
    let k = data[i];
    yMax = Math.ceil(Math.max(k[yFeature], yMax) * 20) / 20;
    mean += +k[yFeature];
  }

  mean /= data.length;

  return {
    mean: mean,
    yMax: yMax
  }
}