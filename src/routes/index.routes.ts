import { Router } from 'express';
import { authRouter } from './auth.routes';

export const indexRouter = Router();

indexRouter.use('/index', authRouter);
