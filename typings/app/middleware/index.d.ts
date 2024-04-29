// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportLogger from '../../../app/middleware/logger';
import ExportMyLogger from '../../../app/middleware/myLogger';

declare module 'egg' {
  interface IMiddleware {
    logger: typeof ExportLogger;
    myLogger: typeof ExportMyLogger;
  }
}
