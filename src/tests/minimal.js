'use strict';

var wiggle = require('wiggle');

var App = function () {
    this.context = new wiggle.context.Context('appcanvas');
};

App.prototype.setup = function () {
    this.context.resizeIfNeeded();

    this.shader = new wiggle.Shader();
    this.shader.init(
        require('./shaders/v_mini.glsl'),
        require('./shaders/f_mini.glsl')
    );
    this.shader.use();

    this.vertArr = new wiggle.buffers.BufferArray(
        Object.keys(this.shader.attributes)
    );
    this.vertArr.buff('aVertexPosition').add([
        [0, 1], [0, 0], [1, 0],
    ]);
    this.vertArr.commit();

    this.draw();
};

App.prototype.draw = function () {
    this.context.clear();

    this.shader.use();

    this.vertArr.draw();
};

module.exports = App;
