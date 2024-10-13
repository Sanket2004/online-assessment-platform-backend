const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const User = require("../models/User");
const path = require("path"); // Import path to resolve image and font paths

router.get(
  "/certificate/:userId/:score/:totalQuestions/:testTitle",
  async (req, res) => {
    const { userId, score, totalQuestions, testTitle } = req.params;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const percentage = ((score / totalQuestions) * 100).toFixed(2);

      // Create a new PDF document
      const doc = new PDFDocument({ size: "A4", layout: "landscape" });

      // Set headers for the response to download the PDF
      res.setHeader(
        "Content-disposition",
        `attachment; filename=certificate-${userId}.pdf`
      );
      res.setHeader("Content-type", "application/pdf");

      // Pipe the document to the response
      doc.pipe(res);

      // Load the image as background (the image you uploaded)
      const imagePath = path.join(__dirname, "./img/certi.png");
      doc.image(imagePath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });

      // Load custom font if needed (optional)
      const fontPath = path.join(__dirname, "fonts", "SpaceMono.ttf");
      doc.registerFont("CustomFont", fontPath);

      // Overlay the name on the certificate
      doc
        .font("CustomFont")
        .fontSize(35)
        .fill("#333333")
        .text(user.name, 58, 280, { align: "left", width: 350 });

      // Overlay the score
      doc
        .fontSize(15)
        .fillColor("#025b40")
        .text(`has scored ${percentage}% in the assessment ${testTitle}`, 58, 350, {
          align: "left",
          width: 350,
        });

        doc
        .fontSize(10)
        .fillColor("#d0d0d0")
        .text(`${userId}`, 58, 500, {
          align: "left",
          width: 350,
        });

      // Finalize the PDF and send it
      doc.end();
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ message: "Error generating certificate" });
    }
  }
);

module.exports = router;
