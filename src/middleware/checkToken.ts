import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const {JWT_SECRET_KEY} = process.env;

function checkToken(req: Request, res: Response, next: NextFunction): void {
    const {authorization} = req.headers;

    if (authorization && authorization.startsWith('Bearer ')) {
        const accessToken = authorization.split(' ')[1];

        jwt.verify(accessToken, JWT_SECRET_KEY, (err: jwt.VerifyErrors | null, decoded: object) => {
            if (err) {
                if (err.name as string === 'TokenExpiredError') {
                    res.locals.isExpired = true;
                } else {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid token provided. Please login again to obtain a new one.',
                    });
                }
            }
            res.locals.isExpired = false;
            res.locals.decoded = decoded;
            next();
        });
    } else {
        next();
    }
}

export default checkToken;