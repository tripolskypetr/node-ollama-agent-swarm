import { run } from "worker-testbed";

import { CC_EXECUTE_TEST } from "src/config/params";

import "./spec/sales_navigation.test";

if (CC_EXECUTE_TEST) {
    run(import.meta.url, () => {
        console.log("All tests finished");
        process.exit(-1);
    });
}
