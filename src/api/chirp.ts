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

function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return badWords.some((word) => lowerText.includes(word));
}

function cleanBadWords(text: string): string {
  const cleanedText: string[] = [];

  const words = text.split(" ");
  for (const word of words) {
    if (badWords.includes(word.toLowerCase())) {
      cleanedText.push("****");
    } else {
      cleanedText.push(word);
    }
  }

  return cleanedText.join(" ");
}

export async function handlerCreateChirp(req: Request, res: Response) {
  const params: CreateChirpParams = req.body;

  const token = getBearerToken(req);
  const secret = config.jwt.secret;
  const userId = validateJWT(token, secret);

  if (!userId) {
    throw new UnauthorizeError("Failed to create chirp. Unauthorized user.");
  }

  if (params.body.length === 0) {
    const errBody: ValidateChirpError = { error: "Chirp cannot be empty" };
    res.status(400).json(errBody);
    return;
  }

  if (params.body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  if (containsBadWords(params.body)) {
    params.body = cleanBadWords(params.body);
  }

  const newChirp = await createChirp({
    userId,
    body: params.body,
  });

  if (!newChirp) {
    throw new Error("Failed to create chirp");
  }

  res.status(201).json(newChirp);
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
