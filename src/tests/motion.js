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

    this.mot1 = new wiggle.motion.Motion('mot1', this.mot1Cb.bind(this));
    this.mot2 = new wiggle.motion.Motion('mot2', this.mot2Cb.bind(this));
    this.mot3 = new wiggle.motion.Motion(
        'mot3', wiggle.motion.slowdownWrapper(this.mot3Cb.bind(this), 2000)
    );
    this.mot4 = new wiggle.motion.Motion(
        'mot4', wiggle.motion.slowdownWrapper(this.mot4Cb.bind(this), 5000)
    );

    this.mot1.nowGetter = this.nowGetter.bind(this);
    this.mot2.nowGetter = this.nowGetter.bind(this);
    this.mot3.nowGetter = this.nowGetter.bind(this);
    this.mot4.nowGetter = this.nowGetter.bind(this);

    this.mot3.running = true;
    this.mot4.running = true;

    this.next();
};

App.prototype.next = function () {
    window.requestAnimationFrame(this.step.bind(this));
};

App.prototype.nowGetter = function () {
    return this.nowTs;
};

App.prototype.mot1Cb = function (name, idx, currentTs, startTs, previousTs) {
    this.camera.node.transform.rZ -= 1 * (currentTs - previousTs) / 1000;
};

App.prototype.mot2Cb = function (name, idx, currentTs, startTs, previousTs) {
    this.camera.node.transform.rZ += 1 * (currentTs - previousTs) / 1000;
};

App.prototype.mot3Cb = function () {
    this.mot1.running = true;
    this.mot2.running = false;
};
App.prototype.mot4Cb = function () {
    this.mot1.running = false;
    this.mot2.running = true;
};

App.prototype.teardown = function () {
    this.stop = true;
};

App.prototype.step = function (nowTs) {
    if (this.stop) {
        return;
    }
    this.nowTs = nowTs;

    this.camera.node.transform.tY = 2;
    this.camera.node.transform.refresh();

    this.mot1.tick();
    this.mot2.tick();
    this.mot3.tick();
    this.mot4.tick();

    this.draw();

    this.next();
};

App.prototype.draw = function () {
    this.context.clear();

    this.shader.use();

    this.camera.expose();
    this.projection.expose();
    this.vertArr.draw();
};

module.exports = App;
