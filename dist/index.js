'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rateLimitPromise = require('rate-limit-promise');

var _rateLimitPromise2 = _interopRequireDefault(_rateLimitPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CDO = function () {
  function CDO(token) {
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CDO);

    this.token = token;
    this.config = _lodash2.default.merge({}, config);
    this.secondLimiter = (0, _rateLimitPromise2.default)(5, 1000 + CDO.RATE_LIMIT_EPSILON_MS);
    this.dayLimiter = (0, _rateLimitPromise2.default)(1000, 1000 * 60 * 60 * 24 + CDO.RATE_LIMIT_EPSILON_MS);
  }

  _createClass(CDO, [{
    key: 'datasets',
    value: function datasets() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datasets', _extends({ params: params }, config));
    }
  }, {
    key: 'dataset',
    value: function dataset(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datasets/' + id, config);
    }
  }, {
    key: 'datacategories',
    value: function datacategories() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datacategories', _extends({ params: params }, config));
    }
  }, {
    key: 'datacategory',
    value: function datacategory(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datacategories/' + id, config);
    }
  }, {
    key: 'unpaginate',
    value: function unpaginate(method, params) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var _method,
          _this = this;

      if (typeof method === 'string') method = _lodash2.default.get(this, method);
      return (_method = method).call.apply(_method, [this, params].concat(args)).then(function (res) {
        var _$get = _lodash2.default.get(res, 'metadata.resultset');

        var offset = _$get.offset;
        var count = _$get.count;
        var limit = _$get.limit;

        var nextOffset = offset + limit;
        return Promise.resolve(nextOffset < count ? _this.unpaginate.apply(_this, [method, _lodash2.default.merge({ limit: limit, offset: nextOffset }, params)].concat(args)) : []).then(function (nextRess) {
          return [res].concat(_toConsumableArray(nextRess));
        });
      });
    }
  }, {
    key: 'request',
    value: function request(resource, config) {
      var _this2 = this;

      return Promise.all([this.secondLimiter(), this.dayLimiter()]).then(function () {
        return (0, _axios2.default)(resource, _lodash2.default.merge({
          baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
          headers: { token: _this2.token }
        }, _this2.config, config));
      }).catch(function (res) {
        if (res.status === 429) return _this2.request(resource, config); // rate limited, try again
        throw res;
      }).then(function (_ref) {
        var data = _ref.data;
        return data;
      });
    }
  }]);

  return CDO;
}();

exports.default = CDO;

CDO.RATE_LIMIT_EPSILON_MS = 200;