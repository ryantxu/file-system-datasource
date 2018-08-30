import _ from 'lodash';

import * as FS from '../FileSystem';
import {HttpFileSystem} from './HttpFileSystem';

export class NginxFileSystem extends HttpFileSystem {

  /** @ngInject */
  constructor(instanceSettings, protected backendSrv) {
    super(instanceSettings, backendSrv);
  }

  list(path:string, dir?:FS.DirectoryInfo): Promise<FS.DirectoryInfo> {
    let base = this.url + path;
    if(dir && dir.path) {
      if(path =='..') {
        base = this.url + dir.path.substring(dir.path.lastIndexOf('/'));
      }
      else {
        base = this.url + dir.path + path
      }
    }
    if(!base.endsWith('/')) {
      base += '/';
    }
    return this.backendSrv({
      method: 'GET',
      url: base,
    }).then( rsp => {
      let d = new FS.DirectoryInfo();
      d.path = base.substring(this.url.length);
      d.files = _.map(rsp.data, (r) => {
        let f = new FS.FileInfo();
        f.name = r.name;
        f.type = r.type;
        f.browsable = ('directory'===r.type);
        if(!f.browsable) {
          f.url = base + f.name;
        }
        return f;
      });
      return d; 
    });
  }
}