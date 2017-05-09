'use strict';

var wiggle = require('wiggle');

var App = function () {
    this.context = new wiggle.context.Context('appcanvas');
    this.moving = false;
};

App.prototype.setup = function () {
    this.context.resizeIfNeeded();

    this.shader = new wiggle.Shader();
    this.shader.init(
        require('./shaders/v_cam.glsl'),
        require('./shaders/f_mini.glsl')
    );
    this.shader.use();

    this.projection = new wiggle.Projection('uProjMat');
    this.projection.ortho();

    this.camera = new wiggle.Camera('uViewMat');

    this.vertArr = new wiggle.buffers.BufferArray(
        Object.keys(this.shader.attributes)
    );
    this.vertArr.buff('aVertexPosition').add([
        [0, 1], [0, 0], [1, 0],
    ]);
    this.vertArr.commit();

    this.step();
};

App.prototype.teardown = function () {
    this.stop = true;
};

App.prototype.step = function () {
    if (this.stop) {
        return;
    }
    this.camera.node.transform.tY = 2;
    this.camera.node.transform.rZ += 0.01;
    this.camera.node.transform.refresh();

    this.draw();

    window.requestAnimationFrame(this.step.bind(this));
};

App.prototype.draw = function () {
    this.context.clear();

    this.shader.use();

    this.camera.expose();
    this.projection.expose();
    this.vertArr.draw();
};

module.exports = App;
