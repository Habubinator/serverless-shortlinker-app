import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../database/dbController";
import { Request, Response } from "express";

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Can't find required body parameters",
        });
      }

      const candidate = await db.findUsers(email);
      if (candidate.Item) {
        return res.status(409).json({
          success: false,
          error: "User already exists",
        });
      }

      const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      const refreshToken = jwt.sign(
        require("crypto").randomBytes(32).toString("hex"),
        process.env.JWT_SECRET_KEY
      );
      await db.createUser(email, hashPassword, refreshToken);
      const accessToken = generateAccessToken(email);

      res.json({
        success: true,
        data: {
          email: email,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Registration error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Can't find required body parameters",
        });
      }

      const candidate = await db.findUsers(email);

      if (!candidate.Item) {
        return res.status(404).json({
          success: false,
          error: "Can't find user",
        });
      }

      if (bcrypt.compareSync(password, candidate.Item.password)) {
        const accessToken = generateAccessToken(email);
        const refreshToken = jwt.sign(
          require("crypto").randomBytes(32).toString("hex"),
          process.env.JWT_SECRET_KEY
        );

        db.rewokeToken(refreshToken, email);

        return res.json({
          success: true,
          data: {
            email: email,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Login error",
      });
    }
  }
}

function generateAccessToken(email: string) {
  const payload = {
    email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TTL,
  });
}

export default new AuthController();
