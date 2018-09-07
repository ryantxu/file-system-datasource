import * as FS from "../FileSystem";

export class UnknownFileSystem extends FS.FileSystem {
  fstype: string;

  /** @ngInject */
  constructor(public instanceSettings, protected backendSrv) {
    super();

    this.fstype = (instanceSettings.jsonData || {}).type;
  }

  list(path: string): Promise<FS.DirectoryInfo> {
    return new Promise<FS.DirectoryInfo>((resolve, reject) => {
      reject("File System List not supported: " + this.fstype);
    });
  }

  fetch(path: string, blob:boolean=false): Promise<any> {
    return new Promise<FS.DirectoryInfo>((resolve, reject) => {
      reject("Fetch Not Supported Yet: " + this.fstype);
    });
  }
}
