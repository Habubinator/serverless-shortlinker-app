import { Request, Response } from "express";
import db, { IUser, ILink } from "../database/dbController";

class redirectController {
  async redirectToLink(req: Request, res: Response) {
    try {
      const users = await db.getAllLinks();
      let links = new Map();
      let linkUser = new Map();
      users.forEach((user: IUser) => {
        user.links.forEach((link: ILink) => {
          links.set(link.link, link.oglink);
          linkUser.set(link.link, user.email);
        });
      });
      const { shortlink } = req.params;
      await db.changeStat(linkUser.get(shortlink), shortlink);
      return res.redirect(links.get(shortlink));
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error: cannot redirect to a link",
      });
    }
  }
}

export default new redirectController();
