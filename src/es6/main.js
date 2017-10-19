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

  const sliderPertX = $('.slider#xpert_val').slider({
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
  const sliderPertY = $('.slider#ypert_val').slider({
    formatter: value => `${value} Hz`,
    tooltip: 'always',
  });

  sliderSpeed.slider('on', 'change', (data) => {
    Simulation.setParamSpeed(data.newValue);
  });

  sliderDamp.slider('on', 'change', (data) => {
    Simulation.setParamDamp(data.newValue);
  });

  sliderPertX.slider('on', 'change', (data) => {
    Simulation.setParamPertX(data.newValue);
  });

  sliderPertY.slider('on', 'change', (data) => {
    Simulation.setParamPertY(data.newValue);
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
    } else {
      $('body')
        .removeClass('sim-on')
        .addClass('sim-off');
    }
  }

  function reset() {
    sliderPertX.slider('setValue', 0.1, true, true);
    sliderPertY.slider('setValue', 0.1, true, true);
    sliderSpeed.slider('setValue', 42, true, true);
    sliderDamp.slider('setValue', 1, true, true);
    Simulation.reset();
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
    reset();
    ev.preventDefault();
  });

  $('[data-control=random]').on('click', (ev) => {
    Simulation.randomState();
    ev.preventDefault();
  });

  sliderPertX.slider('setValue', 0.1, true, true);
  sliderPertY.slider('setValue', 0.1, true, true);
  Simulation.setParamPertX(0.1);
  Simulation.setParamPertY(0.1);
  updateSimControls();

  /**
   * "About"/Learn more buttons
   */
  $('.button-about').on('click', (ev) => {
    if(!$(ev.target).hasClass('selected')) {
      $('.button-about').removeClass('selected');
      $(ev.target).addClass('selected');
      $('.about-text').removeClass('visible');
      const aboutID = $(ev.target).attr('data-about');
      $(`.about-text#${aboutID}`).addClass('visible');
    }
    ev.preventDefault();
  });

  /**
   * Overlay
   */
  function showOverlay() {
    $('.overlay-info').addClass('overlay-visible');
  }

  function hideOverlay() {
    $('.overlay-info').removeClass('overlay-visible');
  }

  $('.overlay').on('click', (ev) => {
    hideOverlay();
    ev.preventDefault();
  });

  $('.overlay-close').on('click', (ev) => {
    hideOverlay();
    ev.preventDefault();
  });

  $('[data-control=info]').on('click', (ev) => {
    showOverlay();
    ev.preventDefault();
  });
});
