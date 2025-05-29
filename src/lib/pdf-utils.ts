"use client";

export async function generatePDFFromElement(
  elementId: string,
  filename: string,
  MKId: string
) {
  try {
    // Get the element content
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Get the HTML content
    const htmlContent = clonedElement.outerHTML;

    // Send to API route for PDF generation
    const response = await fetch("/api/mk/generatePdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        filename: filename,
        MKId: MKId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error("PDF generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
