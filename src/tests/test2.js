'use strict';

var wiggle = require('wiggle');
var graph = wiggle.graph;

var App2 = function () {
    this.context = new wiggle.context.Context('appcanvas');
    this.lastStep = 0;
    this.moving = false;
    this.stop = false;
};

App2.prototype.setup = function () {
    this.context.resizeIfNeeded();

    var shader = new wiggle.Shader();
    shader.init(
        require('./shaders/v_pvm.glsl'),
        require('./shaders/f_lighting.glsl')
    );
    shader.use();
    this.shader = shader;

    this.nodeA = new graph.GraphNode(new graph.Transform());
    this.nodeAA = new graph.GraphNode(new graph.Transform());
    this.nodeAA.parent = this.nodeA;
    this.nodeAAA = new graph.GraphNode(new graph.Transform());
    this.nodeAAA.parent = this.nodeAA;
    this.nodeAB = new graph.GraphNode(new graph.Transform());
    this.nodeAB.parent = this.nodeA;
    this.nodeABA = new graph.GraphNode(new graph.Transform());
    this.nodeABA.parent = this.nodeAB;

    this.nodeA.transform.tX = 1;
    this.nodeAA.transform.tY = 1;
    this.nodeAAA.transform.tX = 1;
    this.nodeAB.transform.rZ = 0.5;
    this.nodeABA.transform.tX = 1;

    var projection = new wiggle.Projection('uProjMat');
    this.projection = projection;
    this.projection.ortho();

    var camera = new wiggle.Camera('uViewMat');
    this.camera = camera;
    this.camera.node.transform.tZ = 0.5;

    this.vertArr = new wiggle.buffers.BufferArray(Object.keys(shader.attributes));
    this.vertArr.buff('aVertexPosition').add([
        [0, 1], [0, 0], [1, 0],
        [1, 0], [1, 1], [0, 1],
    ]);
    this.vertArr.buff('aTextureCoord').add([
        [0, 1], [0, 0], [1, 0],
        [1, 0], [1, 1], [0, 1],
    ]);
    this.vertArr.buff('aVertexColor').addN([1, 1, 1], 6);
    this.vertArr.commit();

    this.bindEvent();

    this.texture = new wiggle.Texture();
    this.texture.load('assets/zoidberg.png', this.step.bind(this));
};

App2.prototype.fillArray = function (indices, points, payload) {
    this.vertArr.buff('aVertexPosition').addIdx(points, indices);
    this.vertArr.buff('aVertexColor').addN(payload.color, indices.length);
    this.vertArr.buff('aVertexCenter').addN(points[0], indices.length);
};

App2.prototype.bindEvent = function () {
    this.keyDownHandler = (function (event) {
        var keyName = event.key;
        if (keyName === 'z') {
            this.moving = true;
        }
    }).bind(this);
    this.keyUpHandler = (function (event) {
        var keyName = event.key;
        if (keyName === 'z') {
            this.moving = false;
        }
    }).bind(this);
    document.addEventListener('keydown', this.keyDownHandler, false);
    document.addEventListener('keyup', this.keyUpHandler, false);

};

App2.prototype.teardown = function () {
    this.texture.free();
    this.stop = true;
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
};

App2.prototype.step = function (timestamp) {
    if (this.stop) {
        return;
    }
    var timeDelta = timestamp - this.lastStep;
    this.lastStep = timestamp;

    this.draw();

    window.requestAnimationFrame(this.step.bind(this));
    return timeDelta;
};

App2.prototype.draw = function () {
    this.context.resizeIfNeeded();
    this.context.clear();
    if (this.moving) {
        console.log('moving');
        this.camera.node.transform.tY += 0.01;
        this.nodeABA.parent = this.nodeAA;
    } else {
        this.nodeABA.parent = this.nodeAB;
    }
    this.camera.node.transform.refresh();
    this.nodeAB.transform.rZ += 0.001;
    this.nodeABA.transform.rZ += 0.001;

    this.shader.use();

    this.texture.enable();
    this.context.shaderInUse.uniforms.uSampler(this.texture.texIdx);

    this.camera.expose();
    this.projection.expose();

    this.nodeA.transform.refresh();
    this.nodeAA.transform.refresh();
    this.nodeAAA.transform.refresh();
    this.nodeAB.transform.refresh();
    this.nodeABA.transform.refresh();

    this.context.shaderInUse.uniforms.uPlayerPos([this.camera.node.transform.tX, this.camera.node.transform.tY]);

    this.context.shaderInUse.uniforms.uModelMat(false, this.nodeA.getBubbledMat());
    this.vertArr.draw();
    this.context.shaderInUse.uniforms.uModelMat(false, this.nodeAA.getBubbledMat());
    this.vertArr.draw();
    this.context.shaderInUse.uniforms.uModelMat(false, this.nodeAAA.getBubbledMat());
    this.vertArr.draw();
    this.context.shaderInUse.uniforms.uModelMat(false, this.nodeAB.getBubbledMat());
    this.vertArr.draw();
    this.context.shaderInUse.uniforms.uModelMat(false, this.nodeABA.getBubbledMat());
    this.vertArr.draw();
};

module.exports = App2;
