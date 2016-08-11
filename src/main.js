'use strict';

var wiggle = require('wiggle');

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

var App = function () {
    this.context = new wiggle.context.Context('appcanvas');
    this.lastStep = 0;
};

App.prototype.init = function () {
    var shader = new wiggle.Shader();
    shader.init(
        require('./shaders/v_lighting.glsl'),
        require('./shaders/f_lighting.glsl')
    );
    shader.use();

    var camera = new wiggle.Camera('uPMatrix');
    this.camera = camera;
    this.camera.set(0, 0);

    this.vertArr = new wiggle.buffers.BufferArray(Object.keys(shader.attributes));

    var htCor = 0.5 * 1/128;
    var ht0 = 0 + htCor;
    var ht1 = 1 - htCor;
    this.vertArr.setData({
        'aVertexPosition': [
            0, 1, 0, 0, 1, 0,
            1, 0, 1, 1, 0, 1,
        ],
        'aTextureCoord': [
           ht0, ht1, ht0, ht0, ht1, ht0,
           ht1, ht0, ht1, ht1, ht0, ht1,
        ],
    });

    this.vertArrbis = new wiggle.buffers.BufferArray(Object.keys(shader.attributes));
    this.vertArrbis.setData({
        'aVertexPosition': [
            0, 1, 0, 0, 1, 0,
            1, 0, 1, 1, 0, 1,
        ],
        'aTextureCoord': [
            0, 1, 0, 0, 1, 0,
            1, 0, 1, 1, 0, 1,
        ],
    });

    this.texture = new wiggle.Texture();
    this.texture.load('assets/nyan.jpg', this.step.bind(this));
};

App.prototype.step = function (timestamp) {
    var timeDelta = timestamp - this.lastStep;
    this.lastStep = timestamp;

    this.draw();

    window.requestAnimationFrame(this.step.bind(this));
    return timeDelta;
};

App.prototype.draw = function () {
    this.context.resizeIfNeeded();
    this.context.clear();

    this.camera.set(0, 0);
    this.camera.expose();

    this.texture.enable();
    this.context.shaderInUse.uniforms.uSampler(this.texture.texIdx);

    this.vertArr.draw();

    this.camera.set(1.1, 0);
    this.camera.expose();
    this.vertArrbis.draw();
    this.camera.set(0, 1.1);
    this.camera.expose();
    this.vertArrbis.draw();
};

window.onload = function () {
    var testApp = new App();
    testApp.init();
};
