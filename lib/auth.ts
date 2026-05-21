import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;

export async function generateAccessToken(userId: string) {
    if(!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
    }

    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(accessTokenExpiresIn ?? "15m")
        .sign(secret);
}

export async function verifyAccessToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId as string;

        if(!userId || typeof userId !== "string") {
            return null;
        }

        return userId;
    } catch (error) {
        return null;
    }
}

export async function generateRefreshToken(_userId: string) {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}