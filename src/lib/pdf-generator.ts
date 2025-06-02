"use server";

import puppeteer from "puppeteer";

export async function generatePDF(
  elementId: string,
  filename: string,
  MKId: string
) {
  try {
    // Launch puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Get the current page URL to render the same content
    const mkPath = `/dashboard/data/mk/${MKId}`; 
    const currentUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }${mkPath}`;

    await page.goto(currentUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for the specific element to be loaded
    await page.waitForSelector(`#${elementId}`, { timeout: 10000 });

    // Set page format for PDF
    await page.emulateMediaType("print");

    // Generate PDF with specific options for table content
    const pdf = await page.pdf({
      format: "A4",
      landscape: false, // Better for wide tables
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
      pdf: pdf.toString(),
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
