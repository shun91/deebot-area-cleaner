import * as functions from "@google-cloud/functions-framework";
import { clean, getAll } from "./spotArea";

const accessToken = process.env.ACCESS_TOKEN;

export const deebotAreaCleaner = functions.http(
  "deebotAreaCleaner",
  async (req: functions.Request, res: functions.Response) => {
    // accessTokenが不正なら401を返す
    if (req.headers.authorization !== `Bearer ${accessToken}`) {
      const error = { status: 401, message: "Unauthorized" };
      console.error(error);
      res.status(401).json(error);
      return;
    }

    try {
      if (req.path === "/") {
        await clean();
        res.json({ status: 200, message: "ok" });
      } else if (req.path === "/spot-areas") {
        const result = await getAll();
        res.json(result);
      } else {
        res.status(404).json({ status: 404, message: "Not Found" });
      }
    } catch (error: any) {
      const resp = { status: 500, message: `Unknown error: ${error}` };
      console.error(resp);
      res.status(500).json(resp);
    }
  }
);
