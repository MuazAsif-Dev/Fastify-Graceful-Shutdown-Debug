import { env } from "@/config/env";
import closeWithGrace from "close-with-grace";
import Fastify from "fastify";
import IO from "fastify-socket.io";
// import Redis from "@fastify/redis";
import { Server } from "socket.io";

import { loggerConfig } from "@/config/logger";

type ChannelsType = {
	"chat-app:connection-count": () => void;
	"chat-app:connection-count-updated": ({ count }: { count: string }) => void;
};
declare module "fastify" {
	interface FastifyInstance {
		io: Server<ChannelsType>;
	}
}

let connectedClients = 0;

const CONNECTION_COUNT_KEY = "chat-app:connection-count";
const CONNECTION_COUNT_UPDATED_CHANNEL = "chat-app:connection-count-updated";

async function createServer() {
	const app = Fastify({
		logger: env.NODE_ENV ? loggerConfig[env.NODE_ENV] : true,
		forceCloseConnections: true,
	});

	await app.register(IO);

	// await app
	// 	.register(Redis, { url: env.UPSTASH_REDIS_URI, namespace: "publisher" })
	// 	.register(Redis, { url: env.UPSTASH_REDIS_URI, namespace: "subscriber" });

	// const publisher = app.redis.publisher!;
	// const subscriber = app.redis.subscriber!;

	// app.addHook("onReady", async () => {
	// 	console.log("Ready");
	// 	app.log.debug("Ready Log");
	// });

	// app.addHook("onListen", async () => {
	// 	console.log("Listening");
	// 	app.log.debug("Listen Log");
	// });

	// app.addHook("onRegister", async () => {
	// 	console.log("Registering");
	// 	app.log.debug("Register Log");
	// });

	// app.addHook("preClose", async () => {
	// 	console.log("preClose");
	// 	app.log.debug("preClose Log");
	// });

	app.addHook("onClose", async () => {
		console.log("reached");
		app.log.debug("Updating connection count");
		// if (connectedClients > 0) {
		// 	const currentCount = parseInt(
		// 		(await publisher.get(CONNECTION_COUNT_KEY)) || "0",
		// 		10,
		// 	);

		// 	const newCount = Math.max(currentCount - connectedClients, 0);

		// 	await publisher.set(CONNECTION_COUNT_KEY, newCount);
		// }
	});

	// const currCount = await publisher.get(CONNECTION_COUNT_KEY);

	// if (!currCount) {
	// 	await publisher.set(CONNECTION_COUNT_KEY, 0);
	// }

	app.io.on("connection", async (io) => {
		app.log.debug("Client connected");

		// const incResult = await publisher.incr(CONNECTION_COUNT_KEY);

		connectedClients++;

		// await publisher.publish(
		// 	CONNECTION_COUNT_UPDATED_CHANNEL,
		// 	String(incResult),
		// );

		io.on("disconnect", async () => {
			app.log.debug("Client disconnected");

			connectedClients--;

			// const decResult = await publisher.decr(CONNECTION_COUNT_KEY);

			// await publisher.publish(
			// 	CONNECTION_COUNT_UPDATED_CHANNEL,
			// 	String(decResult),
			// );
		});
	});

	// subscriber.subscribe(CONNECTION_COUNT_UPDATED_CHANNEL, (err, count) => {
	// 	if (err) {
	// 		app.log.error(
	// 			`Error subscribing to ${CONNECTION_COUNT_UPDATED_CHANNEL}`,
	// 			err,
	// 		);
	// 		return;
	// 	}

	// 	app.log.debug(
	// 		`${count} clients connected to ${CONNECTION_COUNT_UPDATED_CHANNEL} channel`,
	// 	);
	// });

	// subscriber.on("message", (channel, text) => {
	// 	if (channel === CONNECTION_COUNT_UPDATED_CHANNEL) {
	// 		app.io.emit(CONNECTION_COUNT_UPDATED_CHANNEL, {
	// 			count: text,
	// 		});
	// 		return;
	// 	}
	// });

	return app;
}

async function main() {
	const server = await createServer();

	await server.listen({ port: env.PORT, host: env.HOST });

	closeWithGrace({ delay: 2000 }, async ({ signal }) => {
		server.log.debug("Server closing", signal);
		await server.close();
		server.log.info("Server closed successfully");
	});

	// server.log.debug(env, "Here are the envs");

	// server.log.debug(
	// 	server.printRoutes({ commonPrefix: false, includeHooks: true }),
	// );

	// const signals = ["SIGINT", "SIGTERM"];

	// signals.forEach((signal) => {
	// 	process.on(signal, async () => {
	// 		server.log.info("Server closing");

	// 		try {
	// 			await server.close();
	// 			server.log.info("Server closed successfully");
	// 			process.exit(0);
	// 		} catch (error) {
	// 			server.log.error("Server failed to close successfully", error);
	// 			process.exit(1);
	// 		}
	// 	});
	// });

	// closeWithGrace({ delay: 5000 }, async () => {
	// 	server.log.info("Server closing");

	// 	await server.close();

	// 	server.log.info("Server closed successfully");
	// });

	// closeWithGrace({ delay: 5000 }, async () => {
	// 	server.log.debug("Updating connection count");
	// 	if (connectedClients > 0) {
	// 		const currentCount = parseInt(
	// 			(await publisher.get(CONNECTION_COUNT_KEY)) || "0",
	// 			10,
	// 		);

	// 		const newCount = Math.max(currentCount - connectedClients, 0);

	// 		await publisher.set(CONNECTION_COUNT_KEY, newCount);
	// 	}
	// 	await server.close();
	// 	server.log.info("Server closed successfully");
	// });
}

main();
