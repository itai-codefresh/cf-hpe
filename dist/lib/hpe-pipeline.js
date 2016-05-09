'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HpePipeline = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pipelineSteps = [{
  id: 'root',
  name: 'Codefresh Build'
}, {
  id: 'clone-repository',
  name: 'Clone Repository'
}, {
  id: 'build-dockerfile',
  name: 'Build Dockerfile'
}, {
  id: 'unit-test-script',
  name: 'Unit Test Script'
}, {
  id: 'push-docker-registry',
  name: 'Push to Docker Registry'
}, {
  id: 'integration-test-script',
  name: 'Integration Test Script'
}, {
  id: 'security-validation',
  name: 'Security Validation'
}, {
  id: 'deploy-script',
  name: 'Deploy Script'
}];

var HpePipeline = function () {
  function HpePipeline() {
    _classCallCheck(this, HpePipeline);
  }

  _createClass(HpePipeline, null, [{
    key: 'steps',
    value: function steps() {
      return pipelineSteps;
    }
  }, {
    key: 'jobId',
    value: function jobId(pipelineId, stepId) {
      return _util2.default.format('%s-%s', pipelineId, stepId);
    }
  }, {
    key: 'jobs',
    value: function jobs(pipelineId) {
      return (0, _lodash2.default)(HpePipeline.steps()).map(function (step) {
        var result = {
          jobCiId: HpePipeline.jobId(pipelineId, step.id),
          name: step.name
        };

        return result;
      }).value();
    }
  }]);

  return HpePipeline;
}();

exports.HpePipeline = HpePipeline;