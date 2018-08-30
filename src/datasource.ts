import * as FS from './FileSystem';
import {NginxFileSystem} from './fs/NginxFileSystem';
import {LocalFileSystem} from './fs/LocalFileSystem';
import {S3FileSystem} from './fs/S3FileSystem';
import { UnknownFileSystem } from './fs/UnknownFileSystem';


export default class FileSystemDatasource {
  interval: any;

  supportsExplore: boolean = true;
  supportAnnotations: boolean = true;
  supportMetrics: boolean = true;

  fs: FS.FileSystem;

  /** @ngInject */
  constructor(instanceSettings, public backendSrv) {
    this.interval = (instanceSettings.jsonData || {}).timeInterval;

    const type = instanceSettings.jsonData.type;
    const builder = FileSystemDatasource.registry[type];
    if(builder) {
      this.fs = builder.create(instanceSettings, backendSrv);
    }
    else {
      this.fs =new UnknownFileSystem(instanceSettings, backendSrv);
    }
  }

  static registry = {
    local: {
      name: 'Local (host)',
      create: (instanceSettings:any, backendSrv:any) => { return new LocalFileSystem(instanceSettings, backendSrv) }
    },
    nginx: {
      name: 'NGINX (json)',
      create: (instanceSettings:any, backendSrv:any) => { return new NginxFileSystem(instanceSettings, backendSrv) }
    },
    s3: {
      name: 'Amazon S3',
      create: (instanceSettings:any, backendSrv:any) => { return new S3FileSystem(instanceSettings, backendSrv) }
    }
  };

  getFileSystem(): FS.FileSystem {
    return this.fs;
  }

  // Used for AdHock Filters
  getTagKeys(options) {
    console.log( 'getTagKeys', options );
    return Promise.resolve( ['aaa','bbb','ccc'] );
  }

  // Used for AdHock Filters
  getTagValues(options) {
    console.log( 'getTagValues', options );
    return Promise.resolve( ['aaa','bbb','ccc'] );
  }

  query(options) {
    console.log( 'TODO, query', options );
    return Promise.all([]).then((series: any) => {
      return { data: [] };
    });
  }

  metricFindQuery(query: string, options?: any) {
    console.log( 'metricFindQuery', query, options );
    return Promise.resolve({ data: [] });
  }

  testDatasource() {
    // TODO, if it is a direct link to a file, just get it

    return this.fs.list('').then( (dir:FS.DirectoryInfo)=> {
      return { 
        status: 'success', message: 'Root Contains '+dir.files.length + ' Files'
      }
    }).catch( err => {
      console.warn( 'Error Testing FileSystem', err, this.fs );
      return { 
        status: 'error', 
        message: 'Error: '+err
      }
    });
  }
}
