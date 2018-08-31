import _ from "lodash";

import { UnknownFileSystem } from "./UnknownFileSystem";

export class S3FileSystem extends UnknownFileSystem {
  /** @ngInject */
  constructor(instanceSettings, protected backendSrv) {
    super(instanceSettings, backendSrv);
  }
}
