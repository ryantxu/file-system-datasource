// import _ from 'lodash';

// import * as dateMath from 'grafana/app/core/utils/datemath';

// import {
//   getAnnotationsFromResult,
//   getTableModelFromResult,
//   getTimeSeriesFromResult,
//   getValuesFromResult,
//   parseResults,
// } from './response_parser';
// import expandMacros from './metric_find_query';

// function serializeParams(params) {
//   if (!params) {
//     return '';
//   }

//   return _.reduce(
//     params,
//     (memo: any[], value: string, key) => {
//       if (value === null || value === undefined) {
//         return memo;
//       }
//       memo.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
//       return memo;
//     },
//     []
//   ).join('&');
// }

export default class FileSystemDatasource {
  url: string;
  username: string;
  password: string;
  name: string;
  database: any;
  basicAuth: any;
  withCredentials: any;
  interval: any;

  supportsExplore: boolean = true;
  supportAnnotations: boolean = true;
  supportMetrics: boolean = true;

  /** @ngInject */
  constructor(instanceSettings, private backendSrv) {
    this.url = instanceSettings.url.trim();

    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.name = instanceSettings.name;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.interval = (instanceSettings.jsonData || {}).timeInterval;
    this.database = (instanceSettings.jsonData || {}).database;
    
  }

  // prepareQueryTarget(target, options) {
  //   // Replace grafana variables
  //   const timeFilter = this.getTimeFilter(options);
  //   options.scopedVars.range = { value: timeFilter };
  //   const interpolated = this.templateSrv.replace(target.query, options.scopedVars);
  //   return {
  //     ...target,
  //     query: interpolated,
  //   };
  // }

  query(options) {
    console.log( 'TODO, query', options );

    return Promise.all([]).then((series: any) => {
      return { data: [] };
    });
  }

  metricFindQuery(query: string, options?: any) {
    // const interpreted = expandMacros(query);

    // // Use normal querier in silent mode
    // const queryOptions = {
    //   rangeRaw: { to: 'now', from: 'now - 1h' },
    //   scopedVars: {},
    //   ...options,
    //   silent: true,
    // };
    // const target = this.prepareQueryTarget({ query: interpreted }, queryOptions);
    return Promise.resolve({ data: [] });
  }

  _seriesQuery(query: string, options?: any) {
    if (!query) {
      return Promise.resolve({ data: '' });
    }
    //return this._influxRequest('POST', '/v1/query', { q: query }, options);
    return Promise.resolve({ data: [] });
  }

  testDatasource() {
    if(false) {
      this.backendSrv.get('/xxx').then(res => {

      });
    }

    return Promise.resolve({ 
      status: 'success', message: 'dummy avro?'
    });
  }
}
