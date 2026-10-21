import { z } from 'zod';
const device = { deviceKey:z.string().min(3).max(255).default('unknown-device'), platform:z.string().max(30).optional(), pushToken:z.string().max(1000).optional() };
export const registerSchema=z.object({email:z.string().email().max(255).transform(v=>v.toLowerCase()),password:z.string().min(8).max(128),displayName:z.string().min(2).max(120),...device});
export const loginSchema=z.object({email:z.string().email().transform(v=>v.toLowerCase()),password:z.string().min(1).max(128),...device});
export const refreshSchema=z.object({refreshToken:z.string().min(20),deviceKey:z.string().min(3).max(255).default('unknown-device')});
export const logoutSchema=z.object({refreshToken:z.string().min(20)});
export type RegisterInput=z.infer<typeof registerSchema>; export type LoginInput=z.infer<typeof loginSchema>;
