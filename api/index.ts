import 'reflect-metadata';
import type { Request, Response } from 'express';
import { initializedApp } from '../dist/src/app.factory';

let cachedHandler: ((req: Request, res: Response) => void) | undefined;

async function getHandler(): Promise<(req: Request, res: Response) => void> {
  if (!cachedHandler) {
    const app = await initializedApp();
    const expressInstance: (req: Request, res: Response) => void = app
      .getHttpAdapter()
      .getInstance();
    cachedHandler = expressInstance;
  }
  return cachedHandler;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  const expressHandler = await getHandler();
  expressHandler(req, res);
}
