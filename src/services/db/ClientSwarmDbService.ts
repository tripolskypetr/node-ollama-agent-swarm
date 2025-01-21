import BaseMap from "src/common/BaseMap";
import { CC_CLIENT_SESSION_EXPIRE_SECONDS } from "src/config/params";
import { obsolete, singleshot } from "functools-kit";

export class ClientSwarmDbService extends BaseMap(
  "node-ollama-agent-swarm__clientSwarmDb",
  {
    TTL_EXPIRE_SECONDS: CC_CLIENT_SESSION_EXPIRE_SECONDS,
  }
) {

  private readonly getMap = singleshot(async () => {
    this.loggerService.logCtx(
      `clientSwarmDbService getMap connection=${this.connectionKey}`);
    const valueMap = new Map<string, any>();
    for await (const key of super.keys()) {
      valueMap.set(key, await super.get(key));
    }
    return valueMap;
  });

  setWithKeepExpire = obsolete(
    async (key: string, value: any): Promise<void> => {
      this.loggerService.logCtx(
        `clientSwarmDbService setWithKeepExpire key=${key} connection=${this.connectionKey}`,
        { key, value }
      );
      const valueMap = await this.getMap();
      valueMap.set(key, value);
      await super.setWithKeepExpire(key, value);
    },
    "clientSwarmDbService setWithKeepExpire"
  );

  set = async (key: string, value: any): Promise<void> => {
    this.loggerService.logCtx(
      `clientSwarmDbService set key=${key} connection=${this.connectionKey}`,
      { key, value }
    );
    const valueMap = await this.getMap();
    valueMap.set(key, value);
    await super.set(key, value);
  };

  get = async (key: string): Promise<any | null> => {
    this.loggerService.logCtx(
      `clientSwarmDbService get key=${key} connection=${this.connectionKey}`
    );
    const valueMap = await this.getMap();
    return valueMap.get(key);
  };

  delete = async (key: string): Promise<void> => {
    this.loggerService.logCtx(
      `clientSwarmDbService delete key=${key} connection=${this.connectionKey}`
    );
    const valueMap = await this.getMap();
    valueMap.delete(key);
    await super.delete(key);
  };

  has = obsolete(async (key: string): Promise<boolean> => {
    this.loggerService.logCtx(
      `clientSwarmDbService has key=${key} connection=${this.connectionKey}`
    );
    return await super.has(key);
  }, "clientSwarmDbService has");

  clear = async (): Promise<void> => {
    this.loggerService.logCtx(
      `clientSwarmDbService clear connection=${this.connectionKey}`
    );
    const valueMap = await this.getMap();
    valueMap.clear();
    await super.clear();
  };

  getFirst = obsolete(async (): Promise<any | null> => {
    this.loggerService.logCtx(
      `clientSwarmDbService getFirst connection=${this.connectionKey}`
    );
    const valueMap = await this.getMap();
    return valueMap.values().next().value;
  }, "clientSwarmDbService getFirst");

  shift = obsolete(async (): Promise<any | null> => {
    this.loggerService.logCtx(
      `clientSwarmDbService shift connection=${this.connectionKey}`
    );
    return await super.shift();
  }, "clientSwarmDbService shift");

  size = obsolete(async (): Promise<number> => {
    this.loggerService.logCtx(
      `clientSwarmDbService size connection=${this.connectionKey}`
    );
    return await super.size();
  }, "clientSwarmDbService size");
}

export default ClientSwarmDbService;
