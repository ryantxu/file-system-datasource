import _ from 'lodash';

export class FileInfo {
  name: string;
  modified: any; // moment(?)
  browsable: boolean = false;

  type?: string;
  url?: string;
  meta?: Map<string,object>;
}

export class DirectoryInfo {
  path: string;
  files: FileInfo[];
}

export abstract class FileSystem {
  /** @ngInject */
  constructor() {
    // maybe more things?
  }
  
  // List the directory contents
  abstract list(path:string, dir?:DirectoryInfo): Promise<DirectoryInfo>;

  // Check if the datasource is configured properly
  public test(): Promise<any> {
    return this.list('').then( (dir:DirectoryInfo)=> {
      return { 
        status: 'success', message: 'Root Contains '+dir.files.length + 'files'
      }
    });
  }
}

