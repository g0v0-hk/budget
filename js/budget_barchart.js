
var initBarchart = function(data, title, setting) {

    var this_setting = setting['barchart'];

    data = data.map(function(d) {
        return d / 100000.0;
    });

    var margin = {
        top: 0,
        right: 20,
        bottom: 30,
        left: 80
    },
    width = 600 - margin.left - margin.right,
            height = 280 - margin.top - margin.bottom;


    var start_year = 2005;

    var years = data.reduce(function(p, c, i, a) {
        p.push(start_year + i);
        return p;
    }, []);


    //var years = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];        
    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1).domain(years);

    var y = d3.scale.linear()
            .range([height, 0]).domain([0, 1.2 * d3.max(data, function(d) {
            return d;
        })]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function(d, i) {
//                if (years[i] == this_setting['revise_year'])
//                    return (d) + "/" + ("00" + (d - 2000 + 1)).slice(-2);
//                else if (years[i] > this_setting['revise_year'])
                    return (d - 1) + "/" + ("00" + (d - 2000)).slice(-2);
//                else
//                    return (d + 1) + "/" + ("00" + (d - 2000 + 2)).slice(-2);
            });

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);


    d3.select(setting['root_div'] + " .barchart_title").append("p").text(title + "-過往實際開支");

    var svg = d3.select(setting['root_div'] + " .barchart").append("svg")
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

//    yAxisPos
//    .append("text")
//    .attr("id", "mainylabel")
//    .attr("transform", "rotate(-90)")
//    .attr("y", -75)
//    .attr("x", -130)
//    .attr("dy", ".71em")
//    .style("text-anchor", "middle")
//    .text(this_setting['y_label'])
//  

    yAxisPos
            .append("text")
            .attr("id", "subylabel")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -150)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .text("億元")
            .attr("style", "");

    var bars = svg.selectAll(".bar")
            .data(data)
            .enter();

    bars.append("svg:rect")
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




    svg.selectAll(".bartext")
            .data(data)
            .enter().append("svg:text")
            .attr("class", "bartext")
            .attr("x", function(d, i) {
                if (years[i] == this_setting['revise_year'])
                    return x(years[i]) - 15;
                else if (years[i] > this_setting['revise_year'])
                    return x(years[i]) - 8;
                else
                    return 0;


            })
//.attr("dx", "0.0em")    
            .attr("y", function(d) {
                return y(d) - 5;
            })

            .text(function(d, i) {
                if (years[i] == this_setting['revise_year'])
                    return '（修訂預算）';
                else if (years[i] > this_setting['revise_year'])
                    return '（預算）';
                else
                    return ''
                            ;
            });


}

var cleanBarchart = function(setting) {
    d3.select(setting['root_div'] + " .barchart_title").html("");
    d3.select(setting['root_div'] + " .barchart").html("");
}



