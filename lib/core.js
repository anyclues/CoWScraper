const puppeteer = require("puppeteer")
let Browser = null

function wait(x) {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(x); }, x)
  });
}

class Scraper {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  async connect() {
    const browser = await puppeteer.launch({ defaultViewport: null, args: ['--lang=en-US,en', '--force-device-scale-factor=0.5', '--no-sandbox'] })
    const page = await browser.newPage()
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
        req.abort();
      }
      else {
        req.continue();
      }
    });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US'
    });
    await page.goto('https://callofwar.com');
    await page.waitForSelector("#sg_login_text")
    await page.click("#sg_login_text")
    await page.waitForSelector("#loginbox_login")
    await wait(500)
    await page.type("#loginbox_login_input", this.username)
    await page.type("#loginbox_password_input", this.password)
    await page.click("#func_loginbutton")
    await wait(2000)

    try {
      await page.$("#login_error_message_div")
      throw new Error("Failed at Login")
    } catch {
      Browser = browser
    }

    page.close()
  }

  async getStatsByNickname(username) {
    if (!Browser) throw new Error("Log-in before making this action")
    if (!username) throw new Error("Specify a username")
    let count = 0
    let maxtries = 3
    let success = false

    const page = await Browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
        req.abort();
      }
      else {
        req.continue();
      }
    });

    await page.goto("https://www.callofwar.com/game.php?bust=1#/ranking/players/global/")

    const elementHandle = await page.$('iframe');
    const frame = await elementHandle.contentFrame();
    try {
      await frame.waitForSelector(".user_search_container", { timeout: 10000 })
    } catch {
      page.close()
      throw new Error("Search container not found, try running Puppeteer via Non Headless Execution")
    }

    await frame.click('input[placeholder="Search user..."]')
    await frame.type('input[placeholder="Search user..."]', username, { delay: 100 })

    while (!success) {
      try {
        const [button] = await frame.$x(`//span[contains(., '${username}')]`);
        button.click()
        success = true
      } catch (e) {
        count++;
        if (count > maxtries) {
          success = false
          throw new Error("User not found")
        }
      }
      await wait(500)
    }

    try {
      await frame.waitForSelector(".entry_selected", { timeout: 10000 })
      await frame.click(".entry_selected")
    } catch {
      throw new Error("User found, but the profile cannot be acessed")
    }

    try {
      await frame.waitForSelector(".value_important", { timeout: 10000 })
    } catch {
      throw new Error("Unable to load profile")
    }

    let nickname;
    let patent;
    let coalition;
    let militaryPoints;
    let militaryClassification;
    let economyPoints;
    let economyClassification;
    let totalGames;
    let soloVictories;
    let coalitionVictories;
    let pvpKd;
    let provinceKd;
    
    try {
      nickname = await frame.evaluate(() => {
        return document.getElementsByClassName('user_meta_row')[0].innerText
      });
    } catch (error) {

    }

    try {
      patent = await frame.evaluate(() => {
        return document.getElementsByClassName('user_meta_row')[1].innerText
      });
    } catch (error) {

    }

    try {
      coalition = await frame.evaluate(() => {
        return document.getElementsByClassName('user_meta_row')[2].innerText
      });
    } catch (error) {

    }

    try {
      militaryClassification = await frame.evaluate(() => {
        return document.getElementsByClassName('positive')[1].innerText
      });
    } catch (error) {

    }

    try {
      militaryPoints = await frame.evaluate(() => {
        return document.getElementsByClassName('positive')[0].innerText
      });
    } catch (error) {

    }

    try {
      economyClassification = await frame.evaluate(() => {
        return document.getElementsByClassName('economic_score_text')[1].innerText
      });
    } catch (error) {

    }

    try {
      economyPoints = await frame.evaluate(() => {
        return document.getElementsByClassName('economic_score_text')[0].innerText
      });
    } catch (error) {

    }

    try {
      totalGames = await frame.evaluate(() => {
        return document.getElementsByClassName('value_important')[0].innerText
      });
    } catch (error) {

    }

    try {
      soloVictories = await frame.evaluate(() => {
        return document.getElementsByClassName('value_important')[1].innerText
      });
    } catch (error) {

    }

    try {
      coalitionVictories = await frame.evaluate(() => {
        return document.getElementsByClassName('value_important')[2].innerText
      });

    } catch (error) {

    }

    try {
      pvpKd = await frame.evaluate(() => {
        return document.getElementsByClassName('value_important')[3].innerText
      });
    } catch (error) {

    }

    try {
      provinceKd = await frame.evaluate(() => {
        return document.getElementsByClassName('value_important')[4].innerText
      });

    } catch (error) {

    }

    await page.close()

    return {
      nickname,
      patent,
      coalition,
      stats: {
        militaryClassification,
        militaryPoints,
        economyClassification,
        economyPoints,
        gamesPlayed: totalGames,
        soloVictories,
        coalitionVictories,
        pvpKd,
        provinceKd
      },
    }

    async function getStatsByID() {
      
    }
  }
}

module.exports.Scraper = Scraper