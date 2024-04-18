import express, { Express, Request, Response } from "express";
import path from "path";
import { setTimeout } from "timers/promises";
import { WebSocket } from "ws";
import fs from "fs";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";
import { Page, TimeoutError } from "puppeteer";
import readline from "readline";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const app: Express = express();
const port = 8080;

const webSocketServer = new WebSocket.Server({ port: 8083 });

const IstanbulArray = [
  "Adalar",
  "Arnavutköy",
  "Ataşehir",
  "Avcılar",
  "Bağcılar",
  "Bahçelievler",
  "Bakırköy",
  "Başakşehir",
  "Bayrampaşa",
  "Beşiktaş",
  "Beykoz",
  "Beylikdüzü",
  "Beyoğlu",
  "Büyükçekmece",
  "Çatalca",
  "Çekmeköy",
  "Esenler",
  "Esenyurt",
  "Eyüpsultan",
  "Fatih",
  "Gaziosmanpaşa",
  "Güngören",
  "Kadıköy",
  "Kağıthane",
  "Kartal",
  "Küçükçekmece",
  "Maltepe", //26
  "Pendik",
  "Sancaktepe",
  "Sarıyer",
  "Silivri",
  "Sultanbeyli",
  "Sultangazi",
  "Şile",
  "Şişli",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
  "Zeytinburnu",
];
// const filePath = path.join(__dirname, "bruh.txt");
const filePath = path.join(__dirname, "allPlaces.txt");
const fileContent = fs.readFileSync(filePath, "utf8");
const lines = fileContent.split("\n");
const firstWordArray = lines.splice(305).map((item) => {
  const fields = item.split(/\s+/);
  if (IstanbulArray.includes(fields[1])) {
    return `${fields[0]} ${fields[1]}`;
  }
  if (IstanbulArray.includes(fields[2])) {
    return `${fields[0]} ${fields[1]} ${fields[2]}`;
  }
  if (IstanbulArray.includes(fields[3])) {
    return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]}`;
  }
  if (IstanbulArray.includes(fields[4])) {
    return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]}`;
  }
  if (IstanbulArray.includes(fields[5])) {
    return `${fields[0]} ${fields[1]} ${fields[2]} ${fields[3]} ${fields[4]} ${fields[5]}`;
  }
});
console.log("HOW MANY CITIES: " + firstWordArray.length);
puppeteerExtra.use(stealthPlugin());

