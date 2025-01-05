import "../build/index.mjs";

import * as momentStamp from "get-moment-stamp";

{
  globalThis.momentStamp = momentStamp;
}

process.exit = (statuscode) => {
  console.log('Exit prevented', { statuscode })
}

ioc.loggerService.setPrefix("host-repl");
ioc.loggerService.setDebug(false);
