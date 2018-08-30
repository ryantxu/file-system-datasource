import _ from 'lodash';

import * as FS from '../FileSystem';

/**
 * General class for things with HTTP Requests
 */
export abstract class HttpFileSystem extends FS.FileSystem {
  url: string;
  username: string;
  password: string;
  name: string;
  database: any;
  basicAuth: any;
  withCredentials: any;

  /** @ngInject */
  constructor(protected instanceSettings, protected backendSrv) {
    super();

    this.url = instanceSettings.url.trim();

    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.name = instanceSettings.name;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.database = (instanceSettings.jsonData || {}).database;
  }
}