import express from 'express';
import { PORT } from './config.js';
import dockerHubRouter from './docker-hub-routers.js';

const app = express();

app.use(dockerHubRouter);

app.listen(PORT);

