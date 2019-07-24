let canvas;
canvas = document.getElementById('canvas');
document.body.appendChild(canvas);
RedGL(canvas, function (v) {
    let tWorld, tView, tScene, tController, tRenderer;
    this['world'] = tWorld = RedWorld();
    tScene = RedScene(this);
    tScene.useBackgroundColor = true;
    tScene.backgroundColor = '#000000';

    tController = RedObitController(this);
    tController.distance = 5;
    tRenderer = RedRenderer();
    tView = RedView(this, tScene, tController);
    tWorld.addView(tView, 'HelloRedGL');
    
    let tTexture = RedBitmapTexture(this, '../../../assets/textures/earth.jpg');
    let tMaterial = RedBitmapMaterial(this, tTexture);

    // RedPlane(redGL, width, height, widthSegments, heightSegments)
    let tMeshPlane = RedMesh(this, RedPlane(this), tMaterial);
    tMeshPlane.x = -1.5;
    tMeshPlane.y = 1.5;
    tScene.addChild(tMeshPlane);

    // RedBox(redGL, width, height, depth, widthSegments, heightSegments, depthSegments)
    let tMeshCube = RedMesh(this, RedBox(this), tMaterial);
    tMeshCube.x = 0;
    tMeshCube.y = 1.5;
    tScene.addChild(tMeshCube);
    
    // RedSphere(redGL, radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
    let tMeshSphere = RedMesh(this, RedSphere(this, 0.5, 32, 32, 32), tMaterial);
    tMeshSphere.x = 1.5;
    tMeshSphere.y = 1.5;
    tScene.addChild(tMeshSphere);
    
    // RedCylinder(redGL, radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
    let tMeshCylinder = RedMesh(this, RedCylinder(this, 0.5, 0.5, 1, 32, 32), tMaterial);
    tMeshCylinder.x = 0;
    tMeshCylinder.y = 0;
    tScene.addChild(tMeshCylinder);

    // RedCylinder(redGL, radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
    let tMeshCone = RedMesh(this, RedCylinder(this, 0.0, 0.5, 1, 32, 32), tMaterial);
    tMeshCone.x = 1.5;
    tMeshCone.y = 0;
    tScene.addChild(tMeshCone);

    tRenderer.start(this, function (time) {
        tMeshPlane.rotationY -= 1;
        tMeshCube.rotationY -= 1;
        tMeshSphere.rotationY -= 1;
        tMeshCylinder.rotationY -= 1;
        tMeshCone.rotationY -= 1;
    });
});