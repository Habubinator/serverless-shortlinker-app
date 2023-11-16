import { Request, Response } from "express";
import db, { IUser } from "../database/dbController";

interface IUserJwt {
  email: string;
}

class linksController {
  async createLink(req: Request, res: Response) {
    try {
      const user: IUserJwt = res.locals.decoded;
      if (!user) {
        return res.json({
          success: false,
          message: "Error: Login token has expired. Access denied.",
        });
      }
      let { oglink, timeToLive } = req.body;
      if (isValidURL(oglink)) {
        let link = generateRandomId(6);
        switch (timeToLive) {
          case "one-time":
            timeToLive = 1;
            break;
          case "1d":
            timeToLive = Date.now() + 86400; // 1 day in unix format
            break;
          case "3d":
            timeToLive = Date.now() + 86400 * 3; // 3 day in unix format
            break;
          case "7d":
            timeToLive = Date.now() + 86400 * 7; // 7 day in unix format
            break;
          default:
            return res.json({
              success: false,
              message: `Error: No ttl specified`,
            });
        }
        await db.createLink(user.email, link, oglink, timeToLive);
        return res.json({
          success: true,
          message: `Link ${link} has been succesfully created`,
        });
      } else {
        return res.json({
          success: false,
          message: "Specified text in link field is not a link",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error: cannot create link",
      });
    }
  }

  async deleteLink(req: Request, res: Response) {
    try {
      const user: IUserJwt = res.locals.decoded;
      if (!user) {
        return res.json({
          success: false,
          message: "Error: Login token has expired. Access denied.",
        });
      }
      const { link } = req.body;

      await db.deleteLink(user.email, link);
      return res.json({
        success: true,
        message: `Link ${link} has been succesfully deleted`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error: cannot delete link",
      });
    }
  }

  async getLinks(req: Request, res: Response) {
    try {
      if (res.locals.isExpired) {
        return res.json({
          success: false,
          message: "Error: Login token has expired. Access denied.",
        });
      }
      const user: IUserJwt = res.locals.decoded;
      return res.json({
        success: true,
        data: {
          email: user.email,
          links: await db.getUserLinks(user.email),
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error: cannot get links",
      });
    }
  }
}

function isValidURL(url: string): boolean {
  return /^((http|https|ftp):\/\/)(www\.)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})(\/[a-zA-Z0-9-._?&=]*)*$/.test(
    url
  );
}

function generateRandomId(length: number): string {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export default new linksController();
