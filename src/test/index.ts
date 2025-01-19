import { run } from "worker-testbed";

import { CC_EXECUTE_TEST } from "src/config/params";

import "./spec/navigation_registry.test";
import "./spec/pharma_product_registry.test";

if (CC_EXECUTE_TEST) {
    run(import.meta.url, () => {
        console.log("All tests finished");
        setTimeout(() => process.exit(-1), 5_000);
    });
}
