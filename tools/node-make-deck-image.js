const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pathToCards = path.join(__dirname, '../cards');

const allCards = fs.readdirSync(pathToCards);

let imageHtml = '';

allCards.forEach(card => {
    if (card.includes('back')) {
        return;
    }
    const image = fs.readFileSync(path.join(pathToCards, card));
    const base64Image = new Buffer.from(image).toString('base64');
    const dataURI = 'data:image/png;base64,' + base64Image;
    const imageString = `<img style="width=987px; height: 1545px;" src="${dataURI}"/>`;
    imageHtml = `${imageHtml}\n${imageString}`;
})


const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *, *:before, *:after {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 9870px;
            height: 10815px;
            font-size: 0;
        }
    </style>
</head>
<body>
    ${imageHtml}
</body>
</html>
`;

fs.writeFileSync('./tabletop-assets/temp.html', html);
console.log('hello');


const doWork = async () => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--max-old-space-size=16000',
        ], pipe: true, headless: 'new', dumpio: true
    })

    // Create a new page
    const page = await browser.newPage();
    await page.setViewport({
        width: 9870,
        height: 10815,
        deviceScaleFactor: 1,
    });

    await page.goto(`file:/${path.join(__dirname, '../tabletop-assets/temp.html')}`);

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');
    // await page.waitForTimeout(4000)
    // Download the PDF
    try {
        await page.screenshot({
            path: path.join(__dirname, '../tabletop-assets/deck.png'),
            omitBackground: true,
            // fullPage: true,
        });
    } catch (e) {
        console.error(e);
    }


    console.log(`PDF saved`);

    // Close the browser instance
    await browser.close();


    // const response = await mdimg.convert2img({
    //     inputText: html,
    //     puppeteerProps: {
    //         args: [
    //             '--max-old-space-size=16000',
    //             '--memory-pressure-off',
    //         ]
    //     },
    //     // encoding: "blob",
    //     outputFilename: path.join(__dirname, '../tabletop-assets/deck.png'),
    // });

    // fs.writeFileSync(path.join(__dirname, '../tabletop-assets/deck.png'), response.data);
    process.exit(0);
}

doWork();


// mdimg.convert2img({
//     htmlText: html,
//     cssText: '',
//     inputText: '',
//     width: 9870,
//     outputFilename: '../tabletop-assets/deck.png',
// });

// nodeHtmlToImage({
//     output: './tabletop-assets/full-deck.png',
//     html,
//     timeout: 300000,
//     puppeteerArgs: {
//         // headless: false,
//     },
//     transparent: true,
// })
//     .then(() => console.log('The image was created successfully!'))