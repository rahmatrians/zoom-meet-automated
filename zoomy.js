const puppeteer = require('puppeteer');
const readline = require('readline');

// const invitationUrl = 'https://us05web.zoom.us/j/85654928369?pwd=OWENMoMp0SBngMalS47bhxSbMNhTGa.1';
const uname = 'noob Func(x)';
let whiteFg = "\x1b[37m";
let greenFg = "\x1b[32m";
let redFg = "\x1b[91m";

let sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const invitationUrlConvert = (url) => {
    return { zoomID: url.split('/')[4].split('?')[0], zoomPass: url.split('/')[4].split('pwd=')[1] };
}

const zoomUrl = (zoomID) => { return `https://us05web.zoom.us/wc/${zoomID}/join` }

function inputZoomUrl() {
    const interface = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => interface.question("Put ur zoom link here : ", answer => { interface.close(); resolve(answer); }))
}

(async () => {
    try {

        inputZoomUrl()
            .then(async (res) => {

                const { zoomID, zoomPass } = invitationUrlConvert(res);

                browser = await puppeteer.launch({
                    headless: false,
                    // devtools: true,
                    defaultViewport: null,
                    args: ['--no-sandbox', '--start-maximized'],
                });

                page = await browser.newPage({ console: true });
                page.setUserAgent(
                    "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:115.0) Gecko/20100101 Firefox/115.0"
                );


                console.log('\n== Zoom Auto Joiner ⚡️ ==');
                console.log(`author ${greenFg}~ @rianzessh ~\n\n${whiteFg}`);
                console.log('🔄 running...');
                console.log(`🔄 flying > ${greenFg}${zoomUrl(zoomID)}${whiteFg}`);
                await page.goto(zoomUrl(zoomID), { waitUntil: 'networkidle0' });

                console.log('✅ Landed Safely 🛬');
                await page.type('#input-for-pwd', zoomPass);
                await page.type('#input-for-name', uname);

                await page.waitForSelector('div.preview-meeting-info > button.zm-btn').then(async () => await page.click('div.preview-meeting-info > button.zm-btn'))
                // await page.click('div.preview-meeting-info > button');
                // await sleep(3000).then(async () => await page.$eval('div.preview-meeting-info > button', form => form.click()));


                let isChatOpened = false;
                let endedTime = new Date('08/06/2024 23:55:45');

                do {
                    // set actoin in every times ?
                    await sleep(10000).then(async () => {

                        if (!isChatOpened) {
                            await page.waitForSelector('footer#wc-footer > div#foot-bar > div.footer__btns-container > div > div.footer-chat-button > button')
                                .then(async () =>
                                    await page.$eval('footer#wc-footer > div#foot-bar > div.footer__btns-container > div > div.footer-chat-button > button', form => form.click()).then(async () => isChatOpened = true))
                                .catch(err => console.log(`${redFg}❌ failed to open chat...${whiteFg}`));
                        }

                        if (isChatOpened) {
                            let chats = await page.waitForSelector('div.chat-container > div:nth-child(2)').then(async () =>
                                await page.$eval('div.chat-container > div:nth-child(2)', form => form.textContent))
                                .catch(err => console.log(`${redFg}❌ failed to get messages...${whiteFg}`));

                            console.log('💬 chats : ', chats);
                        }

                        await page.screenshot({ path: `joined-${new Date()}.png` })
                        console.log('✅ screenshot taken 📸');

                    });
                }
                while (Date.parse(new Date()) < Date.parse(endedTime));

                await browser.close();
            }).catch((err) => console.log(`${redFg}❌ Wrong url, can't open...${whiteFg}`));

    } catch (err) { console.error(err) };
})();