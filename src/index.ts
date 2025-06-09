import express from 'express';
import { PORT } from '@/config';
import dockerHubRouters from '@/docker-hub-routers';

const app = express();

app.use(dockerHubRouters);

const server = app.listen(PORT);

function shutdown() {
    server.close();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

