import { trycatch } from "functools-kit";
import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

const TOOL_CALL_ENTRIES = ["tool_call", "toolcall", "tool"];

const DISALLOWED_SYMBOLS = [
  "{",
  "}",
];

/**
 * @description Validation for not parsed XML toolcall
 * @see https://github.com/ollama/ollama/issues/8287
 */
export const validateNoToolCall = trycatch(
  async (output: string) => {
    for (const symbol of DISALLOWED_SYMBOLS) {
      if (output.includes(symbol)) {
        return false;
      }
    }
    const result = await toolParser.parseStringPromise(output);
    for (const tag of TOOL_CALL_ENTRIES) {
      if (result[tag]) {
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
