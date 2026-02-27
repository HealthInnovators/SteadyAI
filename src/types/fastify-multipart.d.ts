declare module '@fastify/multipart' {
  import { FastifyPluginAsync } from 'fastify';

  const multipart: FastifyPluginAsync<{
    limits?: {
      fileSize?: number;
      files?: number;
    };
  }>;

  export default multipart;
}
