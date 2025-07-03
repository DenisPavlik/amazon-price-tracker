'use server'
import puppeteer from "puppeteer";

export async function addProduct(productId: string) {
  const url = `https://www.amazon.com/dp/${productId}`;
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const title = document.querySelector("#productTiltle")?.textContent?.trim()

    const priceString = document.querySelector(".a-price .a-offscreen")?.textContent?.replace("$", "") || "0";
    const price = parseFloat(priceString);

    const img = document.querySelector("#landingImage")?.getAttribute("src");

    const reviewsCountString = document.querySelector("#acrCustomerReviewText")?.textContent?.split(" ")[0].replace(",", "") || "0";
    const reviewsCount = parseInt(reviewsCountString);

    const ratingString = document.querySelector(".a-icon-alt")?.textContent?.split(" ")[0] || "0";
    const reviewsAverageRating = parseFloat(ratingString);

    return { title, price, img, reviewsCount, reviewsAverageRating };
  })

  await browser.close();

  return data;
}