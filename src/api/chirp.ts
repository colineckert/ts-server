import { Request, Response } from 'express';
import { BadRequestError, ForbiddenError, NotFoundError } from './errors.js';
import {
  createChirp,
  deleteChirp,
  getChirp,
  getChirps,
  getChirpsByAuthor,
} from '../db/queries/chirps.js';
import { getBearerToken, validateJWT } from '../auth.js';
import { config } from '../config.js';

type CreateChirpParams = {
  body: string;
};

type ValidateChirpError = {
  error: string;
};

const badWords = ['kerfuffle', 'sharbert', 'fornax'];

export async function handlerCreateChirp(req: Request, res: Response) {
  const params: CreateChirpParams = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  if (params.body.length === 0) {
    const errBody: ValidateChirpError = { error: 'Chirp cannot be empty' };
    res.status(400).json(errBody);
    return;
  }

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: userId });

  res.status(201).json(chirp);
}

function validateChirp(body: string) {
  const maxChirpLength = 140;

  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`
    );
  }

  return getCleanedBody(body, badWords);
}

function getCleanedBody(body: string, badWords: string[]) {
  const words = body.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = '****';
    }
  }

  const cleaned = words.join(' ');
  return cleaned;
}

type GetChirpsQuery = {
  authorId?: string;
  sort?: 'asc' | 'desc';
};

export async function handlerGetChirps(req: Request, res: Response) {
  const { authorId, sort = 'asc' } = req.query as GetChirpsQuery;

  if (!!authorId) {
    const authorChirps = await getChirpsByAuthor(authorId, sort);

    res.status(200).json(authorChirps);
    return;
  }

  const chirps = await getChirps(sort);

  res.status(200).json(chirps);
}

type GetChirpParams = {
  chirpId: string;
};

export async function handlerGetChirp(req: Request, res: Response) {
  const { chirpId } = req.params as GetChirpParams;

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  res.status(200).json(chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const { chirpId } = req.params as GetChirpParams;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  if (chirp.userId !== userId) {
    throw new ForbiddenError('You can only delete your own chirps');
  }

  const deleteSuccess = await deleteChirp(chirpId);
  if (!deleteSuccess) {
    throw new Error(`Failed to delete Chirp with chirpId: ${chirpId}`);
  }

  res.status(204).send();
}
