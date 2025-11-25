import type { Request, Response } from "express";
import Payments from "../../database/tables/paymentsTable";
import generateTransactionId from "../../utils/generateTransactionId";
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";
import Users from "../../database/tables/usersTable";
import transporter from "../../config/email";

const smartCollectWebhook = async (req: Request, res: Response) => {
 try {
  const { event, payload } = req.body;

  console.log("✅ Smart Collect Webhook received:", event);

  if (event === 'virtual_account.credited') {   
   const entity = payload?.payment?.entity;
   const amount = entity?.amount / 100;
   const accNo = payload?.virtual_account?.entity?.receivers?.[0]?.account_number;
   const paymentId = entity?.id;

   console.log("Account Number", accNo);
   console.log("Amount", amount);
   console.log("PaymentId", paymentId);

   const user = await Users.findOne({
    where: { razAccountNumber: accNo },
    raw: true
   });

   console.log("User", user);

   if (!user) {
    return res.status(200).json({message: 'User not found'});
   };

   const userId = user?.id as number;
   const tbkCredits = Number(user?.tbkCredits) + Number(amount);

   const TransactionId = generateTransactionId();

   await Promise.all([
    Users.update({ tbkCredits }, { where: { id: userId } }),
    Payments?.create({
     RazorpayPaymentId: paymentId,
     RazorpaySignature: '',
     TransactionId,
     PaidAmount: Number(amount)?.toFixed(2),
     PaymentMethod: entity?.method ?? '',
     Reason: "Added TBK Wallet Payment via Razorpay Virtual Account",
     RazorpayOrderId: '',
     userId
    }),
    Ledgers?.create({
     addedByUserId: userId,
     type: "Credit",
     credit: Number(amount)?.toFixed(2),
     reason: "Adding TBK Credits via Razorpay Virtual Account",
     debit: 0,
     balance: tbkCredits,
     PaxName: user?.name ?? '',
     paymentMethod: entity?.method ?? '',
     TransactionId,
     userId,
     particulars: {
      "Amount Credited in TBK Wallet": Number(amount)?.toFixed(2),
      "Credited On": `${dayjs()?.format('DD MMM YYYY, hh:mm A')}`,
     },
    }, {raw: true}),
   ]);

   await transporter.sendMail({
    from: '"Ticket Book Karo" <noreply@ticketbookkaro.com>', // sender address
    to: user?.email,
    subject: "Your TBK Wallet has been credited!",
    html: `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color:#2a4d8f;">Hi ${user?.name ?? 'there'},</h2>
      <p>Good news! Your TBK Wallet has been credited successfully.</p>

      <table style="margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Amount Added:</td>
          <td style="padding: 8px;">₹${Number(amount).toFixed(2)}</td>
        </tr>
        <tr style="background-color: #f2f2f2;">
          <td style="padding: 8px; font-weight: bold;">Current Balance:</td>
          <td style="padding: 8px;">₹${tbkCredits.toFixed(2)}</td>
        </tr>
      </table>

      <p>Thank you for using Ticket Book Karo! We appreciate your trust in us.</p>

      <p style="margin-top:30px;">Best Regards,<br><strong>The TBK Team</strong></p>
     </div>
    `,
   });
  };

  if (event === 'virtual_account.closed') {
   const vAccount = payload.virtual_account?.entity;
   console.log("🚫 Virtual account closed:", vAccount?.id);
  };

  return res.status(200).json({ success: true });
 } catch (error: any) {
  console.error("Smart Collect Webhook Error:", error);
  return res.status(200).json({ message: error?.message });
 };
};

export default smartCollectWebhook;