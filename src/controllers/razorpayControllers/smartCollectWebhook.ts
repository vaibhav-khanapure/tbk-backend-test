import type { Request, Response } from "express";
import Payments from "../../database/tables/paymentsTable";
import generateTransactionId from "../../utils/generateTransactionId";
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";
import Users from "../../database/tables/usersTable";

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