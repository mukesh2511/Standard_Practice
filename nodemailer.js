const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();
const { NODEMAILER_MAIL, NODEMAILER_PASSKEY } = process.env;
const pdf = require("html-pdf");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: NODEMAILER_MAIL,
    pass: NODEMAILER_PASSKEY,
  },
});

// const sendMail = (email, name, subject, sub = "greeting", NODEMAILER_MAIL) => {
//   const templatePath = path.join(__dirname, `../views/${sub}.ejs`);
//   const attachmentPath = path.join(
//     __dirname,
//     "../public/uploads/pdf",
//     "payslip.pdf"
//   );

//   return new Promise((resolve, reject) => {
//     ejs.renderFile(templatePath, { name }, (error, data) => {
//       if (error) {
//         console.log({ error });
//         reject(error);
//       } else {
//         pdf.create(data).toFile(attachmentPath, (pdfError) => {
//           if (pdfError) {
//             console.log({ pdfError });
//             reject(pdfError);
//           } else {
//             console.log("outside");
//             transporter.sendMail(
//               {
//                 from: NODEMAILER_MAIL,
//                 to: email,
//                 subject: subject,
//                 // html: data,
//                 attachments: [
//                   {
//                     filename: "payslip.pdf", // Customize the filename and extension
//                     path: attachmentPath,
//                   },
//                 ],
//               },

//               async (sendMailError, info) => {
//                 console.log("inside");
//                 fs.unlinkSync(attachmentPath, (unlinkError) => {
//                   if (unlinkError) {
//                     console.log("Error deleting file:", unlinkError);
//                   }
//                 });
//                 // deletSingleFile;

//                 if (sendMailError) {
//                   console.log("error", sendMailError);
//                   reject(sendMailError);
//                 } else {
//                   console.log("Email sent successfully:", info.response);
//                   resolve(info);
//                 }
//               }
//             );
//           }
//         });
//       }
//     });
//   });
// };

const puppeteer = require("puppeteer");

const sendMail = (email, name, subject, sub = "greeting", NODEMAILER_MAIL) => {
  const templatePath = path.join(__dirname, `../views/${sub}.ejs`);
  const attachmentPath = path.join(
    __dirname,
    "../public/uploads/pdf",
    "payslip.pdf"
  );

  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, { name }, async (error, data) => {
      if (error) {
        console.log({ error });
        reject(error);
      } else {
        try {
          const data = await ejs.renderFile(templatePath, { name });

          const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
            timeout: 60000, // Increase timeout to 60 seconds
          });

          const page = await browser.newPage();
          await page.setContent(data, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          await page.pdf({
            path: attachmentPath,
            format: "A4",
            timeout: 60000,
          });
          await browser.close();

          console.log("PDF generated successfully");

          // Create a transporter object using the default SMTP transport

          transporter.sendMail(
            {
              from: NODEMAILER_MAIL,
              to: email,
              subject: subject,
              attachments: [
                {
                  filename: "payslip.pdf",
                  path: attachmentPath,
                },
              ],
            },
            (sendMailError, info) => {
              fs.unlink(attachmentPath, (unlinkError) => {
                if (unlinkError) {
                  console.log("Error deleting file:", unlinkError);
                }
              });

              if (sendMailError) {
                console.log("Error sending email:", sendMailError);
                reject(sendMailError);
              } else {
                console.log("Email sent successfully:", info.response);
                resolve(info);
              }
            }
          );
        } catch (pdfError) {
          console.log({ pdfError });
          reject(pdfError);
        }
      }
    });
  });
};

module.exports = sendMail;
