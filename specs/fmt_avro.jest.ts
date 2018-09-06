///<reference path="../node_modules/@types/jest/index.d.ts" />

import moment from 'moment';

import TemplateSrv from './lib/template_srv_stub';

import { createFileDecoder, Type } from 'avsc';

import { AvroResponseParser } from '../src/fmt/avro_parser';
import { ResponseParser, Table } from "../src/response_parser";

describe('Avro Format Parser', () => {
  const parser = new AvroResponseParser( {} );

  // Skip those for now because they rely on real template expansion
  describe('check avsc FileDecoder', () => {
    let target: any;
    const res = 5+5;

    const decoder:any = createFileDecoder('./specs/data/all-zeros.avro');
    it('decode the local file ', () => {
      return parser.decode(decoder).then( (table:Table) => {
        console.log( 'GOT', table );

        const res = 5+5;
        expect(res).toBe(10);
      });
    });
  });
});
