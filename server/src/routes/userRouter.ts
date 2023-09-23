import express, { Router } from 'express';

const router: Router = express.Router();

router.get('/signup', (_req, res) => {
  res.send('Signed up successfully');
});

export default router;
