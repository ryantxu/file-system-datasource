import _ from "lodash";

import { UnknownFileSystem } from "./UnknownFileSystem";

export class LocalFileSystem extends UnknownFileSystem {
  /** @ngInject */
  constructor(instanceSettings, protected backendSrv) {
    super(instanceSettings, backendSrv);
  }
}
