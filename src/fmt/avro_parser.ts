import { ResponseParser, Table } from "../response_parser";

import _ from "lodash";

import { createBlobDecoder } from 'avsc';

export class AvroResponseParser extends ResponseParser {
  /** @ngInject */
  constructor(instanceSettings) {
    super();
  }

  decode(decoder:any): Promise<Table> {
    return new Promise( (resolve, reject) => {
      const table = {
        type: "table",
        rows: [],
        columns: [],
      };
      const nameToColumnIndex = new Map<string,number>();
      decoder.on('metadata', (type, codec, header) => {
       // const s = decoder.getSchema();
        console.log('meta.type', type);
        console.log('meta.codec', codec);
        console.log('meta.header', header);

        const s = type.getSchema({exportAttrs: true});
        _.forEach(s.fields, (f)=> {
          if(!nameToColumnIndex.has(f.name)) {
            const col = {
              text: f.name
            };
            table.columns.push(col);
            nameToColumnIndex.set(f.name, table.columns.length-1);
          }
        });
      })
      .on('data', (obj) => {
        const len = table.columns.length;
        const row = new Array(len);
        for(let i=0; i<len; i++) {
          const fname = table.columns[i].text;
          row[i] = obj[fname];
        }
        table.rows.push(row);
      })
      .on('end', () => {
        console.log('end');
        resolve(table);
      })
      .on('error', (err) => {
        console.warn('error', err);
        reject( {
          message: 'Error Parsing Avro File',
          error: err,
        });
      });
    });
  }

  /**
   * @override
   */
  parse(rsp: any, contentType?:string): Promise<Table> {
    if (rsp.data) {
      if(rsp.data instanceof Blob) {
        return this.decode( createBlobDecoder(rsp.data, {}) );
      }
      
      return Promise.reject( {
        message: "Avro expects a blob response",
        data: rsp.data,
        config: rsp.config
      }) as any;
    }

    return Promise.reject( {
        message: "Missing Data in response: " + rsp.statusText,
        config: rsp.config
      }) as any;
  }
}
