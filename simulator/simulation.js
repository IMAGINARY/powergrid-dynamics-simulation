var graph = null
var simulation_running = false
var simulation = null

// dynamical variables
var frequency;
var phase;
var temp_frequency;
var index;

// parameters
var speed_val = null,
	damp_val = null;

var euler_step = 0.01;

// perturbations
var pert = {x: null, y: null};

var buffer1, buffer2, buffer3, buffer4;

// ###############################################################################################################
// handle simulation events

onmessage = function(e) {
	switch (e.data.m_type){
		case 'network':
			graph = e.data.graph
			speed_val = e.data.speed_val
			damp_val = e.data.damp_val
			pert = e.data.pert
			initialize_simulation(graph)
			break
		case 'parameters':
			speed_val = e.data.speed_val
			damp_val = e.data.damp_val
			pert = e.data.pert
			break
		case 'sim_on':
			start_simulation(euler_step)
			break
		case 'sim_off':
			stop_simulation()
			break
		case 'perturbation':
			perturb_simulation(e.data.perturbation)
			break
	    case 'random':
	      	random_state()
	      	break
	}
}

function initialize_simulation(g) {
  	buffer1 = new ArrayBuffer(graph.nodes.length * 8);
  	buffer2 = new ArrayBuffer(graph.nodes.length * 8);

  	frequency = new Float64Array(buffer1)
  	phase = new Float64Array(buffer2)

  	index = new Object()
  	graph.nodes.forEach(function(node, i) {index[node.id] = i})

  	// set initial frequencies
  	graph.nodes.forEach(function(node, i) {frequency[i] = speed_val * 10})
  	// set initial phases
	graph.nodes.forEach(function(node, i) {phase[i] = node.fixed_point})
	// start_simulation(euler_step)
}

function start_simulation(step){
	if (simulation_running) {}
	else {
		simulation = setInterval(function () {  
		//    [phase, frequency] = EulerStep(phase, frequency, step)
	    [phase, frequency] = RK4Step(phase, frequency, step)
	        output = {"frequency": frequency, "phase": phase};
	        postMessage(output)
		}, 50)

		simulation_running = true
	}
}

function stop_simulation(){
	if (simulation) {
		clearInterval(simulation)
		simulation_running = false
	}	
}

function perturb_simulation(perturbation){
	if (simulation) {
		frequency[index[perturbation]] += pert.y; // 2. * (0.5 - Math.random()) *;
		phase[index[perturbation]] += pert.x; //2. * (0.5 - Math.random());
	}	
  output = {"frequency": frequency, "phase": phase};
  postMessage(output)

}


function random_state(perturbation){
  if (simulation) graph.nodes.forEach(function(node, i) {
    frequency[i] += 2. * (0.5 - Math.random()) * pert.y;
    phase[i] += 2. * (0.5 - Math.random()) * pert.x;
  })
  output = {"frequency": frequency, "phase": phase};
  postMessage(output)

}

// ###############################################################################################################
// rhs function and numerical integration

function odefunc(x,v) { 
	buffer3 = new ArrayBuffer(graph.nodes.length * 8);
  	temp_frequency = new Float64Array(buffer3);

    graph.nodes.forEach(function(node, i) {
			temp_frequency[i] = speed_val*damp_val + node.input_power - damp_val * node.damping * v[i]
        });


    graph.links.forEach(function(link, k){
          temp_frequency[index[link.source]] -= link.coupling * Math.sin(x[index[link.source]] - x[index[link.target]]);
          temp_frequency[index[link.target]] -= link.coupling * Math.sin(x[index[link.target]] - x[index[link.source]]);
        });

    return temp_frequency
}

function EulerStep(x,v,h) {
    var kx = v;
    var kv = odefunc(x,v);
    graph.nodes.forEach(function(node, i) {x[i] += h * kx[i]; v[i] += h * kv[i]})
    return [ x, v];
}

// 4TH ORDER RUNGE-KUTTA 
function RK4Step(x_in,v_in,h) {

	// starting points
	var x = x_in;
	var v = v_in;

    var kx0 = v;
    var kv0 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x[i] += 0.5*h*kx0[i]; v[i] += 0.5*h*kv0[i]})

    var kx1 = v;
    var kv1 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x[i] += 0.5*h*kx1[i]; v[i] += 0.5*h*kv1[i]})

    var kx2 = v;
    var kv2 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x[i] += h*kx2[i]; v[i] += h*kv2[i]})

    var kx3 = v;
    var kv3 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x_in[i] += h/6*(kx0[i]+2*(kx1[i]+kx2[i])+kx3[i]); v_in[i] += h/6*(kv0[i]+2*(kv1[i]+kv2[i])+kv3[i])})

    return [ x_in, v_in ];
}

