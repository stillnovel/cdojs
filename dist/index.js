'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rateLimitPromise = require('rate-limit-promise');

var _rateLimitPromise2 = _interopRequireDefault(_rateLimitPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CDO = function () {
  function CDO(token) {
    _classCallCheck(this, CDO);

    this.token = token;

    this.secondLimiter = (0, _rateLimitPromise2.default)(5, 1000);
    this.dayLimiter = (0, _rateLimitPromise2.default)(1000, 1000 * 60 * 60 * 24);
  }

  _createClass(CDO, [{
    key: 'datasets',
    value: function datasets() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return this.request('datasets', { params: params });
    }
  }, {
    key: 'dataset',
    value: function dataset(id) {
      return this.request('datasets/' + id);
    }
  }, {
    key: 'datacategories',
    value: function datacategories() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return this.request('datacategories', { params: params });
    }
  }, {
    key: 'datacategory',
    value: function datacategory(id) {
      return this.request('datacategories/' + id);
    }
  }, {
    key: 'request',
    value: function request(resource, config) {
      var _this = this;

      return Promise.all([this.secondLimiter(), this.dayLimiter()]).then(function () {
        return (0, _axios2.default)(resource, _lodash2.default.merge({
          baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
          headers: { token: _this.token }
        }, config));
      }).then(function (res) {
        return res.data;
      });
    }
  }]);

  return CDO;
}();

exports.default = CDO;