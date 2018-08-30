import _ from 'lodash';

import * as FS from '../FileSystem';
import {HttpFileSystem} from './HttpFileSystem';

export class NginxFileSystem extends HttpFileSystem {

  urlEndingWithSlash: string;

  /** @ngInject */
  constructor(instanceSettings, protected backendSrv) {
    super(instanceSettings, backendSrv);

    // Keep a version that ends with 
    this.urlEndingWithSlash = this.url;
    if(!this.urlEndingWithSlash.endsWith('/')) {
      this.urlEndingWithSlash = this.url + '/';
    }
  }

  static _makeSureItStartsAndEndsWithSlash(v:string):string {
    if(!v) {
      return '/';
    }
    if(!v.startsWith('/')) {
      v = '/' + v;
    }
    if(!v.endsWith('/')) {
      return v + '/';
    }
    return v;
  }

  list(path:string): Promise<FS.DirectoryInfo> {
    const req = NginxFileSystem._makeSureItStartsAndEndsWithSlash(path);
    if(req.indexOf('..')>=0) {
      return new Promise((resolve,reject) => {
        reject('No path manipulation alloed')
      });
    }
    const reqURL = this.urlEndingWithSlash + req.substr(1); 
    return this.backendSrv.datasourceRequest({
      url: reqURL,
      method: 'GET',
    }).then( rsp => {
      let d = new FS.DirectoryInfo();
      d.path = req;
      d.files = _.map(rsp.data, (r) => {
        let f = new FS.FileInfo();
        f.name = r.name;
        f.type = r.type;
        f.browsable = ('directory'===r.type);
        if(!f.browsable) {
          f.url = reqURL + f.name;
        }
        return f;
      });
      return d; 
    });
  }
}