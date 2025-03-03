import type {NextFunction, Request, Response} from "express";
import sendErrorMail from "../lib/sendErrorMail";

const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
 const err = process.env.NODE_ENV === "production" ? {message: "Server Error Occurred"} : error;
 sendErrorMail(error);
 return res.status(500).json(err);
};

export default errorHandler;