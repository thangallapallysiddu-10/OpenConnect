import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../http/errors';
import { verifyAccessToken, AccessTokenPayload } from '../security/tokens';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

export async function authenticate(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError();
  request.user = verifyAccessToken(header.slice('Bearer '.length));
}

export async function optionalAuth(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    request.user = verifyAccessToken(header.slice('Bearer '.length));
  }
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    await authenticate(request);
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenError();
    }
  };
}
