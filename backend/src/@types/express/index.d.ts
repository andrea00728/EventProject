import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    cookies: { [key: string]: string };
  }
}
