import ecovacsDeebot from "ecovacs-deebot";
import { machineIdSync } from "node-machine-id";

const EcoVacsAPI = ecovacsDeebot.EcoVacsAPI;

// The account_id is your Ecovacs ID or email address.
const account_id = process.env.ACCOUNT_ID ?? "";
const password = process.env.PASSWORD ?? "";

const deviceID = 0; // The first vacuum from your account

// You need to provide a device ID uniquely identifying the
// machine you're using to connect, the country you're in.
// The module exports a countries object which contains a mapping
// between country codes and continent codes.
const countryCode = "jp"; // If it doesn't appear to work try "ww", their world-wide catchall.
const device_id = EcoVacsAPI.getDeviceId(machineIdSync(), deviceID);
const continent =
  ecovacsDeebot.countries[countryCode.toUpperCase()].continent.toLowerCase();
// Leave blank or use 'ecovacs.com' for Ecovacs login
// or use 'yeedi.com' for yeedi login (available since version 0.8.3-alpha.2)
const authDomain = "";

let api = new EcoVacsAPI(device_id, countryCode, continent, authDomain);

// The password_hash is an md5 hash of your Ecovacs password.
const password_hash = EcoVacsAPI.md5(password);

// This logs you in through the HTTP API and retrieves the required
// access tokens from the server side. This allows you to requests
// the devices linked to your account to prepare connectivity to your vacuum.
api
  .connect(account_id, password_hash)
  .then(() => {
    api.devices().then((devices) => {
      console.log("Devices:", JSON.stringify(devices));

      let vacuum = devices[deviceID];
      let vacbot = api.getVacBot(
        api.uid,
        EcoVacsAPI.REALM,
        api.resource,
        api.user_access_token,
        vacuum,
        continent
      );

      // Once the session has started the bot will fire a 'ready' event.
      // At this point you can request information from your vacuum or send actions to it.
      vacbot.on("ready", (event: any) => {
        console.log("vacbot ready");

        vacbot.run("BatteryState");
        vacbot.run("GetCleanState");
        vacbot.run("GetChargeState");

        vacbot.on("BatteryInfo", (battery: any) => {
          console.log("Battery level: " + Math.round(battery));
        });
        vacbot.on("CleanReport", (value: any) => {
          console.log("Clean status: " + value);
        });
        vacbot.on("ChargeState", (value: any) => {
          console.log("Charge status: " + value);
        });
      });
      vacbot.connect();
    });
  })
  .catch((e) => {
    console.error("Failure in connecting!");
    console.log(e);
  });
