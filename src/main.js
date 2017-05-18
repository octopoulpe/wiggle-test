'use strict';

var tests = require('./tests/index');

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

var currentTest = null;

window.onload = function () {
    document.querySelector('ul').addEventListener('click', function (event) {
        if (event.srcElement.tagName !== 'A') {
            return;
        }
        if (currentTest && currentTest.teardown) {
            currentTest.teardown();
            document.querySelector('#help').textContent = '';
        }
        var testId = event.srcElement.id;
        var testClass = tests[testId];
        currentTest = new testClass();
        if (currentTest.helpBlock) {
            document.querySelector('#help').textContent = currentTest.helpBlock;
        }
        currentTest.setup();
    });
};
