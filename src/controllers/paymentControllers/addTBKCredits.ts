import type {Request, Response, NextFunction} from "express";
import Users from "../../database/tables/usersTable";
import "dotenv/config";
import crypto from "crypto";
import razorpay from "../../config/razorpay";
import Ledgers from "../../database/tables/ledgerTable";
import Invoices from "../../database/tables/invoicesTable";
import sequelize from "../../config/sql";
import dayjs from "dayjs";

const addTBKCredits = async (req: Request, res: Response, next: NextFunction) => {
 const {id} = res.locals?.user;
 const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    
 if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
  return res.status(400).json({message: "All fields are required"}); 
 };
    
 const transaction = await sequelize.transaction();

 try {
  const user = await Users.findOne({where: {id}});
  if (!user) return res.status(404).json({message: 'User not found'});

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
   .createHmac("sha256", process.env.RAZORPAY_API_SECRET as string)
   .update(sign.toString())
   .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if(!isAuthentic) return res.status(400).json({success: false});

  const payment = await razorpay.payments.fetch(razorpay_payment_id);

  let amount = 0;

  if(payment?.currency === "INR") amount = Number(payment?.amount) / 100;

  const tbkCredits = Number(user?.dataValues?.tbkCredits) + Number(amount);

  let invoiceNo: string | number = "";

  const invoices = await Invoices.findAll({
   limit: 1,
   order: [['createdAt', 'DESC']],
   transaction
  });

  if(!invoices?.length) {
   invoiceNo  = "ID/2425/1";
  } else {
   const invoice = invoices?.[0];
   invoiceNo = invoice?.dataValues?.InvoiceNo?.split("/")?.[2];
  };

  const InvoiceId = !invoices?.length ? 1 : Number(invoices?.[0]?.InvoiceId) + 1;
  const InvoiceNo = !invoices?.length ? invoiceNo : `ID/2425/${Number(invoiceNo) + 1}`;

  await Invoices.create({
   InvoiceId,
   InvoiceNo,
//    tboAmount: details?.reduce((acc, defVal) => acc + Number(defVal?.tboAmount), 0),
//    tbkAmount: details?.reduce((acc, defVal) => acc + Number(defVal?.tbkAmount), 0),
   userId: id,
  }, {transaction});

  await Ledgers.create({
   addedBy: user?.name,
   credit: amount,
   debit: 0,
   balance: tbkCredits,
   PaxName: user?.name,
   userId: id,
   InvoiceNo,
   type: "Credit",
   particulars: {
    "Amount Credited in TBK Wallet": amount,
    "Credited On" : `${dayjs().format('DD MMM YYYY, hh:mm A')}`,
   },
  }, {transaction});

  await Users.update({tbkCredits}, {where: {id}, transaction});
  return res.status(200).json({tbkCredits});
 } catch (error: any) {
  next(error);
 };
};

export default addTBKCredits;