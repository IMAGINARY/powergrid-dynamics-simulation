// initialize parallel job
var simWorker = new Worker('simulator/simulation.js');

// ###############################################################################################################
// setup svg container and background

// set background



var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    };

var format= d3.format(",.2f");
var formatCount = d3.format(",.0f");

ratio = 622/879; 

height = this.innerHeight*0.75;

var imgUrl = "simulator/northern_grid/northern_landmass.svg";

// network container
d3.select("#centrepiece").selectAll("p").remove()
var svg = d3.select("#centrepiece")
    .append("svg")
    .attr("viewBox", "0 0 " + height * ratio + " " + height)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("width", height * ratio)
    .attr("height", height);
    //.style("border", "1px solid black");
    

// background image
var imgs = svg.append("svg:image")
                .attr("xlink:href", imgUrl)
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", height * ratio- margin.right)
                .attr("height", height - margin.bottom);

// scale max/min values for northern grid

var xScale = d3.scaleLinear()
                  .domain([498.0, 2774.0])
                  .range([margin.left * 1.2, (margin.left + height * ratio- margin.right)*0.9]);
var yScale = d3.scaleLinear()
                  .domain([0, 3395.0])
                  .range([margin.top*2.4, (margin.top + height - margin.bottom)*0.98]);

// ###############################################################################################################
// colors

//var color = d3.interpolateRgb.gamma(3)("#009fda", "#f25b28");
var color = d3.scalePow()
				.exponent(0.3)
				.domain([-Math.PI, 0, Math.PI]).clamp(true)
				.range(["#009fda", "white", "#f25b28"]);
rainbow = false;


function add_cbar() {
  cbar = {"val": [-Math.PI, -Math.PI/2, -Math.PI/10, 0, Math.PI/10, Math.PI/2, Math.PI], 
  "label": ["behind", "", "", "close", "", "", "advance"]} // -\u03C0

  w = 20

  var colorbar = svg.append("g")
                    .attr("class", "colorbar")
                    .attr("width", cbar.val.length * w)
                    .attr("height", 10)
                    .attr("transform", "translate(" + (margin.left + 20) + "," +  (margin.top + 10)  + ")"); 

  var patches =  colorbar.selectAll("rect")
                .data(cbar.val)
                .enter()
                .append("rect");

  var ticks =  colorbar.selectAll("text")
                .data(cbar.label)
                .enter()
                .append("text");

  patches
          .attr("x", function(d, i) { return i*w })
          .attr("y", 0)
          .attr("width", w )
          .attr("height", 10)
          .style("stroke", "black")
          .style("stroke-width", "1px")
          .style("fill", function(d) { return color(d) });

  ticks
          .attr("x", function(d, i) { return (0.5 + i) * w })
          .attr("y", 25)
          .style("text-anchor", "middle")
          .text(function(d) { return d });

  colorbar.append("text").attr("x", 0).attr("y", -10).text("relative clock position");
}

add_cbar()

// ###############################################################################################################
// add netmeter

var netmeter = svg.append("g")
                  .attr("class", "net-meter")
                  .attr("width", 100)
                  .attr("height", 100)
                  .attr("transform", "translate(" + (margin.left + height * ratio- margin.right - 120) + "," + (margin.top + height - margin.bottom - 120) + ")");

var bg = netmeter.append("circle")
                      .attr("r", 50)
                      .attr("cx", 50 )
                      .attr("cy", 50)    
                      .style("fill", "grey")
                      .style("stroke", "black")
                      .style("stroke-width", "1px");
                      

var normal = netmeter.append("line")
                        .style("stroke", "black")
                        .style("stroke-width", "2px")
                        .attr("x1", 50)
                        .attr("y1", 50)
                        .attr("x2", 50)
                        .attr("y2", 0);

var neg = netmeter.append("circle")
                      .attr("r", 5)
                      .attr("cx", 0)
                      .attr("cy",  50)    
                      .style("fill", "black");

var pos = netmeter.append("circle")
                      .attr("r", 5)
                      .attr("cx", 100)
                      .attr("cy",  50)    
                      .style("fill", "black");

var label = netmeter.append("text").attr("x", 20).attr("y", -10).attr("text-align", "center").text("50 Hz");
var label_bottom = netmeter.append("text").attr("x", 0).attr("y", 115).attr("text-align", "center").text("50 Hz");

var pointer = netmeter.append("line")
                        .style("stroke", "black")
                        .style("stroke-width", "4px")
                        .attr("x1", 50)
                        .attr("y1", 50)
                        .attr("x2", 50)
                        .attr("y2", 0);

// ###############################################################################################################
// fisheye distortion

enable_fisheye = false;

