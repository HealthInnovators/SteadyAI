import 'fastify';

declare module 'fastify' {
  interface MultipartUploadFile {
    filename: string;
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  }

  interface FastifyRequest {
    userId?: string;
    userEmail?: string;
    file: () => Promise<MultipartUploadFile | undefined>;
  }
}
