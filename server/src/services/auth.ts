import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';


import dotenv from 'dotenv';
dotenv.config();

export const authenticateToken = ({ req }: any) => {
  let authHeader = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    authHeader = authHeader.split(' ').pop().trim();
  }

  if (!authHeader) {
    return req;
  }

  try {
    const { data }: any = jwt.verify(authHeader, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
    req.user = data;
  } catch (err) {
    console.log('Invalid token');
  }

  return req;
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};