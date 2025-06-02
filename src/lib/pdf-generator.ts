"use server";

import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generatePDF(
  elementId: string,
  filename: string,
  MKId: string
) {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        (await chromium.executablePath) || "/usr/bin/chromium-browser",
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    const mkPath = `/dashboard/data/mk/${MKId}`;
    const currentUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }${mkPath}`;

    await page.goto(currentUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.waitForSelector(`#${elementId}`, { timeout: 10000 });

    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "a4",
      landscape: false,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    return {
      success: true,
      pdf: pdf.toString("base64"),
      filename: `${filename}.pdf`,
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
