import * as crypto from 'crypto';

if (!global.crypto) {
  global.crypto = crypto as any;
}