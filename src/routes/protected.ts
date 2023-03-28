import {FastifyInstance} from "fastify/types/instance";
import {FastifyReply} from "fastify/types/reply";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../config/environment";
import {brandCollectorService} from "../services/BrandCollectorService";

const protectedRoutes = (fastify: FastifyInstance) => {
    fastify.register((instance, opts, done) => {
        instance.decorate('authorize', (authorizationHeader: string, reply: FastifyReply) => {
            try {
                jwt.verify(authorizationHeader.replace("Bearer ", ""), JWT_SECRET)
            } catch (e) {
                reply.code(401).send("UNAUTHORIZED");
            }
        });

        instance.addHook('preHandler', (request, reply, done) => {
            const {authorization} = request.headers;
            // declare fastify.d.ts with module augmentation https://github.com/fastify/fastify/issues/1417#issuecomment-458601746
            // @ts-ignore
            instance.authorize(authorization, reply);
            done();
        })

        instance.get<{
            Querystring: {
                search: string;
            }
        }>('/omdb', async (request, reply) => {
            const {search} = request.query;

            if (!search || search.trim() === '') {
                throw new Error('Missing search parameter.');
            }
            return brandCollectorService.search(search.trim())
        })

        instance.get('/films', async (request, reply) => {
            return brandCollectorService.fastAndFurious();
        })

        instance.post('/pirates', async (request, reply) => {
            return brandCollectorService.pirates();
        })
        done()
    })
}

export {protectedRoutes}
