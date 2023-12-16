import * as dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
	PORT: z.number().int().positive().default(8000),
	HOST: z.string().default("0.0.0.0"),
	NODE_ENV: z
		.enum(["development", "staging", "production"])
		.default("development"),
	UPSTASH_REDIS_URI: z.string().url().startsWith("redis://"),
});

export const env = envSchema.parse(process.env);