webSocketServer.on("connection", (ws: WebSocket) => {
  async function getAllResults() {
    const browser = await puppeteerExtra.launch({
      headless: false,
      // executablePath: "/usr/bin/google-chrome-stable",
      args: [
        "--remote-debugging-port=9222",
        "--remote-debugging-address=0.0.0.0",
        "--no-sandbox",
      ],
    });
    const page = await browser.newPage();
    const allData = [] as any;

    for (let i = 0; i < firstWordArray.length; i++) {
      try {
        await page.goto(
          `https://www.google.com/search?sca_esv=a2de1c70e4a64dfa&tbs=lf:1,lf_ui:9&tbm=lcl&sxsrf=ACQVn0_D0U12xt6RZCefQu8XKWRgAvSJlA:1709814466766&q=${firstWordArray[i]}+restoranlar&rflfq=1&num=10&sa=X&ved=2ahUKEwjmjbGfk-KEAxWHSvEDHYnVCZ8QjGp6BAgYEAE&biw=1536&bih=695&dpr=1.25#rlfi=hd:;si:;mv:[[40.879543999999996,29.136159899999996],[40.8468051,29.097792999999996]];tbs:lrf:!1m4!1u3!2m2!3m1!1e1!1m4!1u2!2m2!2m1!1e1!2m1!1e2!2m1!1e3!3sIAE,lf:1,lf_ui:9`,
          {
            waitUntil: "networkidle0",
            timeout: 60000,
          }
        );
        try {
          let hasNext = true;
          while (hasNext) {
            await setTimeout(3000);

            await page.waitForSelector(`div[jscontroller="AtSb"]`, {
              timeout: 8000,
            });

            //all iterable list items
            const selectors = await page.$$(`div[jscontroller="AtSb"]`);

            const filteredSelectors = [] as any;
            //filter out ads from whole selection array
            for (const selector of selectors) {
              const hasDescendant = await selector.evaluate((el, className) => {
                return Boolean(el.querySelector(`.${className}`));
              }, "kuaBWe");

              if (!hasDescendant) {
                filteredSelectors.push(selector);
              }
            }
            //shitty code piece doesnt work as it supposed to but nvm
            // async function tryClickSelectors(
            //   page: Page,
            //   selectors: string[],
            //   selectorReal: any
            // ) {
            //   for (const selector of selectors) {
            //     try {
            //       await selectorReal.waitForSelector(selector);
            //       const element = await selectorReal.$(selector);
            //       if (element) {
            //         await element.click();
            //         return true;
            //       }
            //     } catch (error) {
            //       console.log(`Error clicking selector ${selector}: ${error}`);
            //     }
            //   }
            //   return false; // Return false if none of the selectors were clickable
            // }
            //console logging the restaurant number
            console.log(
              "Reklamsız restoran sayısı: " + filteredSelectors.length
            );
            for (const selector of filteredSelectors) {
              try {
                // await page.$eval(
                //   ".gLFyf",
                //   (el: any) => (el.value = "test@example.com")
                // );
                // await setTimeout(9999999);
                await setTimeout(2000);
                //for wahetever reason you speciiflly need to click the span component instead of actual div that it is iteareted to avoid
                //      throw new Error('Node is either not clickable or not an Element'); error,
                await selector.waitForSelector(".OSrXXb");
                const realSelector = await selector.$(".OSrXXb");

                await realSelector.click();

                //setting timeout here is important since it takes load time to load this and you cann do waitfor selector since it wsill confilct with already appeared components

                await setTimeout(2000);
                //for wahetever reason google keeps state of header clicked so navigate to home. fucking nonsense
                await page.waitForSelector(
                  'div[jsname="xNyui"] > a[jsname="AznF2e"]'
                );
                const navigationHome = await page.$$(
                  'div[jsname="xNyui"] > a[jsname="AznF2e"]'
                );
                if (navigationHome.length > 0) {
                  await navigationHome[0].click();
                } else {
                  throw new Error("nası yani");
                }
                //clicking should be waited with second
                await setTimeout(1000);

                let openDatesData = <any>[];
                //if there is date entger here
                const element = await page.$(".BTP3Ac");
                if (element) {
                  await element.click();
                  const openDatesDataQuery = await page.evaluate(() => {
                    const rowsOfDates = Array.from(
                      document.querySelectorAll("tbody > tr")
                    );
                    const startIndex = rowsOfDates.findIndex((item) =>
                      item.classList.contains("K7Ltle")
                    );

                    return rowsOfDates
                      .slice(startIndex, startIndex + 7)
                      .map((row) => ({
                        day: row.children[0]?.textContent?.trim(),
                        hours: row.children[1]?.textContent?.trim(),
                      }));
                  });
                  openDatesData.push(...openDatesDataQuery); // Add fetched data to openDatesData
                } else {
                  console.log("no date provided no breakout pls");
                  openDatesData = null;
                }

                //fetchinbg info about the restaurant
                const restaurantSingle = await page.evaluate((selectorr) => {
                  const openDates = <any>[];
                  const h2 = document.querySelector("h2[data-ved] > span");
                  const link = document.querySelector(
                    'div[jsname="UXbvIb"] a.mI8Pwc'
                  );
                  const restaurantWebsiteLink = link
                    ? link.getAttribute("href")
                    : null;

                  const detailedTitle = h2 ? h2.textContent : null;
                  const restaurantTitle =
                    selectorr.querySelector(".OSrXXb")?.textContent || null;

                  const adress = document.querySelector(".LrzXr");

                  const locationAddress = adress ? adress.textContent : null;

                  const ratingOverall =
                    selectorr
                      .querySelector(".Y0A0hc")
                      .querySelector("span:nth-child(1)")?.textContent || null;

                  const ratingOverallNumber =
                    selectorr
                      .querySelector(".Y0A0hc")
                      .querySelector("span:nth-child(3)")?.textContent || null;

                  // const priceSelector = Array.from(
                  //   selectorr.querySelectorAll(".rllt__details > div:nth-child(2) > span")
                  // ).find(
                  //   (span: any) => // Using `any` for simplicity, but you could use `Element` and then assert it
                  //     (span as HTMLElement).textContent?.includes("₺") || (span as HTMLElement).textContent?.includes("$")
                  // )?.textContent;

                  return {
                    detailedTitle,
                    restaurantTitle,
                    ratingOverall,
                    ratingOverallNumber,
                    restaurantWebsiteLink,
                    locationAddress,
                    openDates,
                  };
                }, selector);
                //button to wait for clicking image
                let allImageUrlData = <any>[];
                await page.setRequestInterception(true);
                console.log("starting image fetching");
                const startTime = Date.now();
                // No images found for this restaurant.TimeoutError: Waiting for selector `div[jscontroller="U0Base"] img[jsaction="rcuQ6b:trigger.M8vzZb;"]` failed: Waiting failed: 6000ms exceeded
                const handleImageFetchWhole = (request: any) => {
                  if (request.isInterceptResolutionHandled()) {
                    return;
                  }
                  const elapsedTime = Date.now() - startTime;
                  if (elapsedTime > 20000) {
                    request.continue();
                    return;
                  }
                  if (
                    request.url().endsWith(".png") ||
                    request.url().endsWith(".jpg")
                  ) {
                    allImageUrlData = [
                      ...allImageUrlData,
                      { url: request.url() },
                    ].slice(0, 25);
                  }
                  request.continue();
                };

                try {
                 await page.waitForSelector('button[jscontroller="PEXgde"]', {
                   timeout: 20000,
                 });
                 await page.evaluate(() => {
                   const element = document?.querySelector(
                     'button[jscontroller="PEXgde"]'
                   );
                   if (element instanceof HTMLElement) {
                     element.click();
                   }
                 });
                 const imageUrlClickElement = await page.$(
                   'button[jscontroller="PEXgde"]'
                 );
                 await imageUrlClickElement?.click();
                  //clicking with 2 methods doesnt make sense but somehow works better
                  // await page.focus('button[jscontroller="PEXgde"]')
                  // await page.keyboard.type('\n')
                  try {
                    page.on("request", handleImageFetchWhole);
                    await page.waitForSelector(
                      'div[jscontroller="U0Base"] img[jsaction="rcuQ6b:trigger.M8vzZb;"]'
                    );
                  } catch (error) {
                    if (error instanceof TimeoutError) {
                      console.log("No images found for this restaurant." + error);
                      // allImageUrlData = null; // Set to indicate no images were found
                    } else {
                      // Log other errors
                      console.error("Error fetching images:", error);
                    }
                  }
                  //closing down the image modal that is appeared
                  console.log("closing the modal");
                  console.dir(allImageUrlData, { depth: null });
                  const closingTheModal = await page.$(".jA3abb");
                  await closingTheModal?.click();
                } catch (error) {
                  console.log("error for clicking image" + error);
                }


                //this tiemout important since for whatever reason, waitforselector method is not enough for these clicks
                await setTimeout(1000);
                page.off("request", handleImageFetchWhole);


                //waiting for headers to appear and navigatin to reviews
                await page.waitForSelector(
                  'div[jsname="xNyui"] > a[jsname="AznF2e"]',
                  {
                    visible: true,
                  }
                );

                const openingReviews = await page.$$(
                  'div[jsname="xNyui"] > a[jsname="AznF2e"]'
                );
                if (openingReviews.length >= 2) {
                  // Click the last tab which could be "Reviews"
                  await openingReviews[openingReviews.length - 1].click();
                } else {
                  throw new Error("Expected review tabs not found");
                }
                let allReviewData = <any>[];

                try {
                  await page.waitForSelector("div.bwb7ce", {
                    visible: true,
                    timeout: 6000,
                  });

                  await setTimeout(1000);
                  const startTime = Date.now();
                  console.log("start time reservation" + startTime);
                  while (allReviewData.length < 20) {
                    await page.evaluate(() => {
                      const reviewElements =
                        document.querySelectorAll("div.bwb7ce");
                      if (
                        reviewElements.length === 0 ||
                        !reviewElements ||
                        reviewElements === undefined
                      ) {
                        return null;
                      }
                      Array.from(reviewElements, (item) => {
                        const element = item.querySelector(".MtCSLb");
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      });
                    });
                    const reviewDataQuery = await page.evaluate(() => {
                      const reviewElements =
                        document.querySelectorAll("div.bwb7ce");
                      if (
                        reviewElements.length === 0 ||
                        !reviewElements ||
                        reviewElements === undefined
                      ) {
                        return null;
                      }
                      const reviewDataColumns = Array.from(
                        reviewElements,
                        (item) => {
                          const ratingString = item
                            .querySelector(".dHX2k")
                            ?.getAttribute("aria-label");
                          let ratingValue: number | null;
                          if (ratingString) {
                            ratingValue = parseInt(ratingString?.charAt(0));
                          } else {
                            ratingValue = null;
                          }
                          return {
                            ratingPerson:
                              item.querySelector(".Vpc5Fe")?.textContent,
                            ratingPersonType: item.querySelector(".GSM50")
                              ? item
                                  .querySelector(".GSM50")
                                  ?.textContent?.split("·")[0]
                                  .trim()
                              : "no type of person",
                            ratingValue,
                            ratingContent:
                              item.querySelector(".OA1nbd")?.textContent,
                          };
                        }
                      );

                      return reviewDataColumns;
                    });

                    if (
                      reviewDataQuery === null ||
                      reviewDataQuery.length === 0
                    ) {
                      console.log(
                        "No reviews found or unable to fetch reviews."
                      );
                      allReviewData = null;
                    } else {
                      allReviewData = [
                        ...new Set([
                          ...reviewDataQuery.map((item) => ({
                            ratingPerson: item.ratingPerson,
                            ratingPersonType: item.ratingPersonType,
                            ratingValue: item.ratingValue,
                            ratingContent: item.ratingContent,
                          })),
                        ]),
                      ];
                    }

                    await page.evaluate(() => {
                      const scrollHeight =
                        document.querySelector("div#rhs")?.scrollHeight;
                      if (scrollHeight) {
                        document
                          .querySelector("div#rhs")
                          ?.scrollBy(0, scrollHeight);
                      }
                    });

                    await setTimeout(1000);

                    if (allReviewData.length === 0) {
                      break;
                    }
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime > 10000) {
                      console.log(
                        "5 seconds elapsed with less than 20 images, breaking loop."
                      );
                      break; // Break the loop if it's been more than 5 seconds
                    }
                  }
                } catch (error) {
                  if (error instanceof TimeoutError) {
                    console.log("No review found for this restaurant.");
                    allReviewData = null; // Set to indicate no images were found
                  } else {
                    // Log other errors
                    console.error("Error fetching reviews:", error);
                  }
                }

                const allOfTheData = {
                  ...restaurantSingle, // Assuming restaurantSingle is an object containing restaurant details
                  images: allImageUrlData || null, // Ensure allImageUrlData is an array of image URLs
                  reviews: allReviewData || null, // Ensure allReviewData is an array of review data
                  openDates: openDatesData || null, // Add openDatesData array directly
                };
                ws.send(JSON.stringify(allOfTheData));
                console.log(firstWordArray[i]);
                console.dir(allOfTheData, { depth: null });

                // await axios
                //   .post("http://localhost:3000", allOfTheData)
                //   .then((response) => {
                //     if (response.status === 200) {
                //       console.log("savign to data was successful");
                //     }
                //   })
                //   .catch((error) => {
                //     if (error.response.status === 404) {
                //       console.log("error happened for savşng to db");
                //     }
                //   });
              } catch (error) {
                console.error(
                  "Error happened for this restaurant: " +
                    selector +
                    "here is the error: " +
                    error
                );
              }
            }

            const nextPageButton = await page.$("a#pnnext");
            if (nextPageButton) {
              await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle0" }),
                nextPageButton.click(),
              ]);
            } else {
              hasNext = false;
            }
          }
        } catch (error) {
          console.log(
            "error happened while query probably at the end of page: " + error
          );
        }
      } catch (error) {
        console.log("error happpend at most outer try catch block: " + error);
      }
      // await setTimeout(9999999);
      // await setTimeout(30000);
    }
  }

  getAllResults();
});

app.get("/", async (req: Request, res: Response) => {});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "iyiyiz bacım" });
});
