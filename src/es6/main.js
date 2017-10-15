import Simulation from './simulation';

$(() => {
  /**
   * Setup sliders
   */
  const sliderSpeed = $('.slider#speed_val').slider({
    formatter: value => `${value} Hz`,
    tooltip: 'always',
  });
  const sliderDamp = $('.slider#damp_val').slider({
    formatter: value => value,
    tooltip: 'always',
  });

  const slidePertX = $('.slider#xpert_val').slider({
    formatter: (value) => {
      if (value === 1) {
        return 'π';
      } else if (value === -1) {
        return '-π';
      } else if (value === 0) {
        return '0';
      }
      return `${value} π`;
    },
    tooltip: 'always',
  });
  const slidePertY = $('.slider#ypert_val').slider({
    formatter: value => `${value} Hz`,
    tooltip: 'always',
  });

  sliderSpeed.slider('on', 'change', (data) => {
    console.trace(data);
    Simulation.setParamSpeed(data.newValue);
  });

  sliderDamp.slider('on', 'change', (data) => {
    console.trace(data);
    Simulation.setParamDamp(data.newValue);
  });

  /**
   * Sim controls
   *
   */
  function updateSimControls() {
    if (Simulation.isRunning()) {
      $('body')
        .removeClass('sim-off')
        .addClass('sim-on');
      sliderSpeed.slider('disable');
      sliderDamp.slider('disable');
    } else {
      $('body')
        .removeClass('sim-on')
        .addClass('sim-off');
      sliderSpeed.slider('enable');
      sliderDamp.slider('enable');
    }
  }

  $('[data-control=play-pause]').on('click', (ev) => {
    if (Simulation.isRunning()) {
      Simulation.stop();
    } else {
      Simulation.start();
    }
    updateSimControls();
    ev.preventDefault();
  });

  $('[data-control=reset]').on('click', (ev) => {
    Simulation.reset();
    ev.preventDefault();
  });

  updateSimControls();
});
