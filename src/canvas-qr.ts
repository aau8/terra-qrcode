import {
  Canvas,
  CanvasRenderingContext2D,
  TextMetrics,
  createCanvas,
  loadImage,
} from 'canvas';
import QRCode from 'qrcode';

interface TextOptions {
  size: number;
  posY: number;
  color?: string;
}

interface TextMetricsExtra extends TextMetrics {
  emHeightAscent: number;
}

export class CanvasQR {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  scale = 2;
  width = 200 * this.scale;
  height = 300 * this.scale;
  paddingX = 10 * this.scale;

  constructor() {
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Нарисовать qr-code
   */
  async drawQR(value: string) {
    const QRCodeBuffer = await QRCode.toBuffer(value);

    await loadImage(QRCodeBuffer).then((image) => {
      const IMG_SCALE = 1 * this.scale;
      const paddingX = 0;
      const size = this.width - paddingX * IMG_SCALE;
      const x = this.getXCentered(size);
      const y = this.height - size - 10 * this.scale;

      this.ctx.drawImage(image, x, y, size, size);
    });
  }

  /**
   * Получить отступ по x, чтобы элемент был по центру
   */
  getXCentered(width: number) {
    const posX = this.width / 2 - width / 2;
    return posX;
  }

  /**
   * Получить размер текста
   */
  getTextSize(text: string) {
    const measureText = this.ctx.measureText(text) as TextMetricsExtra;
    const width = measureText.width;
    const height = measureText.emHeightAscent;

    return { width, height };
  }

  /**
   * Разместить текст
   */
  drawText(text: string, options: TextOptions) {
    let { size, color, posY } = options;

    size = size * this.scale;
    this.ctx.font = `${size}px Sans`;
    this.ctx.fillStyle = color || '#000';
    this.ctx.textAlign = 'center';

    const { width, height } = this.getTextSize(text);
    const posX = this.width / 2;
    posY = Math.sign(posY) === 1 ? posY + height : this.height - Math.abs(posY);

    const contentWidth = this.width - this.paddingX * 2;

    if (width < contentWidth) {
      this.ctx.fillText(text, posX, posY);
      return;
    }

    const symbolWidth = width / text.length;

    // Определение длины строк, если длина строки будет больше контентной области, то она будет нарисована
    text.split(' ').reduce(
      (data, word, index, words) => {
        const isLastWord = index === words.length - 1;
        const newLine = [data.line, word].join(' ');
        const newLineWidth = newLine.length * symbolWidth;

        if (newLineWidth < contentWidth) {
          if (isLastWord) {
            this.ctx.fillText(newLine, posX, posY + data.count * height);
          }

          return {
            line: newLine,
            count: data.count,
          };
        }

        this.ctx.fillText(data.line, posX, posY + data.count * height);

        if (isLastWord) {
          this.ctx.fillText(word, posX, posY + (data.count + 1) * height);
        }

        return {
          line: word,
          count: data.count + 1,
        };
      },
      { line: '', count: 0 },
    );
  }
}
