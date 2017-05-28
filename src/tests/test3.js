'use strict';

var wiggle = require('wiggle');

var App3 = function () {
    this.context = new wiggle.context.Context('appcanvas');
    this.lastStep = 0;
    this.moving = false;
    this.stop = false;
};

App3.prototype.setup = function () {
    this.context.resizeIfNeeded();

    var shader = new wiggle.Shader();
    shader.init(
        require('./shaders/v_lighting.glsl'),
        require('./shaders/f_lighting.glsl')
    );
    shader.use();
    this.shader = shader;

    var projection = new wiggle.Projection('uProjMat');
    this.projection = projection;
    this.projection.perspective();

    var camera = new wiggle.Camera('uViewMat');
    this.camera = camera;
    this.camera.node.transform.tZ = 1;

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
    this.texture.load('assets/fry.jpg', this.step.bind(this));
};

App3.prototype.fillArray = function (indices, points, payload) {
    this.vertArr.buff('aVertexPosition').addIdx(points, indices);
    this.vertArr.buff('aVertexColor').addN(payload.color, indices.length);
    this.vertArr.buff('aVertexCenter').addN(points[0], indices.length);
};

App3.prototype.bindEvent = function () {
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

App3.prototype.teardown = function () {
    this.texture.free();
    this.stop = true;
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
};

App3.prototype.step = function (timestamp) {
    if (this.stop) {
        return;
    }
    var timeDelta = timestamp - this.lastStep;
    this.lastStep = timestamp;

    this.draw();

    window.requestAnimationFrame(this.step.bind(this));
    return timeDelta;
};

App3.prototype.draw = function () {
    this.context.resizeIfNeeded();
    this.context.clear();
    if (this.moving) {
        console.log('moving');
        this.camera.node.transform.tY += 0.01;
    }
    this.camera.node.transform.refresh();
    this.shader.use();

    this.texture.enable();
    this.context.shaderInUse.uniforms.uSampler(this.texture.texIdx);

    this.camera.expose();
    this.projection.expose();

    this.context.shaderInUse.uniforms.uPlayerPos([this.camera.node.transform.tX, this.camera.node.transform.tY]);

    this.vertArr.draw();
};

module.exports = App3;
