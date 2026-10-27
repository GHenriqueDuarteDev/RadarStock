import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
    userId?: string
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET ?? "",
    cookieName: "radarstock_session",
    cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        //mudar para true assim que for para produção e usar https !!!
        secure: false,
        path: '/'
    }
}

export async function getSession() {
    return getIronSession<SessionData>(await cookies(), sessionOptions)
}