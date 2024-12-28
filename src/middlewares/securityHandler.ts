import type { NextFunction, Request, Response } from "express";

const securityHandler = (req: Request, res: Response, next: NextFunction) => {
 // No iframe embedding
 res.setHeader('X-Frame-Options', 'DENY');

 // No content type guessing
 res.setHeader('X-Content-Type-Options', 'nosniff');

 // Force HTTPS for 1 year
 res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

 next();
};

export default securityHandler;