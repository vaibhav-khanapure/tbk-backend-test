import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
 const token = req.headers.authorization?.split(" ")?.[1];
 if(!token) return res.status(401).json({message: "Unauthorized"});

 jwt.verify(token, process.env.ACCESS_TOKEN_KEY as string, (err, payload) => {
  if(err) return res.status(401).json({message: "Unauthorized"});

  console.log("PAYLOAD is", {payload});

  res.locals.user = payload;
  next();
 });
};

export default verifyToken;