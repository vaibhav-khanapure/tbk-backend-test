import type {NextFunction, Request, Response} from "express";

const isProd = process.env.NODE_ENV === "production";

const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
 return res.status(500).json(isProd ? {message: "Server Error Occurred"} : error);
};

export default errorHandler;