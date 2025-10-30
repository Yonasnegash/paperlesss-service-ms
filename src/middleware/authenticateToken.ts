import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import utils from "../utils/utils";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { phoneNumber?: string; roleId?: string; _id?: string };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const _JWTSECRET = global._CONFIG._JWTSECRET;

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, _JWTSECRET as string, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      const decodedToken = jwt.decode(token) as JwtPayload & { data: string };

      if (!decodedToken?.data) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const decryptedUser = await utils.localDecryptPassword(decodedToken.data);
      const userPayload = JSON.parse(decryptedUser);

      // const sessionExpiry = Math.floor(new Date(userPayload.sessionexpiry).getTime() / 1000);
      const sessionExpiry = new Date(userPayload.sessionexpiry).getTime();

      const currentTime = new Date().getTime();

      const timeRemaining = (sessionExpiry - currentTime) / 1000;
      // const timeRemaining = 51;

      if (timeRemaining <= 0) {
        return res.status(401).json({ message: "Session expired" });
      }

      if (timeRemaining < 60) {
        // const newSessionExpiry = moment().add(global._CONFIG._VALS.TEMPSESSIONTIMEOUT, "minute").toISOString();
        const newSessionExpiry = new Date(
          new Date().getTime() +
            Number(global._CONFIG._TEMPSESSIONTIMEOUT) * 60 * 1000
        );
        // Current time + 5 minutes in seconds

        const newTokenData = {
          ...userPayload,
          sessionexpiry: newSessionExpiry,
        };

        if (decodedToken.exp) {

          const newToken = jwt.sign(
            { data: utils.localEncryptPassword(JSON.stringify(newTokenData)) },
            _JWTSECRET,
            {
              expiresIn: Math.abs(
                Number(decodedToken.exp - Math.floor(Date.now() / 1000))
              ),
            }
          );

          res.setHeader("x-new-token", newToken);
        }
      }

      req.user = {
        ...userPayload,
        _id: userPayload.userId || undefined,
      };

      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};