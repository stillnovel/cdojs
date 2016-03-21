'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rateLimitPromise = require('rate-limit-promise');

var _rateLimitPromise2 = _interopRequireDefault(_rateLimitPromise);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debug2.default)('CDO');

var CDO = function () {
  function CDO(token) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CDO);

    this.token = token;
    this.opts = _lodash2.default.merge({}, opts);
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
    key: 'datatypes',
    value: function datatypes() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datatypes', _extends({ params: params }, config));
    }
  }, {
    key: 'datatype',
    value: function datatype(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('datatypes/' + id, config);
    }
  }, {
    key: 'locationcategories',
    value: function locationcategories() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('locationcategories', _extends({ params: params }, config));
    }
  }, {
    key: 'locationcategory',
    value: function locationcategory(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('locationcategories/' + id, config);
    }
  }, {
    key: 'locations',
    value: function locations() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('locations', _extends({ params: params }, config));
    }
  }, {
    key: 'location',
    value: function location(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('locations/' + id, config);
    }
  }, {
    key: 'stations',
    value: function stations() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('stations', _extends({ params: params }, config));
    }
  }, {
    key: 'station',
    value: function station(id) {
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('stations/' + id, config);
    }
  }, {
    key: 'data',
    value: function data() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      return this.request('data', _extends({ params: params }, config));
    }
  }, {
    key: 'unpaginate',
    value: function unpaginate(method) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var _method,
          _this = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (typeof method === 'string') method = _lodash2.default.get(this, method);
      return (_method = method).call.apply(_method, [this, params].concat(args)).then(function (res) {
        var _res$metadata$results = res.metadata.resultset;
        var offset = _res$metadata$results.offset;
        var count = _res$metadata$results.count;
        var limit = _res$metadata$results.limit;

        var nextOffset = offset + limit;
        return Promise.resolve(nextOffset < count ? _this.unpaginate.apply(_this, [method, _lodash2.default.defaults({ limit: limit, offset: nextOffset }, params)].concat(args)) : []).then(function (nextRess) {
          return [res].concat(_toConsumableArray(nextRess));
        });
      });
    }
  }, {
    key: 'request',
    value: function request(resource) {
      var _this2 = this,
          _arguments = arguments;

      var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var mergedConfig = _lodash2.default.merge({
        baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
        headers: { token: this.token }
      }, this.opts.config, config);
      var readableURL = '/' + resource + (_lodash2.default.isEmpty(mergedConfig.params) ? '' : ' ') + _querystring2.default.stringify(mergedConfig.params);
      return Promise.all([this.secondLimiter(), this.dayLimiter()]).then(function () {
        return (0, _axios2.default)(resource, mergedConfig);
      }).catch(function (res) {
        var status = res.status;
        var statusText = res.statusText;

        debug('%s (%s %s)', readableURL, status, statusText);
        if (status === 429) return _this2.request.apply(_this2, _arguments); // rate limited, try again
        throw res;
      }).then(function (_ref) {
        var status = _ref.status;
        var statusText = _ref.statusText;
        var data = _ref.data;

        debug('%s (%s %s)', readableURL, status, statusText);
        return data;
      });
    }
  }]);

  return CDO;
}();

CDO.RATE_LIMIT_EPSILON_MS = 200;

module.exports = CDO;