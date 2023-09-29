import * as functions from "@google-cloud/functions-framework";

type RequestBody = {
  text: string;
  userName: string;
  linkToTweet: string;
  createdAt: string;
  type: "tweet" | "like";
};

const accessToken = process.env.ACCESS_TOKEN;

export const deebotAreaCleaner = functions.http(
  "deebotAreaCleaner",
  async (req: functions.Request, res: functions.Response) => {
    // accessTokenが不正なら401を返す
    // TODO: あとでコメントアウト外す
    // if (req.headers.authorization !== `Bearer ${accessToken}`) {
    //   const error = { status: 401, message: "Unauthorized" };
    //   console.error(error);
    //   res.status(401).json(error);
    //   return;
    // }

    try {
      console.info("cleanSpotArea ok!");
      res.json({ status: "cleanSpotArea ok!" });
    } catch (error: any) {
      console.error("Unknown error:", error);
      res.status(500).json(error);
    }
  }
);
