import { trycatch } from "functools-kit";
import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

const TOOL_CALL_ENTRIES = ["tool_call", "toolcall"];

const tryParse = trycatch((text: string) => JSON.parse(text), {
  defaultValue: null,
});

/**
 * @description Validation for not parsed XML toolcall
 * @see https://github.com/ollama/ollama/issues/8287
 */
export const validateNoToolCall = trycatch(
  async (output: string) => {
    const parsedResult = tryParse(output);
    if (parsedResult?.type === "function") {
        return false;
    }
    const result = await toolParser.parseStringPromise(output);
    for (const tag of TOOL_CALL_ENTRIES) {
      const parseResult = tryParse(result[tag]);
      if (parseResult) {
        return false;
      }
    }
    return true;
  },
  {
    defaultValue: true,
  }
);

export default validateNoToolCall;
