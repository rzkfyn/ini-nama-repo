import axios from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';
import PDFDocument from 'pdfkit';
import path from 'path';
import sizeOf from 'image-size';
import fs from 'node:fs';

export async function downloadPdf(link: string): Promise<string | undefined> {
  try {
    if (!fs.existsSync('./images/')) fs.mkdirSync('./images/');
    if (!fs.existsSync('./pdf/')) fs.mkdirSync('./pdf/');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.info('Openned new page...')

    await page.goto(link);  
    await page.waitForFunction(
      'window.performance.timing.loadEventEnd - window.performance.timing.navigationStart >= 500'
    );
    await page.waitForSelector('#readerarea img.loaded');
    const res = await autoScroll(page) as string[];

    const imagesFolder = `./images/${link.split('/')[link.split('/').length - 2]}`
    if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder);

    console.info('Start download images...');
    let index = 0;
    for (const imageUrl of res) {
      console.log(imageUrl);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const fileData = Buffer.from(response.data, 'binary');
      fs.writeFileSync(`${imagesFolder}/${index}.jpg`, fileData);
      index++;
    }
    console.info(`Downloaded ${index} images, start convert images to pdf...`);
    const pdfPath = await convertImagesToPdf(`${imagesFolder}/`, link);
    await browser.close();

    return pdfPath;
  } catch(e) {
    console.log(e);
  }

  return undefined;
}

async function autoScroll(page: Page) {
  return await page.evaluate(async () => {
    return await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if( totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          let res: string[] = [];
          const dynamicElements = document.querySelectorAll('#readerarea img.loaded');
          dynamicElements.forEach(element => {
            res.push(element.getAttribute('src') ?? '');
          });

          return resolve(res);
        }
      }, 100);
    });
  });
}

export const convertImagesToPdf = async (imagesFolder: string, mangaUrl: string): Promise<string> => {
  return new Promise<string>((resolve) => {
    const files = fs.readdirSync(imagesFolder);
    const imageFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
      });

    console.log(imageFiles);
    const firstImageDimensions = sizeOf(path.join(imagesFolder, imageFiles[0])); 
    const doc = new PDFDocument({
      margins: { bottom: 5, left: 5, right: 5, top: 5 },
      size: [firstImageDimensions.width, firstImageDimensions.height],
      layout: (firstImageDimensions?.width ?? 0) > (firstImageDimensions?.height ?? 0) ? 'landscape' : 'portrait',
    });

    const folderName = path.basename(imagesFolder);
    const outputPdfPath = `./pdf/${mangaUrl.split('/')[mangaUrl.split('/').length - 2]}.pdf`;
    const output = fs.createWriteStream(outputPdfPath);

    doc.pipe(output);

    imageFiles.forEach((file, index) => {
      const imagePath = path.join(imagesFolder, `${index}.${file.split('.')[file.split('.').length - 1]}`);
      const dimensions = sizeOf(imagePath);

      if (index !== 0) {
        doc.addPage({
          size: [dimensions.width, dimensions.height],
          layout:( dimensions.width ?? 0) > (dimensions.height ?? 0) ? 'landscape' : 'portrait',
          margins: { bottom: 5, left: 5, right: 5, top: 5 },
        });
      } else {
        doc.page.width = dimensions.width;
        doc.page.height = dimensions.height;
        doc.page.layout = (dimensions?.width ?? 0) > (dimensions.height ?? 0) ? 'landscape' : 'portrait';
      }

      doc.rect(0, 0, doc.page.width, doc.page.height).fill('white');
      
      doc.image(imagePath, {
        fit: [doc.page.width, doc.page.height],
        align: 'center',
        valign: 'center'
      });
    });

    doc.end();
    console.log(`Berhasil mengonversi ${imageFiles.length} gambar dari ${folderName} menjadi PDF di ${outputPdfPath}\n`);
    fs.rmSync(imagesFolder, { recursive: true, force: true });
    resolve(outputPdfPath);
  });
};
