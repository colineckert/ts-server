import express from 'express';
import { middlewareLogResponses } from './api/midddleware.js';
import { handlerReadiness } from './api/readiness.js';

const app = express();
const PORT = 8080;

app.use('/app', express.static('./src/app'));
app.use(middlewareLogResponses);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/healthz', handlerReadiness);
