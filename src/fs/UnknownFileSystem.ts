import * as FS from '../FileSystem';

export class UnknownFileSystem extends FS.FileSystem {

  /** @ngInject */
  constructor(public instanceSettings, protected backendSrv) {
    super();
  }

  list(path:string): Promise<FS.DirectoryInfo> {
    return new Promise<FS.DirectoryInfo>((resolve, reject) => {
      reject('Unknown FileSystem: '+this.instanceSettings.jsonData.type);
    });
  }
}