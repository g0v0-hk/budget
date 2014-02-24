/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var formatNumber = function(n, decimals) {
    var s, remainder, num, negativePrefix, negativeSuffix, prefix, suffix;
    suffix = ""
    negativePrefix = ""
    negativeSuffix = ""
    if (n < 0) {
        negativePrefix = "";
        negativeSuffix = " in income"
        n = -n
    }
    ;

    if (n >= 10000000) {
        suffix = " （億元）"
        n = n / 100000
        decimals = 0
    } else if (n >= 100000) {
        suffix = " （億元）"
        n = n / 100000
        decimals = 1
    }


    prefix = ""
    if (decimals > 0) {
        if (n < 1) {
            prefix = "0"
        }
        ;
        s = String(Math.round(n * (Math.pow(10, decimals))));
        if (s < 10) {
            remainder = "0" + s.substr(s.length - (decimals), decimals);
            num = "";
        } else {
            remainder = s.substr(s.length - (decimals), decimals);
            num = s.substr(0, s.length - decimals);
        }


        return  negativePrefix + prefix + num.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + "." + remainder + suffix + negativeSuffix;
    } else {
        s = String(Math.round(n));
        s = s.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        return  negativePrefix + s + suffix + negativeSuffix;
    }
};



var fillColor = d3.scale.ordinal().domain([-3, -2, -1, 0, 1, 2, 3])
        .range(["#d84b2a", "#ee9586", "#e4b7b2", "#AAA", "#beccae", "#9caf84", "#7aa25c"]);
//.range(["#f70909", "#f58282","#f5c2c2","#AAA","#9ef6a8", "#43c05e", "#218b2d", "026b0e"]);
var strokeColor = d3.scale.ordinal().domain([-3, -2, -1, 0, 1, 2, 3]).range(["#c72d0a", "#e67761", "#d9a097", "#999", "#a7bb8f", "#7e965d", "#5a8731"]);




var categorizeChange = function(c) {

    if (isNaN(c)) {
        return 0;
    } else if (c < -0.25) {
        return -3;
    } else if (c < -0.05) {
        return -2;
    } else if (c < -0.001) {
        return -1;
    } else if (c <= 0.001) {
        return 0;
    } else if (c <= 0.05) {
        return 1;
    } else if (c <= 0.25) {
        return 2;
    } else {
        return 3;
    }

};

var getFillColor = function(d) {
    return fillColor(d.changeCategory);
};

var showTrend = function(node, setting) {
    initBarchart(node.trend, node.name, setting);

};


var initBubble = function(budgetdata, setting, check_depts) {

    var this_setting = setting['bubble'];


    var rScale = d3.scale.pow().exponent(this_setting["r_scale_exp"]).domain([0, 100000000]).range(this_setting['r_scale_range']);
    var radiusScale = function(n) {
        return rScale(Math.abs(n));
    };

    var nodes = [];
          

    // Builds the nodes data array from the original data
    for (var i = 0; i < budgetdata.length; i++) {
        var n = budgetdata[i];
        var dept_id = parseInt(n['id']);
        var out = {
            sid: dept_id,
            radius: radiusScale(n['last_value']),
            change: n['last_change'],
            changeCategory: categorizeChange(n['last_change']),
            value: n['last_value'],
            name: check_depts ? (getDepartment(dept_id))['zhname'] : n['name'],
            trend: n['trend'].split(',').map(function(x) {
                if (x === '')
                    return 0;
                else
                    return x;
            }),
            isNegative: (n['last_change'] < 0),
            x: Math.random() * 600,
            y: Math.random() * 600
        }

        if (isNaN(n['last_value']))
            alert(n['name']);

        nodes.push(out)
    }
    ;



    var w = this_setting["w"] - 30,
            h = this_setting["h"];



    var force = d3.layout.force()
            .gravity(this_setting['f_gravity'])
            .charge(function(d, i) {
                return -Math.pow(d.radius, this_setting['f_charge_exp']) / this_setting['f_charge_div'];
            })
            .nodes(nodes)
            .size([w, h]);



    force.start();

    var svg = d3.select(setting['root_div'] + " .bubble").append("svg:svg")
            .attr("width", w)
            .attr("height", h);

    svg.selectAll("circle")
            .data(nodes)
            .enter().append("svg:circle")
            .attr("r", function(d) {
                return d.radius;
            })
            .style("fill", function(d, i) {
                return getFillColor(d);
            });

    force.on("tick", function(e) {
        var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

        while (++i < n) {
            q.visit(collide(nodes[i]));
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
            .on("mouseover", function(d, i) {

                showTrend(d, setting);
                var el = d3.select(this)
                var xpos = Number(el.attr('cx')) + this_setting['tip_pos_xoff'];

                var a = parseFloat(el.attr('cy')),
                        b = this_setting['tip_pos_yoff'],
                        c = d.radius;



                var ypos = a + b;

                el.style("stroke", "#000").style("stroke-width", 3);
                d3.select("#g0v0-tooltip").style('top', ypos + "px").style('left', xpos + "px").style('display', 'block')
                        .classed('g0v0-plus', (d.changeCategory > 0))
                        .classed('g0v0-minus', (d.changeCategory < 0));
                d3.select("#g0v0-tooltip .g0v0-name").html(d.name)
                d3.select("#g0v0-tooltip .g0v0-value").html(formatNumber(d.value))

                var pctchngout = d.change
                if (d.change == "N.A.") {
                    pctchngout = "N.A."
                }
                ;
                d3.select("#g0v0-tooltip .g0v0-change").html(d3.format("+0.1%")(pctchngout))
            })
            .on("mouseout", function(d, i) {

                d3.select(this)
                        .style("stroke-width", 1)
                        .style("stroke", function(d) {
                            return strokeColor(d.changeCategory);
                        })
                d3.select("#g0v0-tooltip").style('display', 'none')
                cleanBarchart(setting);
            })

            ;

}



function collide(node) {
    var r = node.radius + 2,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
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