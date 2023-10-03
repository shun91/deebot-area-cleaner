import ecovacsDeebot from "ecovacs-deebot";
import { machineIdSync } from "node-machine-id";

// The account_id is your Ecovacs ID or email address.
const account_id = process.env.ACCOUNT_ID ?? "";
const password = process.env.PASSWORD ?? "";
const targetAreas = process.env.TARGET_AREAS ?? "";
const deviceID = 0; // The first vacuum from your account

class VacbotSingleton {
  private static instance: any;

  private constructor() {
    // do something construct...
  }

  static async getInstance() {
    if (!VacbotSingleton.instance) {
      const EcoVacsAPI = ecovacsDeebot.EcoVacsAPI;

      // You need to provide a device ID uniquely identifying the
      // machine you're using to connect, the country you're in.
      // The module exports a countries object which contains a mapping
      // between country codes and continent codes.
      const countryCode = "JP"; // If it doesn't appear to work try "ww", their world-wide catchall.
      const device_id = EcoVacsAPI.getDeviceId(machineIdSync(), deviceID);
      const continent =
        ecovacsDeebot.countries[countryCode].continent.toLowerCase();
      // Leave blank or use 'ecovacs.com' for Ecovacs login
      // or use 'yeedi.com' for yeedi login (available since version 0.8.3-alpha.2)
      const authDomain = "";

      let api = new EcoVacsAPI(device_id, countryCode, continent, authDomain);

      // The password_hash is an md5 hash of your Ecovacs password.
      const password_hash = EcoVacsAPI.md5(password);

      // This logs you in through the HTTP API and retrieves the required
      // access tokens from the server side. This allows you to requests
      // the devices linked to your account to prepare connectivity to your vacuum.
      try {
        await api.connect(account_id, password_hash);
      } catch (e) {
        console.error("Failure in connecting!");
        console.error(e);
      }
      const devices = await api.devices();

      console.info("Devices:", JSON.stringify(devices));

      let vacuum = devices[deviceID];
      // https://github.com/mrbungle64/ecovacs-deebot.js/blob/master/types/library/vacBot.d.ts
      VacbotSingleton.instance = api.getVacBot(
        api.uid,
        EcoVacsAPI.REALM,
        api.resource,
        api.user_access_token,
        vacuum,
        continent
      );
    }
    return VacbotSingleton.instance;
  }
}

export const cleanSpotArea = async () => {
  const vacbot = await VacbotSingleton.getInstance();

  // Once the session has started the bot will fire a 'ready' event.
  // At this point you can request information from your vacuum or send actions to it.
  const promise = new Promise<void>((resolve) => {
    vacbot.on("ready", (event: any) => {
      console.info("vacbot ready");

      vacbot.run("GetCleanState");
      vacbot.on("CleanReport", (value: any) => {
        console.info("Clean status", value);
        if (value === "spot_area") {
          vacbot.disconnect();
          console.info("disconnected");
          resolve();
        }
      });

      vacbot.run("SpotArea", "start", targetAreas);
      console.info("ran SpotArea");
    });
  });

  vacbot.connect();

  return promise;
};
