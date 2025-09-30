import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizeError } from "./errors.js";
import { createChirp, getChirp, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

type CreateChirpParams = {
  body: string;
};

type ValidateChirpError = {
  error: string;
};

const badWords = ["kerfuffle", "sharbert", "fornax"];

export async function handlerCreateChirp(req: Request, res: Response) {
  const params: CreateChirpParams = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  if (params.body.length === 0) {
    const errBody: ValidateChirpError = { error: "Chirp cannot be empty" };
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
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  return getCleanedBody(body, badWords);
}

function getCleanedBody(body: string, badWords: string[]) {
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");
  return cleaned;
}

export async function handlerGetChirps(_: Request, res: Response) {
  const chirps = await getChirps();

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
