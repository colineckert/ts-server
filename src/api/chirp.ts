import { Request, Response } from "express";

type RequestChirp = {
  body: string;
};

type ValidateChirpResponse = {
  valid: boolean;
};

type ValidateChirpError = {
  error: string;
};

export function handlerValidateChirp(req: Request, res: Response) {
  const resBody: ValidateChirpResponse = { valid: true };
  const chirp: RequestChirp = req.body;

  if (chirp.body.length === 0) {
    const errBody: ValidateChirpError = { error: "Chirp cannot be empty" };
    res.status(400).json(errBody);
    return;
  }

  if (chirp.body.length > 140) {
    const errBody: ValidateChirpError = { error: "Chirp is too long" };
    res.status(400).json(errBody);
    return;
  }

  res.status(200).json(resBody);
}
