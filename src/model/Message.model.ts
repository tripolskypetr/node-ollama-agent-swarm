import { AgentName } from "src/utils/getAgentMap";

export interface IMessage {
  clientId: string;
  stamp: string;
  data: string;
  agentName: AgentName;
}

export default IMessage;
