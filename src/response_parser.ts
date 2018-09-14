
import _ from "lodash";

export interface Table {
  type: string;
  columns: any[];
  rows: any[];
}

export class SeriesInfo {
  order: string[] = [];
  series = new Map<string,any[]>();
}

export abstract class ResponseParser {
  abstract parse(rsp: any): Promise<Table>;
}

// Given a table with:
//   #time,field,value
// This will create a series for each one with the changes listed
export function processChanges(data: Table):SeriesInfo {
  const info = new SeriesInfo();
  if (data.columns.length != 3) {
    throw {
      status: "error",
      message: "Changes data expects 3 columns.  (when,field,value)"
    }
  }
  _.forEach(data.rows, row=> {
    if(row.length==3) {
      let time = row[0];
      if(typeof time === 'number') {
        const fname = row[1];
        if(!info.series.has(fname)) {
          info.order.push(fname);
          info.series.set(fname, []);
        }
        info.series.get(fname).push( [ row[2], time] );
      }
      else {
        console.log( 'Skipping: ', row );
      }
    }
  });
  return info;
}