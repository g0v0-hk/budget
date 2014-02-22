
var initBarchart = function(data) {
    
    data = data.map(function (d) {return d/1000000.0;});
    
    var margin = {
        top: 50, 
        right: 20, 
        bottom: 30, 
        left: 80
    },
    width = 600- margin.left - margin.right ,
    height = 400 - margin.top - margin.bottom;
    
    var years = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];        
    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1).domain(years);
    
    var y = d3.scale.linear()
    .range([height, 0]).domain([0, d3.max(data, function(d){return d;})]);
    
    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);
   
               
    var svg = d3.select("#barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("svg:g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    
   
    
    
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    var yAxisPos = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
    
    yAxisPos
    .append("text")
    .attr("id", "mainylabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -75)
    .attr("x", -130)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("財政支出")
  
    
     yAxisPos
    .append("text")
    .attr("id", "subylabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -170)
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("(million HKD)")
    .attr("style", "");
    
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
  
    
}

var cleanBarchart = function () {
     var svg = d3.select("#barchart").html("");
}



