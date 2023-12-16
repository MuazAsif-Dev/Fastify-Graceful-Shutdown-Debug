import { env } from "@/config/env";
import closeWithGrace from "close-with-grace";
import Fastify from "fastify";
import IO from "fastify-socket.io";
import { Server } from "socket.io";

import { loggerConfig } from "@/config/logger";

declare module "fastify" {
	interface FastifyInstance {
		io: Server<{ Hello: "World" }>;
	}
}

async function createServer() {
	const app = Fastify({
		logger: env.NODE_ENV ? loggerConfig[env.NODE_ENV] : true,
		forceCloseConnections: true,
	});

	await app.register(IO);

	app.addHook("onClose", async () => {
		app.log.debug("2. Server closing connections");
	});

	app.io.on("connection", async (io) => {
		app.log.debug("Client connected");

		io.on("disconnect", async () => {
			app.log.debug("Client disconnected");
		});
	});

	return app;
}

async function main() {
	const server = await createServer();

	await server.listen({ port: env.PORT, host: env.HOST });

	closeWithGrace({ delay: 2000 }, async ({ signal }) => {
		server.log.debug({ message: "1. Server closing", signal });
		await server.close();
		server.log.info("3. Server closed successfully");
	});
}

main();