(function() {
  d3.fisheye = {
    scale: function(scaleType) {
      return d3_fisheye_scale(scaleType(), 3, 0);
    },
    circular: function() {
      var radius = 200,
          distortion = 2,
          k0,
          k1,
          focus = [0, 0];

      function fisheye(d) {
        var dx = d.x - focus[0],
            dy = d.y - focus[1],
            dd = Math.sqrt(dx * dx + dy * dy);
        if (!dd || dd >= radius) return {x: d.x, y: d.y, z: 1};
        var k = k0 * (1 - Math.exp(-dd * k1)) / dd * .75 + .25;
        return {x: focus[0] + dx * k, y: focus[1] + dy * k, z: Math.min(k, 10)};
      }

      function rescale() {
        k0 = Math.exp(distortion);
        k0 = k0 / (k0 - 1) * radius;
        k1 = distortion / radius;
        return fisheye;
      }

      fisheye.radius = function(_) {
        if (!arguments.length) return radius;
        radius = +_;
        return rescale();
      };

      fisheye.distortion = function(_) {
        if (!arguments.length) return distortion;
        distortion = +_;
        return rescale();
      };

      fisheye.focus = function(_) {
        if (!arguments.length) return focus;
        focus = _;
        return fisheye;
      };

      return rescale();
    }
  };

  function d3_fisheye_scale(scale, d, a) {

    function fisheye(_) {
      var x = scale(_),
          left = x < a,
          v,
          range = d3.extent(scale.range()),
          min = range[0],
          max = range[1],
          m = left ? a - min : max - a;
      if (m == 0) m = max - min;
      return (left ? -1 : 1) * m * (d + 1) / (d + (m / Math.abs(x - a))) + a;
    }

    fisheye.distortion = function(_) {
      if (!arguments.length) return d;
      d = +_;
      return fisheye;
    };

    fisheye.focus = function(_) {
      if (!arguments.length) return a;
      a = +_;
      return fisheye;
    };

    fisheye.copy = function() {
      return d3_fisheye_scale(scale.copy(), d, a);
    };

    fisheye.nice = scale.nice;
    fisheye.ticks = scale.ticks;
    fisheye.tickFormat = scale.tickFormat;
    return d3.rebind(fisheye, scale, "domain", "range");
  }
})();

var fisheye = d3.fisheye.circular().radius(200);

// ###############################################################################################################
// system setup

// dynamical variables
var frequency;
var avg = 0;
var phase;
var index;
var x;
var y;

var circleid = null;

// parameters
var base_frequency = 8.;
var	damp_modifier = 1.;

var pert = {x: 0.1 * Math.PI, y: 1};

// load the network and perform simulation
d3.json("simulator/northern_grid/northern.json", function(e, d) {simulate_graph(d)})

// ###############################################################################################################

function draw_graph(){

}

function simulate_graph(graph_loaded){

  graph = graph_loaded
  
  index = new Object()
  x = new Object()
  y = new Object()
  graph.nodes.forEach(function(node, i) {index[node.id] = i; x[i] = xScale(node.x); y[i] = yScale(node.y)})


  // create svg groups with node and link layouts
  var linkGroup = svg.append("g")
                    .attr("class", "links")
                    .style("stroke", "black")
                    .style("stroke-width", "5px");
                    

  var link = linkGroup.selectAll("line")
                        .data(graph.links)
                        .enter()
                        .append("line");

  link
      .attr("x1", function(d) { return x[index[d.source]] })
      .attr("y1", function(d) { return y[index[d.source]] })
      .attr("x2", function(d) { return x[index[d.target]] })
      .attr("y2", function(d) { return y[index[d.target]] });

  var nodeGroup = svg.append("g")
                .attr("class", "nodes")
                .attr("r", 20)
                .style("fill", "black")
                .style("stroke", "#686c70")
                .style("stroke-width", "1px")
                .style("cursor", "pointer");

  var node = nodeGroup.selectAll("circle")
                    .data(graph.nodes)
                    .enter()
                    .append("circle");

  node
       .attr("cx", function(d) { return x[index[d.id]] })
       .attr("cy", function(d) { return y[index[d.id]] });  

  node.on("click", clicked);             


  // send data and start sim
  resetNetwork()
  startSim() 

  radius = height / 150
  r20 = radius / 20

  // recieve data
  simWorker.onmessage = e => {
    frequency = e.data.frequency
    phase = e.data.phase

    avg = d3.mean(frequency)
    
    offset = 50. - base_frequency

    node
        .style("fill", function(d) { return color((phase[index[d.id]] + Math.PI) % ( 2*Math.PI) - Math.PI) })
        .attr("r", 
          function(d) {
            if(d.id == circleid){
              return 2 * radius + r20 * Math.abs(frequency[index[d.id]] - base_frequency)
            }
            else{
              return radius + r20 * Math.abs(frequency[index[d.id]] - base_frequency)
            }
          });
    
    link
       .style("stroke-width", function(d) { return 10 * Math.log(1.05 + Math.abs(Math.sin(phase[index[d.source]] - phase[index[d.target]]))) + "px" });


    var meterScale = d3.scaleLinear()
                            .clamp(true)
                            .domain([-10. + base_frequency, -0.2 + base_frequency,  base_frequency, 0.2 + base_frequency, 10. + base_frequency])
                            .range([0, Math.PI / 3, Math.PI / 2, 2 * Math.PI / 3, Math.PI])
                            .nice();

    pointer.attr("x2", 50 + 50 * Math.cos( Math.PI + meterScale(avg) )).attr("y2",  50 * (1 - Math.sin( meterScale(avg)) ));

    neg
      .attr("cx", 50 + 50 * Math.cos( Math.PI + meterScale(d3.min(frequency)) ) )
      .attr("cy",  50 * (1 - Math.sin( meterScale(d3.min(frequency))) ))    
      .style("fill", "red");

    pos
      .attr("cx", 50 + 50 * Math.cos( Math.PI + meterScale(d3.max(frequency)) ) )
      .attr("cy",  50 * (1 - Math.sin( meterScale(d3.max(frequency))) ))    
      .style("fill", "red");
    
    label.text(format(offset + avg) + " Hz");
    label_bottom.text("-/+: " + format(offset + d3.min(frequency)) + " / " + format(offset + d3.max(frequency)))

    if (enable_fisheye){
    svg.on("mousemove", function() {
        fisheye.focus(d3.mouse(this));

        node.each(function(d) { d.fisheye = fisheye({"x": x[index[d.id]], "y": y[index[d.id]]}); })
            .attr("cx", function(d) { return  d.fisheye.x; })
            .attr("cy", function(d) { return  d.fisheye.y; })
            .attr("r", function(d) { return  d.fisheye.z * 4.5; });

        link
            .attr("x1", function(d) { return fisheye({"x": x[index[d.source]], "y": y[index[d.source]]}).x; })
            .attr("y1", function(d) { return fisheye({"x": x[index[d.source]], "y": y[index[d.source]]}).y; })
            .attr("x2", function(d) { return fisheye({"x": x[index[d.target]], "y": y[index[d.target]]}).x; })
            .attr("y2", function(d) { return fisheye({"x": x[index[d.target]], "y": y[index[d.target]]}).y; });
      });   
  }

  }

}



