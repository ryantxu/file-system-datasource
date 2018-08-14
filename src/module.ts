import AvroDatasource from './datasource';
import { AvroQueryCtrl } from './query_ctrl';

class AvroConfigCtrl {
  static templateUrl = 'partials/config.html';
}

export {
  AvroDatasource as Datasource,
  AvroQueryCtrl as QueryCtrl,
  AvroConfigCtrl as ConfigCtrl
};
