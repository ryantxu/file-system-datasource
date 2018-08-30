import _ from 'lodash';

import * as FS from '../FileSystem';

export class S3FileSystem extends FS.FileSystem {

  /** @ngInject */
  constructor(instanceSettings, protected backendSrv) {
    super();
  }

  list(path:string): Promise<FS.DirectoryInfo> {
    return new Promise<FS.DirectoryInfo>((resolve, reject) => {
      reject('Not Supported Yet (S3)');
    });
  }
}