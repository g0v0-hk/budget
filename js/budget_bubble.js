/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var formatNumber = function(n,decimals) {
    var s, remainder, num, negativePrefix, negativeSuffix, prefix, suffix;
    suffix = ""
    negativePrefix = ""
    negativeSuffix = ""
    if (n < 0) {
        negativePrefix = "";
        negativeSuffix = " in income"
        n = -n
    };
    
    if (n >= 1000000000000) {
        suffix = " trillion"
        n = n / 1000000000000
        decimals = 2
    } else if (n >= 1000000000) {
        suffix = " billion"
        n = n / 1000000000
        decimals = 1
    } else if (n >= 1000000) {
        suffix = " million"
        n = n / 1000000
        decimals = 1
    } 
    
    
    prefix = ""
    if (decimals > 0) {
        if (n<1) {
            prefix = "0"
        };
        s = String(Math.round(n * (Math.pow(10,decimals))));
        if (s < 10) {
            remainder = "0" + s.substr(s.length-(decimals),decimals);
            num = "";
        } else{
            remainder = s.substr(s.length-(decimals),decimals);
            num = s.substr(0,s.length - decimals);
        }
        
        
        return  negativePrefix + prefix + num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + remainder + suffix + negativeSuffix;
    } else {
        s = String(Math.round(n));
        s = s.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        return  negativePrefix + s + suffix + negativeSuffix;
    }
};

var rScale = d3.scale.pow().exponent(0.5).domain([0,100000000]).range([1,90]);
var radiusScale = function(n){
    return rScale(Math.abs(n));
};

var fillColor = d3.scale.ordinal().domain([-3,-2,-1,0,1,2,3]).range(["#d84b2a", "#ee9586","#e4b7b2","#AAA","#beccae", "#9caf84", "#7aa25c"]);
var strokeColor = d3.scale.ordinal().domain([-3,-2,-1,0,1,2,3]).range(["#c72d0a", "#e67761","#d9a097","#999","#a7bb8f", "#7e965d", "#5a8731"]);


var categorizeChange = function(c){
    if (isNaN(c)) {
        return 0;
    } else if ( c < -0.25) {
        return -3;
    } else if ( c < -0.05){
        return -2;
    } else if ( c < -0.001){
        return -1;
    } else if ( c <= 0.001){
        return 0;
    } else if ( c <= 0.05){
        return 1;
    } else if ( c <= 0.25){
        return 2;
    } else {
        return 3;
    }
};

var getFillColor = function(d){
    //        if (d.isNegative) {
    //          return "#fff"
    //        }
    return fillColor(d.changeCategory);
};

var showTrend = function (node) {    
    initBarchart(node.trend);

};


var initBubble = function(budgetdata) {
    var nodes = [],  
        color = d3.scale.category10();

    // Builds the nodes data array from the original data
    for (var i=0; i < budgetdata.length; i++) {
        var n = budgetdata[i];
        var out = {
            sid: n['id'],
            radius: radiusScale(n['year']),            
            change: n['change'],
            changeCategory: categorizeChange(n['change']),
            value: n['year'],
            name: n['name'],
            trend : n['years'].split(',').map(function (x) {
                if ( x === '') return 0; else return x;
            }),
            isNegative: (n['change'] < 0),
            //positions: n.positions,
            x:Math.random() * 1000,
            y:Math.random() * 1000
        }
        
        if (isNaN(n['year']))
            alert(n['name']);

        nodes.push(out)
    };

    var w = 500,
        h = 450;



    var force = d3.layout.force()
    .gravity(0.05)
    .charge(function(d, i) {
        return - Math.pow(d.radius, 1.9) / 8
    })
    .nodes(nodes)
    .size([w, h]);

    var root = nodes[0];
    //root.radius = 0;
    root.fixed = true;

    force.start();

    var svg = d3.select("#bubble").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

    svg.selectAll("circle")
    .data(nodes)
    .enter().append("svg:circle")
    .attr("r", function(d) {
        return d.radius ;
    })
    .style("fill", function(d, i) {
        return getFillColor(d);
    });

    force.on("tick", function(e) {
        var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;

        while (++i < n) {
            q.visit(collide(nodes[i], root));
        }

        svg.selectAll("circle")
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        });
    });
    
   
        
    svg.selectAll("circle")
    .on("mouseover",function(d,i) {         
        
        showTrend(d);        
        var el = d3.select(this)
        var xpos = Number(el.attr('cx')) +100
        var ypos = (el.attr('cy') - d.radius + 50) +20
        
             
        el.style("stroke","#000").style("stroke-width",3);
        d3.select("#nytg-tooltip").style('top',ypos+"px").style('left',xpos+"px").style('display','block')
        .classed('nytg-plus', (d.changeCategory > 0))
        .classed('nytg-minus', (d.changeCategory < 0));
        d3.select("#nytg-tooltip .nytg-name").html(d.name)   
        d3.select("#nytg-tooltip .nytg-value").html("HKD "+formatNumber(d.value))
          
        var pctchngout = d.change
        if (d.change == "N.A.") {
            pctchngout = "N.A."
        };
        d3.select("#nytg-tooltip .nytg-change").html(d3.format("+0.1%")(pctchngout) )
    })
    .on("mouseout",function(d,i) { 
       
        d3.select(this)
        .style("stroke-width",1)
        .style("stroke", function(d){
            return strokeColor(d.changeCategory);
        })
        d3.select("#nytg-tooltip").style('display','none')
        cleanBarchart();
    })
    
    ;

}





//svg.on("mousemove", function() {
//  var p1 = d3.svg.mouse(this);
//  root.px = p1[0]; root.py = p1[1];
//  force.resume();
//});





function collide(node, root) {
    var r = node.radius + 2,
    nx1 = node.x - r,
    nx2 = node.x + r,
    ny1 = node.y - r,
    ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        var x_root = node.x - root.x,
        y_root = node.y -root.y,
        l_root = Math.sqrt(x_root * x_root + y_root * y_root);
           
      
        if ( quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .2;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1;
    };
}