import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10, "Use at least 10 characters").max(200).regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number"),
  confirm: z.string() }).refine(d => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const postSchema = z.object({ title: z.string().trim().min(3).max(200), content: z.string().trim().min(1).max(50000), tags: z.string().optional() });
export const replySchema = z.object({ content: z.string().trim().min(1).max(10000), postId: z.string().uuid(), parentId: z.string().uuid().optional() });
