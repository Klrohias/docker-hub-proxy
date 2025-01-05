import express from 'express';
import { PORT } from '@/config';
import dockerHubRouters from '@/docker-hub-routers';

const app = express();

app.use(dockerHubRouters);

app.listen(PORT);

