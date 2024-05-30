import express, { Request } from 'express';
import { CanvasQR } from './canvas-qr';

const app = express();
const PORT = process.env['PORT'] || 3000;

interface QRGenerateParams {
  qr_value: string;
  event_date: string;
  event_name: string;
}

app.get('/', async (req: Request<{}, {}, {}, QRGenerateParams>, res) => {
  const { event_date, event_name, qr_value } = req.query;

  if (!qr_value) {
    return res.status(400).send('Параметр qr_value обязателен!');
  }
  if (!event_date) {
    return res.status(400).send('Параметр event_date обязателен!');
  }
  if (!event_name) {
    return res.status(400).send('Параметр event_name обязателен!');
  }

  const $cqr = new CanvasQR();
  const qrValue = qr_value;
  const eventDate = event_date;
  const eventName = event_name;

  await $cqr.drawQR(qrValue);

  const date = new Date().toLocaleDateString('ru');
  $cqr.drawText(`Дата выдачи билета: ${date}`, {
    size: 9,
    posY: -24,
  });

  $cqr.drawText('Бизнес-клуб «TERRA.Sochi»', {
    size: 12,
    posY: 8,
  });

  $cqr.drawText(eventDate, {
    size: 12,
    posY: 60,
  });

  $cqr.drawText(eventName, {
    size: 16,
    posY: 90,
  });

  res.setHeader('Content-Type', 'image/png');
  res.send($cqr.canvas.toBuffer());
});

app.listen(PORT, () => {
  console.log(`Server listening ${PORT} port`);
});
