'use strict';

var wiggle = require('wiggle');

var App = function () {
    this.context = new wiggle.context.Context('appcanvas');
    this.moving = false;
};

App.prototype.helpBlock = 'Press a, z, or space';

App.prototype.setup = function () {
    this.context.resizeIfNeeded();
    this.kb = new wiggle.input.KeyboardState();

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

    var cwR = new wiggle.motion.Motion('cwR', this.rotate.bind(this));
    var ccwR = new wiggle.motion.Motion('ccwR', this.rotate.bind(this));
    var cycle = new wiggle.motion.Motion(
        'cycle', wiggle.motion.slowdownWrapper(this.cycle.bind(this), 2000)
    );
    this.mBounce = new wiggle.motion.Motion('bounce', this.bounce.bind(this));

    cwR.stateChecker = this.kb.keyChecker('a');
    ccwR.stateChecker = this.kb.keyChecker('z');
    cycle.stateChecker = this.kb.keyChecker(' ');

    this.tick = wiggle.motion.ticker([cwR, ccwR, cycle, this.mBounce]);

    this.kb.listen();

    this.next();
};

App.prototype.next = function () {
    window.requestAnimationFrame(this.step.bind(this));
};

App.prototype.rotate = function (name, idx, currentTs, startTs, previousTs) {
    var rot = (currentTs - previousTs) / 1000;
    var direction = 0;
    if (name === 'cwR') {
        direction = 1;
    } else if (name === 'ccwR') {
        direction = -1;
    }
    this.camera.node.transform.rZ += rot * direction;
};

App.prototype.cycle = function () {
    this.mBounce.running = !this.mBounce.running;
};

App.prototype.bounce = function (name, idx, currentTs, startTs) {
    var rot = (currentTs - startTs) / 1000;
    this.camera.node.transform.rZ = Math.cos(rot);
};

App.prototype.teardown = function () {
    this.stop = true;
    this.kb.stopListening();
};

App.prototype.step = function (nowTs) {
    if (this.stop) {
        return;
    }
    this.nowTs = nowTs;

    this.tick(nowTs);

    this.camera.node.transform.refresh();

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
