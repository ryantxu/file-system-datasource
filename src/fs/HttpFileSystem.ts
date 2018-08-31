import _ from "lodash";

import * as FS from "../FileSystem";

/**
 * General class for things with HTTP Requests
 */
export abstract class HttpFileSystem extends FS.FileSystem {
  url: string;
  username: string;
  password: string;
  basicAuth: any;
  withCredentials: any;

  /** @ngInject */
  constructor(protected instanceSettings, protected backendSrv) {
    super();

    this.url = instanceSettings.url.trim();
    this.username = instanceSettings.username;
    this.password = instanceSettings.password;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
  }

  safeMergeURL(path: string): string {
    if (path) {
      if (path.startsWith("/")) {
        if (this.url.endsWith("/")) {
          return this.url + path.substr(1);
        }
      }
      return this.url + path;
    }
    return this.url;
  }

  // basic get request
  fetch(path: string): Promise<any> {
    return this.request({
      url: this.safeMergeURL(path),
      method: "GET"
    });
  }

  request(req: any): Promise<any> {
    return this.backendSrv.datasourceRequest(req).then(
      result => {
        return result;
      },
      function(err) {
        if (err.status !== 0 || err.status >= 300) {
          if (err.data && err.data.error) {
            throw {
              message: "HttpFileSystem Error: " + err.data.error,
              data: err.data,
              config: err.config
            };
          }
        }
        if(err.err) {
          err = err.err;
        }
        throw {
          message:
            "Network Error: " + err.statusText + "(" + err.status + ")",
          data: err.data,
          config: err.config
        };
      }
    );
  }
}
