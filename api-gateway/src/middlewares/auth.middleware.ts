import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];

  // 1. Si existe un API Key, dejamos que el servicio interno (payment-service) lo valide.
  if (apiKey) {
    return next();
  }

  // 2. Si no hay API Key, verificamos si existe un token JWT válido.
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const secret = process.env.JWT_SECRET || 'supersecret';
      const decoded = jwt.verify(token, secret);
      // Opcional: Podrías inyectar el usuario decodificado en el req
      // (req as any).user = decoded;
      return next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired JWT token' });
      return;
    }
  }

  // 3. Si no hay ninguno de los dos, rechazamos la petición.
  res.status(401).json({ error: 'Authentication required: Provide a valid JWT or x-api-key header' });
  return;
};
