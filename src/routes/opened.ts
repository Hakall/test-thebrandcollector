import {FastifyInstance} from "fastify/types/instance";
import {API_KEY, JWT_SECRET} from "../config/environment";
import jwt from "jsonwebtoken";

const openedRoutes = (fastify: FastifyInstance) => {
    fastify.get<{
        Querystring: {
            apiKey: string;
        }
    }>('/token', async (request, reply) => {
        const {apiKey} = request.query;
        if (apiKey !== API_KEY) {
            return reply.code(401).send("INVALID_API_KEY");
        }
        const token = jwt.sign(
            {logged: true},
            JWT_SECRET,
            {
                expiresIn: "2 days",
            }
        );
        return token;
    })
    fastify.get('/healthz', async (request, reply) => {
        return true;
    })
}

export {
    openedRoutes
}
