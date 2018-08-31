// export interface Annotation {
//   time: number;
//   tags: any[];
//   text: string;
//   annotation: any;
// }

export interface Table {
  type: string;
  columns: any[];
  rows: any[];
}

export abstract class ResponseParser {
  abstract parse(rsp: any): Table;
}
