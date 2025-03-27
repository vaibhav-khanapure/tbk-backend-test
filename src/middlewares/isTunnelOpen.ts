import type {NextFunction, Request, Response} from "express";

const isTunnelOpen = (req: Request, res: Response, next: NextFunction) => {
 if (process.env.IS_TUNNEL_ENABLED !== "true") return res.status(400).json({message: "Unauthorized"});
 next();
};

export default isTunnelOpen;