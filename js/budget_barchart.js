
var initBarchart = function(data) {
    var margin = {
        top: 20, 
        right: 20, 
        bottom: 30, 
        left: 40
    },
    width = 300- margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;
    
    var years = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    
    console.log(d3.max(data, function(d){return d;}));
    
    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1).domain(years);
    
    var y = d3.scale.linear()
    .range([height, 0]).domain([0, d3.max(data, function(d){return d;})]);
    
//    var xAxis = d3.svg.axis()
//    .scale(x)
//    .orient("bottom");
//
//    var yAxis = d3.svg.axis()
//    .scale(y)
//    .orient("left")
//    .ticks(10, "%");
    
    var svg = d3.select("#barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("svg:g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    
   
    
    
//    svg.append("g")
//    .attr("class", "x axis")
//    .attr("transform", "translate(0," + height + ")")
//    .call(xAxis);
//
//    svg.append("g")
//    .attr("class", "y axis")
//    .call(yAxis)
//    .append("text")
//    .attr("transform", "rotate(-90)")
//    .attr("y", 6)
//    .attr("dy", ".71em")
//    .style("text-anchor", "end")
//    .text("Expenditure");
    
    svg.selectAll(".bar")
    .data(data)
    .enter().append("svg:rect")
    .attr("class", "bar")
    .attr("x", function(d, i) {
        return x(years[i]);
    })
    .attr("width", x.rangeBand())
    .attr("y", function(d) {
        return y(d);
    })
    .attr("height", function(d) {
        return height - y(d);
    })
    .attr("style", function(d) {return "fill:rgb(0,255,0);"});
    
}



