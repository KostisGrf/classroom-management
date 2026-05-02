import type  {Request,Response, NextFunction } from "express";
import  aj  from "../../config/arcjet";
import { Arcjet, ArcjetNodeRequest, slidingWindow } from "@arcjet/node";

const securityMiddleware =  async (req : Request, res:Response, next:NextFunction) => {
    if(process.env.ARCJET_ENV === "test") return next(); // Skip Arcjet checks in test environment

    try {
        const role:RatelimitRole = req.user?.role ?? 'guest';

        let limit:number;
        let message:string;

        switch(role) {
            case 'admin':
                limit = 20; // 20 requests per interval for admins
                message = "Admin rate limit exceeded. Please try again later.";
                break;
            case 'teacher':
            case 'student':
                limit = 10; // 10 requests per interval for admins
                message = "user rate limit exceeded. Please try again later.";
                break;  
                
            default:
                limit = 5; // 5 requests per interval for guests
                message = "Guest rate limit exceeded. Please try again later.";
        }

        const client= aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval:"1m", // 1 minute interval
                max:limit, // Dynamic limit based on user role
                 // Custom message for rate limit exceeded
            })
        )

        const arcjetRequest :ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl,
            socket:{remoteAddress : req.socket.remoteAddress ?? req.ip ?? '0.0.0.0'}
        }

        const decision=await client.protect(arcjetRequest);

        if(decision.isDenied() && decision.reason.isBot() ) {
            return res.status(403).json({ error: "Request blocked by bot detection" });
        }

        if(decision.isDenied() && decision.reason.isShield() ) {
            return res.status(403).json({ error: "Request blocked security policy" });
        }

        if(decision.isDenied() && decision.reason.isRateLimit() ) {
            return res.status(429).json({ error: "Too many requests" });
        }

        next();
    } catch (error) {
        console.error("Security middleware error:", error);
        return res.status(403).json({ error: "Request blocked by security middleware" });
    }
}

export default securityMiddleware;