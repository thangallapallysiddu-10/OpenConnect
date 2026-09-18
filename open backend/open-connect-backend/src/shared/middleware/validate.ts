import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodTypeAny } from 'zod';
import { BadRequestError } from '../http/errors';

type Part = 'body' | 'query' | 'params';

export function validate(schema: ZodTypeAny, part: Part = 'body') {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const result = schema.safeParse(request[part]);
    if (!result.success) {
      throw new BadRequestError('Validation failed', result.error.flatten());
    }
    request[part] = result.data;
  };
}
