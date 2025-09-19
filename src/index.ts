import express, { Request, Response } from 'express';

const app = express();
const PORT = 8080;

app.use('/app', express.static('./src/app'));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

function handlerReadiness(_: Request, res: Response) {
  res.status(200).set('Content-Type', 'text/plain').send('OK');
}
app.get('/healthz', handlerReadiness);
