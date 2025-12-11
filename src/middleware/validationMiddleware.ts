import { Request, Response, NextFunction } from "express";

const validate_payload = (schema: any, payload_from: "query" | "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    let _payload;
    if (payload_from == "body") {
      _payload = req.body;
    } else {
      _payload = req.query;
    }
    const { error, value } = schema.validate(_payload);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    req.body = value;
    next();
  };
};

export default validate_payload;
