import puppeteer from 'puppeteer';
import fs from 'fs';
import chalk from 'chalk';

function range(startAt: number = 0, size: number) {
  return [...Array(size).keys()].map(i => i + startAt);
}

function log(step: string, message: string) {
  console.log(`${chalk.green(step)} - ${message}`)
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  
  await scrapeVerbs();

  browser.close().then(() => log('Ended', 'Ended all scraping and writing process!'));

  async function scrapeVerbs() {
    log('Scraping', 'scraping pages...');
    
    for (let num of range(1, 50)) {
      const page = await browser.newPage();

      await page.goto(`https://www.conjugacao.com.br/verbos-populares/${num}/`);

      const verbsOfPage = await page.evaluate(() => {
        const ul = document.querySelectorAll<HTMLDListElement>('.wrapper ul li');
        const content: string[] = [];

        ul.forEach(item => item.textContent && content.push(item.textContent));

        return content
      });

      log('info', `Scraped ${chalk.red(`https://www.conjugacao.com.br/verbos-populares/${num}/`)}.`);

      writePageVerbsIntoFile(verbsOfPage);
    }

    function writePageVerbsIntoFile(verbs: string[]) {
      fs.writeFileSync('verbos.txt', addMoreItemsIntoFile(verbs), {
        encoding: 'utf-8'
      });

      log('sucess', `Saved more ${verbs.length} items in ${chalk.red('verbos.txt')}`);

      function addMoreItemsIntoFile(newItems: string[]) {
        const content = fs.readFileSync('verbos.txt', { encoding: 'utf-8' }).split('\n');

        if (content[0] === '') {
          return newItems.join('\n');
        }

        return [...content, ...newItems].join('\n');
      }
    }
  }
}

main();