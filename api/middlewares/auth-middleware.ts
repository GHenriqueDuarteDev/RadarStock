import type { NextFunction, Request, Response } from "express";

export function requireInternalUser(req: Request, res: Response, next: NextFunction) {
    const secret = req.header("x-internal-secret")
    const userId = req.header("x-user-id")

    if(secret !== process.env.INTERNAL_SECRET || !userId) {
        res.status(401).json({
            message: "Usuario Não Autenticado."
        })
        return
    }

    res.locals.userId = userId
    next()
}