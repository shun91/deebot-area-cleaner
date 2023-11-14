import { VacbotSingleton } from "./VacbotSingleton";

type CleanArgs = {
  /**
   * 清掃するエリアのIDをカンマ区切りで指定する（例: 1,2,3）
   */
  targetAreas: string;
};

export const clean = async ({ targetAreas }: CleanArgs) => {
  const vacbot = await VacbotSingleton.getInstance();

  const promise = new Promise<void>((resolve, reject) => {
    vacbot.on("Error", (value: any) => {
      if (value !== "NoError: Robot is operational") reject(value);
    });

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

export const getAll = async () => {
  const vacbot = await VacbotSingleton.getInstance();

  const promise = new Promise<any[]>((resolve, reject) => {
    vacbot.on("Error", (value: any) => {
      if (value !== "NoError: Robot is operational") reject(value);
    });

    vacbot.on("ready", (event: any) => {
      console.info("vacbot ready");

      vacbot.run("GetMaps");
      vacbot.on("Maps", ({ maps }: any) => {
        const mapId = maps[0].mapID;
        vacbot.run("GetSpotAreas", mapId);
        vacbot.on("MapSpotAreas", ({ mapSpotAreas }: any) => {
          mapSpotAreas.forEach((mapSpotArea: any) => {
            vacbot.run("GetSpotAreaInfo", mapId, mapSpotArea.mapSpotAreaID);
          });

          const result: any[] = [];
          vacbot.on("MapSpotAreaInfo", (value: any) => {
            console.info("MapSpotAreaInfo", value);
            result.push(value);
            if (result.length === mapSpotAreas.length) {
              vacbot.disconnect();
              console.info("disconnected");
              resolve(result);
            }
          });
        });
      });
    });
  });

  vacbot.connect();

  return promise;
};
