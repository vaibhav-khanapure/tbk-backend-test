import transporter from "../config/email";

const sendErrorMail = async (error: unknown) => {
 try {
  await transporter.sendMail({
   from: '"Ticket Book Karo" <dhiraj@zendsoft.com>', // sender address
   to: "vaibhavk1965@gmail.com",
   subject: "TBK Error",
   text: "Error info",
   html: `
    <h1>Error Occurred</h1>
    <pre>${JSON.stringify(error, null, 2)}</pre>
   `,
  });
 } catch (error) {
  console.log("SEND ERROR MAIL, ERROR::", error);
 };
};

export default sendErrorMail;