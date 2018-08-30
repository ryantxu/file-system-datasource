///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import FileSystemDatasource from './datasource';
import { FSQueryCtrl } from './query_ctrl';
import { FSConfigCtrl } from './config_ctrl';


export {
  FileSystemDatasource as Datasource,
  FSQueryCtrl as QueryCtrl,
  FSConfigCtrl as ConfigCtrl
};
