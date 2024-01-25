import { NextFunction, Request, Response } from "express";

export function validatePost(request: Request, response: Response, next: NextFunction) {
    const { email, name } = request.body;

    if (!email) {
        return response.status(400).json({ statusCode: 400, message: 'Missing email' });
    }

    if (typeof email !== 'string') {
        return response.status(400).json({ statusCode: 400, message: 'Invalid email' });
    }

    if (!name) {
        return response.status(400).json({ statusCode: 400, message: 'Missing name' });
    }

    next();

}