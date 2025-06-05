import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

let browser;

async function getBrowser() {
  if (browser) return browser;

  const isVercel = process.env.VERCEL === "1";
  const isProd = process.env.NODE_ENV === "production";

  if (isVercel && isProd) {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    });
  } else {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }

  return browser;
}

export async function POST(request) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>RPS Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              background: white;
            }
            table {
              max-width: 100%;
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #CCCCCC;
              font-weight: bold;
            }
            .text-center {
              text-align: center;
            }
            .font-medium {
              font-weight: 600;
            }
            h2, h3, h4, h5 {
              margin: 5px 0;
              text-align: center;
            }
            h2 { font-size: 18px; }
            h3 { font-size: 16px; }
            h4 { font-size: 14px; }
            h5 { font-size: 12px; }
            img {
              max-width: 100px;
              height: auto;
            }
            @media print {
              html, body {
                height: auto;
                overflow: visible;
              }
              table, div, p, section {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
      `,
      { waitUntil: "networkidle0" }
    );

    const bodyHeight = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
    });

    const heightInInches = bodyHeight / 96;

    const pdfBuffer = await page.pdf({
      width: "210mm",
      height: `${heightInInches}in`,
      printBackground: true,
      margin: {
        top: "10px",
        right: "10px",
        bottom: "0px",
        left: "10px",
      },
    });

    await page.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(
          filename || "document"
        ).replace(/[^a-zA-Z0-9-_]/g, "")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
