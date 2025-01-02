import xml2js from "xml2js";

const toolParser = new xml2js.Parser();

/**
 * @description The fallback to handle NVidia nemotron-mini model
 * @see https://github.com/ollama/ollama/issues/8287
 */
export const parseRawToolCall = async (output: string) => {
    try {
        const result = await toolParser.parseStringPromise(output);
        if (!result["tool_call"]) {
            return null;
        }
        return null;
    } catch {
        return null;
    }
};

export default parseRawToolCall;
