/* global simWorker, startSim, stopSim, resetNetwork, speed_val, damp_val, pert */

/**
 * Interface for encapsulating global/dirty calls to the original simulation code
 * without modifying it.
 *
 * NOTE: Right now the simulation produces no events if it's stopped and provides no way
 * to know if it's running, both of which would be necessary to correctly implement this
 * control. However, the internal variable that indicates if it's running is only modified
 * through calling the stop/start functions that are only called through the original
 * buttons being replaced. But let's be careful with that...
 */
export default class Simulation {
  static start() {
    startSim();
    Simulation.defaultIsRunning = true;
  }

  static stop() {
    stopSim();
    Simulation.defaultIsRunning = false;
  }

  static reset() {
    resetNetwork();
  }

  static isRunning() {
    return Simulation.defaultIsRunning;
  }

  static setParamSpeed(value) {
    speed_val = (50 - +value) / 10; // eslint-disable-line
    resetNetwork();
  }

  static setParamDamp(value) {
    damp_val = +value * 10; // eslint-disable-line
    resetNetwork();
  }

  static setParamPertX(value) {
    pert.x = +value * Math.PI;
    const data = {
      m_type: 'parameters',
      speed_val,
      damp_val,
      pert,
    };
    // send data
    simWorker.postMessage(data);
  }

  static setParamPertY(value) {
    pert.y = +value;
    const data = {
      m_type: 'parameters',
      speed_val,
      damp_val,
      pert,
    };
    // send data
    simWorker.postMessage(data);
  }
}

// Simulation starts on
Simulation.defaultIsRunning = true;
