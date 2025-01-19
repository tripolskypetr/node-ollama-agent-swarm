import { ioc } from "src/services";
import { test } from "worker-testbed";

test("Will execute tool ASAP after navigation to sales agent", async (t) => {
    const output = await ioc.specPublicService.complete("I want to buy the pharma product which cures flu. like aspirin");
    if (await ioc.specPublicService.getAgentName() !== "sales-agent") {
        t.fail(`Navigation failed, agent=${await ioc.specPublicService.getAgentName()}`);
        return;
    }
    if (output.toLowerCase().includes("Paracetamol".toLowerCase())) {
        t.pass(`Successfully called list product tools in agent output=${output}`);
    }
    t.fail(`Output compare failed, agent=${await ioc.specPublicService.getAgentName()} output=${output}`);
});

