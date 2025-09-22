import express from 'express';
import {
  middlewareLogResponse,
  middlewareMetricsInc,
} from './api/midddleware.js';
import { handlerReadiness } from './api/readiness.js';
import { handlerMetrics, handlerReset } from './admin/metrics.js';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponse);
app.use('/app', middlewareMetricsInc, express.static('./src/app'));

app.get('/api/healthz', handlerReadiness);
app.get('/admin/metrics', handlerMetrics);
app.get('/admin/reset', handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
