import "dotenv/config";
import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";
import crypto from "crypto";
import razorpay from "../../config/razorpay";
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";
import generateTransactionId from "../../utils/generateTransactionId";
import Payments from "../../database/tables/paymentsTable";

const addTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const username = res?.locals?.user?.name || "";

  if (!userId) return res.status(401).json({message: "Unauthorized"});

  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
   return res.status(400).json({message: "All fields are required"}); 
  };

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
   .update(sign.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if(!isAuthentic) return res.status(400).json({success: false});

  const [payment, user, orderedPayment] = await Promise.all([
   razorpay.payments.fetch(razorpay_payment_id),
   Users.findByPk(userId, {attributes: ["tbkCredits"], raw: true}),
   Payments.findOne({
    where: {RazorpayOrderId: razorpay_order_id},
    attributes: ["RazorpayPaymentId", "RazorpaySignature"],
    raw: true,
   }),
  ]);

  if (!user) return res.status(404).json({message: 'User not found'});

  if (!orderedPayment) return res.status(400).json({success: false});

  if (orderedPayment?.RazorpayPaymentId || orderedPayment?.RazorpaySignature) {
   return res.status(400).json({success: false});
  };

  if (orderedPayment?.RazorpayPaymentId === razorpay_payment_id || orderedPayment?.RazorpaySignature === razorpay_signature) {
   return res.status(400).json({success: false});
  };

  const amount = Number(payment?.amount) / 100;

  const tbkCredits = (Number(user?.tbkCredits) + Number(amount))?.toFixed(2);

  const TransactionId = generateTransactionId();

  await Users.update({tbkCredits}, {where: {id: userId}}),

  await Promise.all([
   Payments?.update({
    RazorpayPaymentId: razorpay_payment_id,
    RazorpaySignature: razorpay_signature,
    TransactionId,
    PaidAmount: Number(amount)?.toFixed(2),
    PaymentMethod: payment?.method,
    Reason: "Added TBK Wallet Payment",
    userId
   }, {
    where: {RazorpayOrderId: razorpay_order_id},
   }),
   Ledgers?.create({
    addedByUserId: userId,
    type: "Credit",
    credit: Number(amount)?.toFixed(2),
    reason: "Adding TBK Credits",
    debit: 0,
    balance: tbkCredits,
    PaxName: username,
    paymentMethod: payment?.method,
    TransactionId,
    userId,
    particulars: {
     "Amount Credited in TBK Wallet": Number(amount)?.toFixed(2),
     "Credited On": `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
    },
   }, {raw: true}),
  ]);

  return res.status(200).json({tbkCredits});
 } catch (error: any) {
  next(error);
 };
};

export default addTBKCredits;