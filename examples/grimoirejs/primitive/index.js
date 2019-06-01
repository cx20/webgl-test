gr.registerComponent('Rotate', {
  attributes: {
    speed: {
      default: '1',
      converter: 'Number',
    },
  },
  $mount: function () {
    this.phi = 0;
  },
  $update: function () {
    this.phi += this.getAttribute('speed');
    this.node.setAttribute('rotation',0 + ',' + this.phi + ',' + 0);
  },
});

gr(function () {
  var $$ = gr('#canvas');
  $$('mesh').addComponent('Rotate');
});