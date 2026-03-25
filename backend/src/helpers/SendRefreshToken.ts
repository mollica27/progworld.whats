import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, {
    httpOnly: true,
    secure: false, // Em localhost deve ser false se não usar HTTPS
    sameSite: "lax",
    path: "/",
    domain: "localhost" // Força o domínio para evitar conflito com 127.0.0.1
  });
};
