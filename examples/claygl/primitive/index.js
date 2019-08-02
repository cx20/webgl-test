var app = clay.application.create('#viewport', {

    init: function (app) {
        app.renderer.clearColor = [0, 0, 0, 1];
        
        this._camera = app.createCamera([0, 2, 5], [0, 0, 0]);
        var texture = '../../../assets/textures/earth.jpg';

        this._meshPlane = app.createPlane({diffuseMap: texture});
        this._meshPlane.position.set(-1.5, 0.0, 0.0);
        this._meshPlane.scale.set(0.5, 0.5, 0.5);

        this._meshCube = app.createCube({diffuseMap: texture});
        this._meshCube.position.set(0.0, 0.0, 0.0);
        this._meshCube.scale.set(0.5, 0.5, 0.5);

        this._meshSphere = app.createSphere({diffuseMap: texture});
        this._meshSphere.position.set(1.5, 0.0, 0.0);
        this._meshSphere.scale.set(0.5, 0.5, 0.5);

        this._mainLight = app.createDirectionalLight([-1, -1, -1]);
    },

    loop: function (app) {
        this._meshPlane.rotation.rotateY(app.frameTime / 1000);
        this._meshCube.rotation.rotateY(app.frameTime / 1000);
        this._meshSphere.rotation.rotateY(app.frameTime / 1000);
    }
});
