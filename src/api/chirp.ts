import { Request, Response } from "express";

type RequestChirp = {
  body: string;
};

type ValidateChirpResponse = {
  cleanedBody: string;
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

export function handlerValidateChirp(req: Request, res: Response) {
  const chirp: RequestChirp = req.body;
  const resBody: ValidateChirpResponse = { cleanedBody: chirp.body };

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

  if (containsBadWords(chirp.body)) {
    resBody.cleanedBody = cleanBadWords(chirp.body);
  }

  res.status(200).json(resBody);
}
