import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateInvoice(request, customer) {
  return new Promise((resolve, reject) => {

    const invoicePath = path.join(
      __dirname,
      `../invoices/invoice-${request._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(invoicePath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(22)
      .fillColor("#0d47a1")
      .text("Quick-ResQ", { align: "left" });

    doc
      .fontSize(18)
      .fillColor("black")
      .text("SERVICE INVOICE", { align: "right" });

    doc.moveDown(2);

    // Customer Details Box
    doc.rect(50, 150, 500, 90).stroke("#0d47a1");

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Invoice ID: ${request._id}`, 60, 165)
      .text(`Customer: ${customer.name}`, 60, 185)
      .text(`Email: ${customer.email}`, 60, 205)
      .text(`Service: ${request.problemType}`, 60, 225);

    // Pricing
    const serviceCharge = 500;
    const gst = serviceCharge * 0.18;
    const total = serviceCharge + gst;

    doc.rect(50, 270, 500, 110).stroke("#2e7d32");

    doc
      .fontSize(14)
      .fillColor("#2e7d32")
      .text("Payment Summary", 60, 285);

    doc
      .fontSize(12)
      .fillColor("black")
      .text(`Service Charge: ₹${serviceCharge}`, 60, 315)
      .text(`GST (18%): ₹${gst}`, 60, 335);

    doc
      .fontSize(14)
      .fillColor("#d32f2f")
      .text(`Total Amount: ₹${total}`, 60, 365);

    doc.moveDown(4);

    doc
      .fontSize(12)
      .fillColor("#0d47a1")
      .text("Thank you for choosing Quick-ResQ!", {
        align: "center"
      });

    doc.end();

    stream.on("finish", () => {
      resolve(invoicePath);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

export default generateInvoice;