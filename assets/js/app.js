var values = [];
var columns = ["name", "grade"];

var addButton = d3.select("button[name=add]");
addButton.on("click", function() {
    d3.event.preventDefault();
    var name = d3.select("input[name=name]").property("value");
    var grade = d3.select("input[name=grade]").property("value");
    console.log("name: " + name + " grade: " + grade);
    values.push({name: name, grade: grade});
    redraw(values);
    tabulate(values, columns);
});

var curveButton = d3.select("button[name=curve]");
curveButton.on("click", function() {
    d3.event.preventDefault();
    var mean = d3.mean(values, function(d) { return d.grade; });
    console.log("mean: " + mean);
    var diff = 68.0 - mean;
    if (diff > 0) {
        values = values.map(function(d) 
            {return {name: d.name, grade: parseFloat(d.grade)+parseFloat(diff) }});
        redraw(values);
        updateTableData(values);
    }
});


// A formatter for counts.
var formatCount = d3.format(",.0f");

var margin = {top: 10, right: 20, bottom: 60, left: 20},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .value(function(d) { return d.grade; })
    .bins(x.ticks(20))
    (values);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = svg.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(data[0].dx) - 1)
    .attr("height", function(d) { return height - y(d.y); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", x(data[0].dx) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

function redraw(values) {
    data = d3.layout.histogram()
    .value(function(d) { return d.grade; })
    .bins(x.ticks(20))
    (values);

    var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

    d3.selectAll(".bar")
      .data(data)
      .transition()
      .duration(500)
      .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

    d3.selectAll("rect")
        .data(data)
        .transition()
        .duration(500)
        .attr("height", function(d) { return (height - y(d.y));})
        //.attr("y", function(d) { return y(d.y); });


    d3.selectAll("text")
        .data(data)
        .text(function(d) { return formatCount(d.y); });
}

function tabulate(data, columns) {
    var tableSelect = d3.select("table");
    var tableDNE = tableSelect.empty();
    if (tableDNE) {
    var table = d3.select("#table").append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

        table.attr("class", "table");

        thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; });
    } else {
        var table = tableSelect,
            thead = table.select("thead"),
            tbody = table.select("tbody");
    }

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]}
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; });

    return table;
}

function updateTableData(values) {
    tbody = d3.select("tbody")

    var rows = tbody.selectAll("tr")
        .data(values);

    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]}
            })
        })
        .text(function(d) {return d.value;});
}

