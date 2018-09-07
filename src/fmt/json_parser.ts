import { ResponseParser, Table } from "../response_parser";

import _ from "lodash";

//import flatten from 'app/core/utils/flatten';
// Copyright (c) 2014, Hugh Kennedy
// Based on code from https://github.com/hughsk/flat/blob/master/index.js
//
export default function flatten(target, opts): any {
  opts = opts || {};

  const delimiter = opts.delimiter || ".";
  let maxDepth = opts.maxDepth || 3;
  let currentDepth = 1;
  const output = {};

  function step(object, prev) {
    Object.keys(object).forEach(function(key) {
      const value = object[key];
      const isarray = opts.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isobject = type === "[object Object]";

      const newKey = prev ? prev + delimiter + key : key;

      if (!opts.maxDepth) {
        maxDepth = currentDepth + 1;
      }

      if (
        !isarray &&
        isobject &&
        Object.keys(value).length &&
        currentDepth < maxDepth
      ) {
        ++currentDepth;
        return step(value, newKey);
      }

      output[newKey] = value;
    });
  }

  step(target, null);

  return output;
}

export class JSONResponseParser extends ResponseParser {
  /** @ngInject */
  constructor(instanceSettings) {
    super();
  }

  _arrayToTable(arr: any[]): Table {
    let table = {
      type: "table",
      columns: [],
      rows: []
    };

    const flat: any[] = [];
    const names: string[] = [];
    const found: any = {};
    for (let i = 0; i < arr.length; i++) {
      const f = flatten(arr[i], null);
      for (const propName in f) {
        if (!found.hasOwnProperty(propName)) {
          found[propName] = true;
          names.push(propName);
          table.columns.push({
            text: propName
          });
        }
      }
      flat.push(f);
    }

    // Add each value
    _.forEach(flat, f => {
      let row = [];
      for (let i = 0; i < names.length; i++) {
        row.push(_.get(f, names[i]));
      }
      table.rows.push(row);
    });
    return table;
  }

  _toTable(data): Table {
    if (_.isArray(data)) {
      return this._arrayToTable(data);
    }
    const keys = _.keys(data);
    if (keys.length == 1) {
      const first = data[keys[0]];
      if (_.isArray(first)) {
        return this._arrayToTable(first);
      }
    }

    // This will be a table with a single row
    const table = {
      type: "table",
      rows: [],
      columns: []
    };
    const row = [];
    table.rows.push(row);
    _.forEach(data, (value, key) => {
      table.columns.push({
        text: key
      });
      row.push(value);
    });
    return table;
  }

  parse(rsp: any, contentType?: string): Promise<Table> {
    return new Promise((resolve, reject) => {
      if (rsp.data) {
        resolve(this._toTable(rsp.data));
      } else {
        reject({
          message: "Invalid response: " + rsp.statusText,
          data: rsp.data,
          config: rsp.config
        });
      }
    });
  }
}

// // COPIED FROM:
// // https://github.com/grafana/influxdb-flux-datasource/blob/master/src/response_parser.ts

// interface Annotation {
//   time: number;
//   tags: any[];
//   text: string;
//   annotation: any;
// }

// const filterColumnKeys = key => key && key[0] !== '_' && key !== 'result' && key !== 'table';

// const IGNORE_FIELDS_FOR_NAME = ['result', '', 'table'];

// export const getTagsFromRecord = record =>
//   Object.keys(record)
//     .filter(key => key[0] !== '_')
//     .filter(key => IGNORE_FIELDS_FOR_NAME.indexOf(key) === -1)
//     .reduce((tags, key) => {
//       tags[key] = record[key];
//       return tags;
//     }, {});

// export const getNameFromRecord = record => {
//   // Measurement and field
//   const metric = [record._measurement, record._field];

//   // Add tags
//   const tags = getTagsFromRecord(record);
//   const tagValues = Object.keys(tags).map(key => `${key}=${tags[key]}`);

//   return [...metric, ...tagValues].join(' ');
// };

// const parseCSV = (input: string) =>
//   Papa.parse(input, {
//     header: false,
//     dynamicTyping: true,
//   }).data;

// export const parseValue = (input: string) => {
//   const value = parseFloat(input);
//   return isNaN(value) ? null : value;
// };

// export const parseTime = (input: string) => Date.parse(input);

// export function parseResults(response: string): any[] {
//   return response.trim().split(/\n\s*\s/);
// }

// export function getAnnotationsFromResult(result: string, options: any) {
//   const data = parseCSV(result);
//   if (data.length === 0) {
//     return [];
//   }

//   const annotations: Annotation[] = [];
//   const textSelector = options.textCol || '_value';
//   const tagsSelector = options.tagsCol || '';
//   const tagSelection = tagsSelector.split(',').map(t => t.trim());

//   data.forEach(record => {
//     // Remove empty values, then split in different tags for comma separated values
//     const tags = getTagsFromRecord(record);
//     const tagValues = flatten(tagSelection.filter(tag => tags[tag]).map(tag => tags[tag].split(',')));

//     annotations.push({
//       annotation: options,
//       time: parseTime(record._time),
//       tags: tagValues,
//       text: record[textSelector],
//     });
//   });

//   return annotations;
// }

// export function getTableModelFromResult(result: string) {
//   const data = parseCSV(result);

//   const table: Table = { type: 'table', columns: [], rows: [] };
//   if (data.length > 0) {
//     // First columns are fixed
//     const firstColumns = [
//       { text: 'Time', id: '_time' },
//       { text: 'Measurement', id: '_measurement' },
//       { text: 'Field', id: '_field' },
//     ];

//     // Dynamically add columns for tags
//     const firstRecord = data[0];
//     const tags = Object.keys(firstRecord)
//       .filter(filterColumnKeys)
//       .map(key => ({ id: key, text: key }));

//     const valueColumn = { id: '_value', text: 'Value' };
//     const columns = [...firstColumns, ...tags, valueColumn];
//     columns.forEach(c => table.columns.push(c));

//     // Add rows
//     data.forEach(record => {
//       const row = columns.map(c => record[c.id]);
//       table.rows.push(row);
//     });
//   }

//   return table;
// }

// export function getTimeSeriesFromResult(result: string) {
//   const data = parseCSV(result);
//   if (data.length === 0) {
//     return [];
//   }

//   // Group results by table ID (assume one table per timeseries for now)
//   const tables = groupBy(data, 'table');
//   const seriesList = Object.keys(tables)
//     .map(id => tables[id])
//     .map(series => {
//       const datapoints = series.map(record => [parseValue(record['_value']), parseTime(record['_time'])]);
//       const alias = getNameFromRecord(series[0]);
//       return { datapoints, target: alias };
//     });

//   return seriesList;
// }

// export function getValuesFromResult(result: string) {
//   const data = parseCSV(result);
//   return data.map(record => record['_value']);
// }
