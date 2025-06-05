import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(), // Sparticuz uses function call
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
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
            .bg-\\[\\#CCCCCC\\] {
              background-color: #CCCCCC;
            }
            .space-y-1 > * + * {
              margin-top: 4px;
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
            #header {
              display: flex;
              width: 100%;
              align-items: center;
              justify-content: space-between;
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

    const pdf = await page.pdf({
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

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename || "document"}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message + " baru3"
            : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
