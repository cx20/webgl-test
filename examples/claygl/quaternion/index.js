var rad = 0.0;
var app = clay.application.create('#viewport', {

    init: function (app) {
        app.renderer.clearColor = [0, 0, 0, 1];
        
        this._camera = app.createCamera([0, 2, 5], [0, 0, 0]);
        var texture = '../../../assets/textures/frog.jpg';

        this._meshCube1 = app.createCube({diffuseMap: texture});
        this._meshCube1.position.set(-1.0, 0.0, 0.0);
        this._meshCube1.scale.set(0.5, 0.5, 0.5);

        this._meshCube2 = app.createCube({diffuseMap: texture});
        this._meshCube2.position.set(1.0, 0.0, 0.0);
        this._meshCube2.scale.set(0.5, 0.5, 0.5);

        this._mainLight = app.createDirectionalLight([-1, -1, -1]);
    },

    loop: function (app) {
        // euler
        this._meshCube1.rotation.fromEuler(new clay.math.Vector3(rad, rad, rad), "XYZ");

        // quaternion
        this._meshCube2.rotation.rotateX(Math.PI/180);
        this._meshCube2.rotation.rotateY(Math.PI/180);
        this._meshCube2.rotation.rotateZ(Math.PI/180);

        rad += Math.PI/180;
    }
});