// ###############################################################################################################
// Making the inputs do stuff

d3.select("#base_frequency").on("input", function() {
	base_frequency = 50. - +this.value
	setParameters()
});

d3.select("#damp_modifier").on("input", function() {
	damp_modifier = +this.value
	setParameters()
});

d3.select("#xpert_val").on("input", function() {
	pert.x = +this.value * Math.PI
});

d3.select("#ypert_val").on("input", function() {
	pert.y = +this.value	
});

// Utility function to reset the Network

function resetNetwork() {
  //damp_modifier = 1.
  data = {
    m_type: "network",
    graph: graph,
    base_frequency: base_frequency,
    damp_modifier: damp_modifier,
  };
  // document.getElementById("damp_modifier").value = damp_modifier

  // send data
  simWorker.postMessage(data)

}


function setParameters() {
  data = {
    m_type: "parameters",
    base_frequency: base_frequency,
    damp_modifier: damp_modifier,
  };
  // document.getElementById("base_frequency").value = 50. - base_frequency
  // document.getElementById("damp_modifier").value = damp_modifier
  // send data
  simWorker.postMessage(data)

}


function clicked(d) {
  data = {m_type: 'perturbation',
          node_id: d.id, 
          x: pert.x, 
          y: pert.y};
  // console.log(data)
  simWorker.postMessage(data)
}

function startSim() {
  data = {m_type: 'sim_on'}
  simWorker.postMessage(data)
}

function randomState() {
  data = {m_type: 'random',
          x: pert.x, 
          y: pert.y};
  simWorker.postMessage(data)
}

function stopSim() {
  data = {m_type: 'sim_off'}
  simWorker.postMessage(data)
}


//special perturbations

var nids = [87, 32, 35, 230]

var perts = {
  "strong": {
    x: 0.1 * Math.PI,
    y: 10
  },
  "weak": {
    x: 0.1 * Math.PI,
    y: 0.5
  }
}


function perturb(n, p) {
  data = {m_type: 'perturbation',
          node_id: nids[n], 
          x: perts[p].x, 
          y: perts[p].y};
  console.log(data)
  simWorker.postMessage(data)
}


function over(n) {
  circleid = nids[n]
  // Cause a redraw
  simWorker.postMessage({m_type: 'bounce'})
}

function out() {
  circleid = null
  // Cause a redraw
  simWorker.postMessage({m_type: 'bounce'})
}


function stableSystem() {
  damp_modifier = 20.
  setParameters()
}


function weakSystem() {
  damp_modifier = 0.2
  setParameters()
}


function toggleFisheye() {
  if (enable_fisheye) {
    enable_fisheye = false
    fisheye = null
  }
  else
  {
    enable_fisheye = true
    fisheye = d3.fisheye.circular().radius(200);
  }
}

function toggleColor() {
	if (rainbow) {
		rainbow = false
		color = d3.scalePow()
        .exponent(0.3)
        .domain([-Math.PI, 0, Math.PI]).clamp(true)
        .range(["#009fda", "white", "#f25b28"]);
	}
	else
	{
		rainbow = true
		color = d3.scaleSequential(d3.interpolateRainbow)
    add_cbar()
	}
}

