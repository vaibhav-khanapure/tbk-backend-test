import type { NextFunction, Request, Response } from "express";

const changeRequestMiddleware = (req: Request ,res: Response, next: NextFunction) => {
 try {
  const token = req.headers.authorization?.split(" ")?.[1];
  
  if (token !== "laravel_admin_123_rthagauwe") {
    return res.status(400).json({message: "Unauthorized"});
  };

  next();
 } catch (error) {
  next(error);
 };
};

export default changeRequestMiddleware;