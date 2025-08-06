import type {Request, Response, NextFunction} from "express";

const verifyOrigin = (req: Request, res: Response, next: NextFunction) => {
 // Define the allowed origin (frontend domain)
 const allowedOrigin = process.env.CLIENT_URL;

 // Get the origin from the request headers
 const origin = req.headers.origin;

 // Check if the origin matches the allowed origin
 if (origin !== allowedOrigin) {
  // If the origin is not allowed, return a 403 Forbidden response
  return res.status(403).json({ message: 'Access denied. Unauthorized origin.' });
 };

 // If everything is fine, proceed to the next middleware
 next();
};

export default verifyOrigin;