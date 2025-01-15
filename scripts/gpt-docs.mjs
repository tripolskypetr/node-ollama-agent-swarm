import { globSync } from "glob";
import { basename, join, extname, resolve } from "path";

import { createCompletion, loadModel } from "gpt4all";

import fs from "fs";

const MODULE_NAME = "node-ollama-agent-swarm";

const GPT_PROMPT =
  "Please write a summary for that Typescript API Reference with several sentences in more human way";

console.log("Loading model");

const model = await loadModel("Nous-Hermes-2-Mistral-7B-DPO.Q4_0.gguf", {
    verbose: true,
});

const generateDescription = async (filePath) => {
    console.log(`Generating content for ${resolve(filePath)}`);
    console.time("EXECUTE");
    const data = fs.readFileSync(filePath).toString();
    const chat = await model.createChatSession({
        temperature: 0.8,
        systemPrompt: `### System:\n${GPT_PROMPT}.\n\n`,
    });
    const result = await createCompletion(chat, data);
    console.timeEnd("EXECUTE");
    return result.choices[0].message.content;
}

// Modules
{
    const classList = globSync(`./docs/classes/*`);
    const outputPath = join(process.cwd(), 'docs', `${MODULE_NAME}.md`);
    const output = [];
    output.push(`# ${MODULE_NAME}`);
    output.push("");
    if (!classList.length) {
        output.push("No data available");
    }
    for (const classPath of classList) {
        const className = basename(classPath, extname(classPath));
        output.push(`## ${className}`);
        output.push("");
        output.push(await generateDescription(classPath))
        output.push("");
        fs.writeFileSync(outputPath, output.join("\n"));
    }
}
