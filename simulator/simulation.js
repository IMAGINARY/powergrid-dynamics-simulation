var graph = null
var simulation_running = false
var simulation = null

// dynamical variables
var frequency;
var phase;
var temp_frequency;
var index;

var counter = 0;

// parameters
var base_frequency = 0.,
	damp_modifier = 1.;

var step_size = 0.01;


var buffer1, buffer2, buffer3, buffer4;
var bufferx1, bufferx2, bufferx3, bufferx0;
var bufferv1, bufferv2, bufferv3, bufferv0;

var kx0, kx1, kx2, kx3;
var kv0, kv1, kv2, kv3;

var kxt, kvt, buffer_kxt, buffer_kvt;

// ###############################################################################################################
// handle simulation events

onmessage = function(e) {
	switch (e.data.m_type){
		case 'network':
			graph = e.data.graph
			base_frequency = e.data.base_frequency
			damp_modifier = e.data.damp_modifier
			initialize_simulation(graph)
			break
		case 'parameters':
			change_dynamical_pars(e.data)
			break
		case 'sim_on':
			start_simulation(step_size)
			break
		case 'sim_off':
			stop_simulation()
			break
		case 'perturbation':
			perturb_simulation(e.data)
			break
	    case 'random':
	      	random_state(e.data)
	      	break
		case 'bounce':
			output = {"frequency": frequency, "phase": phase}
			postMessage(output)
	}
}

function change_dynamical_pars(d) {
	for (i = 0; i < frequency.length; i++){
		frequency[i] = frequency[i] - base_frequency + d.base_frequency
	}
	base_frequency = d.base_frequency
	damp_modifier = d.damp_modifier
}

function initialize_simulation(g) {
  	buffer1 = new ArrayBuffer(graph.nodes.length * 8);
  	buffer2 = new ArrayBuffer(graph.nodes.length * 8);

  	frequency = new Float64Array(buffer1)
  	phase = new Float64Array(buffer2)

  	bufferx0 = new ArrayBuffer(graph.nodes.length * 8);
  	bufferv0 = new ArrayBuffer(graph.nodes.length * 8);

  	kx0 = new Float64Array(bufferx0)
  	kv0 = new Float64Array(bufferv0)

  	bufferx1 = new ArrayBuffer(graph.nodes.length * 8);
  	bufferv1 = new ArrayBuffer(graph.nodes.length * 8);

  	kx1 = new Float64Array(bufferx1)
  	kv1 = new Float64Array(bufferv1)

  	bufferx2 = new ArrayBuffer(graph.nodes.length * 8);
  	bufferv2 = new ArrayBuffer(graph.nodes.length * 8);

  	kx2 = new Float64Array(bufferx2)
  	kv2 = new Float64Array(bufferv2)

  	bufferx3 = new ArrayBuffer(graph.nodes.length * 8);
  	bufferv3 = new ArrayBuffer(graph.nodes.length * 8);

  	kx3 = new Float64Array(bufferx3)
  	kv3 = new Float64Array(bufferv3)

  	buffer_kxt = new ArrayBuffer(graph.nodes.length * 8);
  	buffer_kvt = new ArrayBuffer(graph.nodes.length * 8);

  	kxt = new Float64Array(buffer_kxt)
  	kvt = new Float64Array(buffer_kvt)

	buffer3 = new ArrayBuffer(graph.nodes.length * 8);
  	temp_frequency = new Float64Array(buffer3);


  	index = new Object()
  	graph.nodes.forEach(function(node, i) {index[node.id] = i})

  	// set initial frequencies
  	graph.nodes.forEach(function(node, i) {frequency[i] = base_frequency})
  	// set initial phases
	graph.nodes.forEach(function(node, i) {phase[i] = node.fixed_point})
	// start_simulation(step_size)
	
	output = {"frequency": frequency, "phase": phase}
	postMessage(output)
}

function start_simulation(step){
	if (simulation_running) {}
	else {
		simulation = setInterval(function () {  
		//[phase, frequency] = EulerStep(phase, frequency, step)
	    // [phase, frequency] = RK4Step(phase, frequency, step/10.)
	    RK4Step2(step)
	    //RK4Step2(step/5.)
	    //RK4Step2(step/5.)
	    //RK4Step2(step/5.)
	    //RK4Step2(step/5.)
	    //RK4Step2(step/10.)
	    //RK4Step2(step/10.)
	    //RK4Step2(step/10.)
	    //RK4Step2(step/10.)
	    //RK4Step2(step/10.)
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
	};

	output = {"frequency": frequency, "phase": phase};
	postMessage(output)
}

function perturb_simulation(pert){
	if (simulation) {
		frequency[index[pert.node_id]] += pert.y; // 2. * (0.5 - Math.random()) *;
		phase[index[pert.node_id]] += pert.x; //2. * (0.5 - Math.random());
	}	
  output = {"frequency": frequency, "phase": phase};
  postMessage(output)

}


function random_state(pert){
  if (simulation) graph.nodes.forEach(function(node, i) {
    frequency[i] = base_frequency + 2. * (0.5 - Math.random()) * pert.y;
    phase[i] = 2. * (0.5 - Math.random()) * pert.x;
  })
  output = {"frequency": frequency, "phase": phase};
  postMessage(output)

}

// ###############################################################################################################
// rhs function and numerical integration

function odefunc(x,v) { 

    graph.nodes.forEach(function(node, i) {
			temp_frequency[i] = node.input_power - damp_modifier * node.damping * (v[i] - base_frequency)
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

    var kx2 = v
	var kv2 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x[i] += h*kx2[i]; v[i] += h*kv2[i]})

    var kx3 = v;
    var kv3 = odefunc(x,v);

    graph.nodes.forEach(function(node, i) {x_in[i] += h/6*(kx0[i]+2*(kx1[i]+kx2[i])+kx3[i]); v_in[i] += h/6*(kv0[i]+2*(kv1[i]+kv2[i])+kv3[i])})

	counter += 1
	if(counter > 1000){
		counter = 0;
		for (i = 0; i < x_in.length; i++){
			x_in[i] = x_in[i] % (2 * Math.PI)
		}
	}

    return [ x_in, v_in ];

}

function RK4Step2(h) {

	// This could potentially be optimized by eliminating kvt and replacing it by kx1, kx2, kx3
	// starting points
    // kx0 = frequency;
    kv0 = odefunc(phase,frequency);

    for(i = 0; i < kx0.length; i++){kxt[i] = phase[i] + 0.5 * h * frequency[i]; kx1[i] = frequency[i] + 0.5 * h * kv0[i]}

    // kx1 = kvt
    kv1 = odefunc(kxt, kx1)

    for(i = 0; i < kx0.length; i++){kxt[i] = phase[i] + 0.5 * h * kx1[i]; kx2[i] = frequency[i] + 0.5 * h * kv1[i]}

    // kx2 = kvt
    kv2 = odefunc(kxt, kx2)

    for(i = 0; i < kx0.length; i++){kxt[i] = phase[i] + h * kx2[i]; kx3[i] = frequency[i] + h * kv2[i]}

    // kx3 = kvt
    kv3 = odefunc(kxt, kx3)

    for(i = 0; i < kx0.length; i++){
    	phase[i] = phase[i] + h/6*(frequency[i]+2*(kx1[i]+kx2[i])+kx3[i]); 
    	frequency[i] = frequency[i] + h/6*(kv0[i]+2*(kv1[i]+kv2[i])+kv3[i])}

}
