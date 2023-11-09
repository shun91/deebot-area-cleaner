import { EcoVacsAPI } from "ecovacs-deebot";
import { machineIdSync } from "node-machine-id";

// The account_id is your Ecovacs ID or email address.
const accountId = process.env.ACCOUNT_ID ?? "";
const password = process.env.PASSWORD ?? "";
const deviceID = 0; // The first vacuum from your account

export class VacbotSingleton {
  // https://github.com/mrbungle64/ecovacs-deebot.js/blob/master/types/library/vacBot.d.ts
  private static instance: any;

  private constructor() {
    // do nothing
  }

  static async getInstance() {
    if (!VacbotSingleton.instance) {
      const deviceId = EcoVacsAPI.getDeviceId(machineIdSync(), deviceID);
      const api = new EcoVacsAPI(deviceId, "JP", "", "");
      try {
        await api.connect(accountId, EcoVacsAPI.md5(password));
      } catch (e) {
        console.error("Failure in connecting!");
        console.error(e);
      }
      const devices = await api.devices();
      console.info("Devices:", JSON.stringify(devices));

      VacbotSingleton.instance = api.getVacBot(
        api.uid,
        EcoVacsAPI.REALM,
        api.resource,
        api.user_access_token,
        devices[deviceID],
        api.getContinent()
      );
    }
    return VacbotSingleton.instance;
  }
}
