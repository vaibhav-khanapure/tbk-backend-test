import "dotenv/config";
import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";
import crypto from "crypto";
import razorpay from "../../config/razorpay";
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";
import generateTransactionId from "../../utils/generateTransactionId";

const addTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
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

  const [payment, user] = await Promise.all([
   razorpay.payments.fetch(razorpay_payment_id),
   Users.findOne({where: {id: userId}, attributes: {include: ["tbkCredits"]}}),
  ]);

  if (!user) return res.status(404).json({message: 'User not found'});

  let amount = Number(payment?.amount) / 100;

  const tbkCredits = (Number(user?.tbkCredits) + Number(amount))?.toFixed(2);

  const TransactionId = generateTransactionId();

  await Promise.all([
   Users.update({tbkCredits}, {where: {id: userId}}),
   Ledgers.create({
    addedBy: userId,
    type: "Credit",
    credit: Number(amount)?.toFixed(2),
    debit: 0,
    balance: tbkCredits,
    PaxName: user?.name,
    paymentMethod: payment?.method,
    TransactionId,
    userId,
    particulars: {
     "Amount Credited in TBK Wallet": Number(amount)?.toFixed(2),
     "Credited On": `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
    },
   }),
  ]);

  return res.status(200).json({tbkCredits});
 } catch (error: any) {
  next(error);
 };
};

export default addTBKCredits;