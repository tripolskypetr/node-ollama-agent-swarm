import { trycatch } from "functools-kit";
import { ioc } from "src/services";
import { IContext } from "src/services/base/ContextService";
import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

/**
 * @description Validation for not parsed XML toolcall
 * @see https://github.com/ollama/ollama/issues/8287
 */
export const validateNoToolCall = trycatch(
  async (output: string, context: IContext) => {
    const result = await toolParser.parseStringPromise(output);
    if (!result["toolcall"]) {
      return;
    }
    if (JSON.parse(result.toolcall)) {
      ioc.errorService.handleGlobalError(
        new Error(
          `Unhandler tool call found output=${output} context=${JSON.stringify(
            context
          )}`
        )
      );
    }
  }
);

export default validateNoToolCall;
