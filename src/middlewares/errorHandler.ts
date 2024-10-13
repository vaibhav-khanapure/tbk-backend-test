import type {NextFunction, Request, Response} from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
 return res.status(500).json(process.env.NODE_ENV === "development" ? err : {message: "Server Error Occurred"});
};

export default errorHandler;