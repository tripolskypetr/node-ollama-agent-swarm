import { ioc } from "src/services";
import { test } from "worker-testbed";

test("Will execute tool ASAP after navigation to sales agent", async (t) => {
    await ioc.specPublicService.complete("I want to buy the pharma product which cures flu. like aspirin");
    if (await ioc.specPublicService.getAgentName() !== "sales-agent") {
        t.fail(`Navigation failed, agent=${await ioc.specPublicService.getAgentName()}`);
        return;
    }
    const output = await ioc.specPublicService.complete("Search the database for keyword: 'Aspirin is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, or inflammation. It is commonly used to treat conditions such as headaches, muscle pain, arthritis, and minor aches and pains. It also helps prevent blood clots, reducing the risk of heart'");
    if (output.toLowerCase().includes("Aspirin".toLowerCase())) {
        t.pass(`Successfully called list product tools in agent output=${output}`);
    }
    t.fail(`Output compare failed, agent=${await ioc.specPublicService.getAgentName()} output=${output}`);
});

