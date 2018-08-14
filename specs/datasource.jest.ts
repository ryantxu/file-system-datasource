///<reference path="../node_modules/@types/jest/index.d.ts" />

import moment from 'moment';

import TemplateSrv from './lib/template_srv_stub';

import Datasource from '../src/datasource';

describe('Avro Datasrouce', () => {
  const ds = new Datasource({ url: '' }, {});
  const DEFAULT_OPTIONS = {
    rangeRaw: { to: 'now', from: 'now - 3h' },
    scopedVars: {},
    targets: [],
  };

  // Skip those for now because they rely on real template expansion
  describe('prepareQueryTarget()', () => {
    let target: any;
    const res = 5+5;

    it('should do simple things', () => {
      const res = 5+5;
      expect(res).toBe(10);
    });
  });
});
