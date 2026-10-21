import crypto from 'node:crypto'; import jwt from 'jsonwebtoken'; import { env } from '../../config/env'; import { UnauthorizedError } from '../http/errors';
export type AccessTokenPayload={sub:string;email:string;role:string};
const verify=(t:string,secret:string)=>{try{return jwt.verify(t,secret)}catch{throw new UnauthorizedError('Invalid or expired token')}};
export const signAccessToken=(p:AccessTokenPayload)=>jwt.sign(p,env.JWT_ACCESS_SECRET,{expiresIn:env.ACCESS_TOKEN_TTL_SECONDS});
export const signRefreshToken=(userId:string,familyId:string)=>jwt.sign({sub:userId,jti:crypto.randomUUID(),familyId},env.JWT_REFRESH_SECRET,{expiresIn:`${env.REFRESH_TOKEN_TTL_DAYS}d`});
export const verifyAccessToken=(t:string)=>verify(t,env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
export const verifyRefreshToken=(t:string)=>verify(t,env.JWT_REFRESH_SECRET) as {sub:string;jti:string;familyId:string};
export const hashToken=(t:string)=>crypto.createHash('sha256').update(t).digest('hex');
