import "dotenv/config";
import crypto from "crypto";
import type {Request, Response, NextFunction} from "express";
import razorpay from "../../config/razorpay";
import Payments from "../../database/tables/paymentsTable";
import generateTransactionId from "../../utils/generateTransactionId";
import Users from "../../database/tables/usersTable";
import Ledgers from "../../database/tables/ledgerTable";
import { Op } from "sequelize";

const ticketBookWithPayment = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature, reason, isUsingExistingCredits, TraceId, ticketsData} = req.body;

  if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
   return res.status(400).json({message: "All fields are required"}); 
  };

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
   .update(sign.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if(!isAuthentic) return res.status(400).json({success: false});

  const [payment, user, existingPayment] = await Promise.all([
   razorpay.payments.fetch(razorpay_payment_id),
   Users.findOne({where: {id: userId}, attributes: {include: ["tbkCredits"]}}),
   Payments.findOne({
    where: {
     [Op.or]: [
      {RazorpayPaymentId: razorpay_payment_id},
      {RazorpaySignature: razorpay_signature}
     ]
    }
   })
  ]);

  if (existingPayment) return res.status(400).json({message: "Wrong Credentials for Booking Payment"});

  const amount = Number(payment?.amount) / 100;

  const TrxnId = generateTransactionId();

  await Promise.all([
   Payments?.update({
    RazorpayPaymentId: razorpay_payment_id,
    RazorpaySignature: razorpay_signature,
    TransactionId: TrxnId,
    PaidAmount: Number(amount)?.toFixed(2),
    PaymentMethod: payment?.method,
    ...(reason ? {Reason: reason} : {}),
    userId
   }, {where: {RazorpayOrderId: razorpay_order_id}}),

   ...(isUsingExistingCredits ? [
    Users.update({tbkCredits: 0}, {where: {id: userId}}),
    Ledgers.create({
     userId,
     addedBy: userId,
     balance: 0,
     type: "Invoice",
     credit: 0,
     paymentMethod: "wallet",
     TransactionId: TrxnId,
     debit: String(user?.tbkCredits),
     particulars: {},
     PaxName: "",
    })
   ] :  [])
  ]);

  return res.status(201).json({method: payment?.method, TrxnId});
 } catch (error) {
  next(error);
 };  
};

export default ticketBookWithPayment;