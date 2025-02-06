import type {NextFunction, Request, Response} from "express";

const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
 return res.status(500).json(process.env.NODE_ENV === "production" ? {message: "Server Error Occurred"} : error);
};

export default errorHandler;