import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ResponseLoggerMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: Function) {
    const startHrTime = process.hrtime();

    res.on('finish', () => {
      const elapsedTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedTime[0] * 1000 + elapsedTime[1] / 1e6;
      console.log("%s : %s : %fms", req.method, req.originalUrl, elapsedTimeInMs);
    });

    next();
  }
}
