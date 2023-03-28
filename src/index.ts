import "dotenv/config";
import Fastify from 'fastify';
import {PORT} from "./config/environment";
import {openedRoutes, protectedRoutes} from "./routes";

const fastify = Fastify({
    logger: true
})

openedRoutes(fastify);
protectedRoutes(fastify);

fastify.listen({port: PORT, host: '0.0.0.0'}, (err, address) => {
    if (err) throw err
    console.log(`Server is now listening on ${address} 🚀`)
})
