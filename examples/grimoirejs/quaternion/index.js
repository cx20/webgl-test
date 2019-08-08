const Vector3 = gr.lib.math.Vector3;
const Quaternion = gr.lib.math.Quaternion;

gr.registerComponent('Rotate', {
  attributes: {
    speed: {
      default: '1',
      converter: 'Number',
    },
    useQuaternion: {
      default: false,
      converter: 'Boolean',
    },
  },
  $mount: function() {
    this.phi = 0;
  },
  $update: function() {
    this.phi += this.getAttribute('speed');
    
    if (this.getAttribute('useQuaternion')){
      // クォータニオンによる回転
      var axis = new Vector3(1, 1, 1);
      var angle = this.phi * Math.PI / 180;
      var q = Quaternion.angleAxis(angle, axis);
      this.node.setAttribute('rotation', q.normalize());
    }
    else {
      // オイラー角による回転
      this.node.setAttribute('rotation', this.phi + ',' + this.phi + ',' + this.phi);
    }
  },
});

gr.register(async function(){
  // registerNodeなどはgr(function(){})の外で呼ぶこと。
  // gr(function(){} だと GOMLのパース終了時に呼ばれるため、GOML の読み込み時にノードが見つからない旨のエラーが出る為。
  
  gr.registerNode("quaternion-mesh", ["Rotate"], {
    useQuaternion: true
  }, "mesh");
    
  gr.registerNode("rotate-mesh", ["Rotate"], {
    useQuaternion: false
 }, "mesh");
});

gr(function() {
  var $$ = gr('#canvas');
});
