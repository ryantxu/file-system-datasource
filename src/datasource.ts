import * as FS from "./FileSystem";
import { NginxFileSystem } from "./fs/NginxFileSystem";
import { LocalFileSystem } from "./fs/LocalFileSystem";
import { S3FileSystem } from "./fs/S3FileSystem";
import { UnknownFileSystem } from "./fs/UnknownFileSystem";
import { ResponseParser, Table } from "./response_parser";

import { CSVResponseParser } from "./fmt/csv_parser";
import { JSONResponseParser } from "./fmt/json_parser";
import { AvroResponseParser } from "./fmt/avro_parser";

import _ from "lodash";

class CachedTable {
  path: string;
  timestamp: number;
  table: Table;
}

export default class FileSystemDatasource {
  interval: any;

  supportsExplore: boolean = true;
  supportAnnotations: boolean = true;
  supportMetrics: boolean = true;

  fs: FS.FileSystem;

  parsers: Map<string, ResponseParser> = new Map();

  /** @ngInject */
  constructor(instanceSettings, public backendSrv, public templateSrv) {
    const safeJsonData = instanceSettings.jsonData || {};

    this.interval = safeJsonData.timeInterval;

    const type = safeJsonData.type;
    const builder = FileSystemDatasource.registry[type];
    if (builder) {
      this.fs = builder.create(instanceSettings, backendSrv);
    } else {
      this.fs = new UnknownFileSystem(instanceSettings, backendSrv);
    }

    this.parsers["csv"] = new CSVResponseParser(instanceSettings);
    this.parsers["avro"] = new AvroResponseParser(instanceSettings);
    this.parsers["json"] = new JSONResponseParser(instanceSettings);
  }

  static registry = {
    local: {
      name: "Local (host)",
      create: (instanceSettings: any, backendSrv: any) => {
        return new LocalFileSystem(instanceSettings, backendSrv);
      }
    },
    nginx: {
      name: "NGINX (json)",
      create: (instanceSettings: any, backendSrv: any) => {
        return new NginxFileSystem(instanceSettings, backendSrv);
      }
    },
    s3: {
      name: "Amazon S3",
      create: (instanceSettings: any, backendSrv: any) => {
        return new S3FileSystem(instanceSettings, backendSrv);
      }
    }
  };

  getFileSystem(): FS.FileSystem {
    return this.fs;
  }

  // Used for AdHock Filters
  getTagKeys(options) {
    console.log("getTagKeys", options);
    return Promise.resolve(["aaa", "bbb", "ccc"]);
  }

  // Used for AdHock Filters
  getTagValues(options) {
    console.log("getTagValues", options);
    return Promise.resolve(["aaa", "bbb", "ccc"]);
  }

  getTimeFilter(options): string {
    return "YYYYMMDD";
  }

  query(options) {
    // Replace grafana variables
    const timeFilter = this.getTimeFilter(options);
    options.scopedVars.range = { value: timeFilter };
    const queryTargets = options.targets
      .filter(target => target.path)
      .map(target => {
        target.req = this.templateSrv.replace(target.path, options.scopedVars);
        return target; // TODO change path
      });

    // Don't bother with the query
    if (queryTargets.length === 0) {
      return Promise.resolve({ data: [] });
    }

    // This gets a
    const queries = queryTargets.map(target => {
      const table = this._fetchOrUseCached(target.req);
      // TODO, depending on the target, it should filter the table
      // SELECT fieldname
      return table;
    });

    return Promise.all(queries).then((tables: any) => {
      let theData = _.flattenDeep(tables); //.slice(0, MAX_SERIES);
      return { data: theData };
    });
  }

  static cache = new Map<string, CachedTable>();
  _fetchOrUseCached(path: string): Promise<Table> {
    let t = FileSystemDatasource.cache.get(path);
    if (t && t.table) {
      return Promise.resolve(t.table);
    }

    // Find the extension
    let ext = "";
    let norm = path;
    let idx = norm.lastIndexOf("?");
    if (idx > 0) {
      norm = path.substring(0, idx);
    }
    idx = norm.lastIndexOf("#");
    if (idx > 0) {
      norm = path.substring(0, idx);
    }
    idx = norm.lastIndexOf(".");
    if (idx > 0) {
      ext = norm.substr(idx + 1).toLowerCase();
    }

    // Right now keyed to ending with .avro
    const isAvro = ext === "avro";
    const isBinary = isAvro;

    return this.fs.fetch(path, isBinary).then(res => {
      const headers = res.headers();
      const contentType = headers["content-type"];
      let parser = this.parsers["csv"]; // default
      if (contentType && contentType.indexOf("json") >= 0) {
        parser = this.parsers["json"];
      } else if (isAvro) {
        parser = this.parsers["avro"];
      }
      t = {
        path: path,
        table: parser.parse(res, contentType),
        timestamp: Date.now()
      };
      FileSystemDatasource.cache.set(path, t);
      return t.table;
    });
  }

  metricFindQuery(query: string, options?: any) {
    console.log("metricFindQuery", query, options);
    return Promise.resolve({ data: [] });
  }

  testDatasource() {
    // TODO, if it is a direct link to a file, just get it

    return this.fs
      .list("")
      .then((dir: FS.DirectoryInfo) => {
        return {
          status: "success",
          message: "Root Contains " + dir.files.length + " Files"
        };
      })
      .catch(err => {
        console.warn("Error Testing FileSystem", err, this.fs);
        return {
          status: "error",
          message: "Error: " + err
        };
      });
  }
}
