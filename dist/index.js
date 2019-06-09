'use strict';

var _querystring = _interopRequireDefault(require("querystring"));

var _axios = _interopRequireDefault(require("axios"));

var _lodash = _interopRequireDefault(require("lodash"));

var _rateLimitPromise = _interopRequireDefault(require("rate-limit-promise"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = (0, _debug.default)('CDO');

class CDO {
  constructor(token, opts = {}) {
    this.token = token;
    this.opts = _lodash.default.merge({}, opts);
    this.secondLimiter = (0, _rateLimitPromise.default)(5, 1000 + CDO.RATE_LIMIT_EPSILON_MS);
    this.dayLimiter = (0, _rateLimitPromise.default)(1000, 1000 * 60 * 60 * 24 + CDO.RATE_LIMIT_EPSILON_MS);
  }

  datasets(params = {}, config = {}) {
    return this.request('datasets', _objectSpread({
      params
    }, config));
  }

  dataset(id, config = {}) {
    return this.request(`datasets/${id}`, config);
  }

  datacategories(params = {}, config = {}) {
    return this.request('datacategories', _objectSpread({
      params
    }, config));
  }

  datacategory(id, config = {}) {
    return this.request(`datacategories/${id}`, config);
  }

  datatypes(params = {}, config = {}) {
    return this.request('datatypes', _objectSpread({
      params
    }, config));
  }

  datatype(id, config = {}) {
    return this.request(`datatypes/${id}`, config);
  }

  locationcategories(params = {}, config = {}) {
    return this.request('locationcategories', _objectSpread({
      params
    }, config));
  }

  locationcategory(id, config = {}) {
    return this.request(`locationcategories/${id}`, config);
  }

  locations(params = {}, config = {}) {
    return this.request('locations', _objectSpread({
      params
    }, config));
  }

  location(id, config = {}) {
    return this.request(`locations/${id}`, config);
  }

  stations(params = {}, config = {}) {
    return this.request('stations', _objectSpread({
      params
    }, config));
  }

  station(id, config = {}) {
    return this.request(`stations/${id}`, config);
  }

  data(params = {}, config = {}) {
    return this.request('data', _objectSpread({
      params
    }, config));
  }

  all(method
  /*, params={}*/
  , ...args
  /*, iteratee */
  ) {
    let iteratee = args.pop();
    let params = args.shift() || {};
    if (typeof method === 'string') method = _lodash.default.get(this, method);
    return method.call(this, params, ...args).then(res => Promise.resolve(iteratee(res)).then(done => {
      if (done) return res;
      let nextParams = this.constructor.paramsForNextPage((0, _lodash.default)(res.metadata.resultset).pick('offset', 'limit').defaults(params).value());
      if (params.offset >= nextParams.offset - nextParams.limit) return null;
      return this.all(method, nextParams, ...args, iteratee);
    }));
  }

  static paramsForNextPage(currentPageParams) {
    return CDO._paramsForSiblingPage(currentPageParams, 'next');
  }

  static paramsForPrevPage(currentPageParams) {
    return CDO._paramsForSiblingPage(currentPageParams, 'prev');
  }

  static _paramsForSiblingPage(currentPageParams = {}, direction) {
    let {
      offset,
      limit = this.DEFAULT_LIMIT
    } = currentPageParams;
    if (typeof offset !== 'number' || offset < 0) offset = 0;else offset = {
      next: offset + limit,
      prev: offset - limit
    }[direction];
    return _lodash.default.defaults({
      offset,
      limit
    }, currentPageParams);
  }

  request(resource, config = {}) {
    let mergedConfig = _lodash.default.merge({
      baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
      headers: {
        token: this.token
      }
    }, this.opts.config, {
      params: this.opts.params
    }, config);

    let params = mergedConfig.params || {};
    ['startdate', 'enddate'].forEach(prop => {
      if (prop in params) params[prop] = CDO.formatDate(params[prop]);
    });
    let readableURL = `/${resource}${_lodash.default.isEmpty(params) ? '' : ' '}${_querystring.default.stringify(params)}`;
    return Promise.all([this.secondLimiter(), this.dayLimiter()]).then(() => (0, _axios.default)(resource, mergedConfig)).catch(res => {
      let {
        status,
        statusText
      } = res;
      debug(`%s (%s %s)`, readableURL, status, statusText);
      if (status === 429) return this.request.apply(this, arguments); // rate limited, try again

      throw res;
    }).then(({
      status,
      statusText,
      data
    }) => {
      debug(`%s (%s %s)`, readableURL, status, statusText);
      return data;
    });
  }

  static formatDate(date) {
    if (typeof date === 'string') return date;
    date = new Date(date);
    return `${date.getUTCFullYear()}-${CDO._formatDatePart(date.getUTCMonth() + 1)}-${CDO._formatDatePart(date.getUTCDate())}`;
  }

  static _formatDatePart(part) {
    return _lodash.default.padStart(part, 2, '0');
  }

}

CDO.RATE_LIMIT_EPSILON_MS = 200;
CDO.DEFAULT_LIMIT = 25;
module.exports = CDO;