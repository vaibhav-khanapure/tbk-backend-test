import type {Request, Response, NextFunction} from "express";
import { Transaction } from 'sequelize';
import BookingDetails, { BookingDetailsTypes } from "../../database/tables/bookingDetailsTable";
import Invoices from "../../database/tables/invoicesTable";
import Ledgers from "../../database/tables/ledgerTable";
import uuid from "../../utils/uuid";
import Users, { type userTypes } from "../../database/tables/usersTable";
import sequelize from "../../config/sql";

const addBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
 const transaction: Transaction = await sequelize.transaction();

 try {
  const {user} = res.locals;
  const userId = user?.id;

  const details = req.body;
  const date = new Date();

  if(!Array.isArray(details)) {
   await transaction.rollback();
   return res.status(400).json({ message: 'Expected Some booking details not empty array' });
  };

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
   tboAmount: details?.reduce((acc, defVal) => acc + defVal?.tboAmount, 0),
   tbkAmount: details?.reduce((acc, defVal) => acc + defVal?.tbkAmount, 0),
   userId,
  }, { transaction });

  const getUser = await Users.findOne({
   where: { id: userId },
   transaction
  }) as userTypes;

  await Ledgers.create({
   addedBy: "TBK-Booking-Flight",
   balance: Number(getUser?.tbkCredits) - Number(details?.reduce((acc, defVal) => acc + defVal?.tbkAmount, 0)),
   credit: 0,
   debit: details?.reduce((acc, defVal) => acc + defVal?.tbkAmount, 0),
   InvoiceNo,
   PaxName: getUser?.name,
   ReferenceNo: 999,
   TxReferenceId: `R${date?.getFullYear()}${date?.getMonth() + 1}${date?.getDate()}-${uuid(10,{numbers: true})}`,
   type: "Receipt",
   userId
  }, { transaction });

  const bookings = details?.map((booking: BookingDetailsTypes) => ({
    bookingId: booking?.bookingId,
    TraceId: booking?.TraceId,
    PNR: booking?.PNR,
    tboAmount: booking?.tboAmount,
    tbkAmount: booking?.tbkAmount,
    bookedDate: booking?.bookedDate || new Date(),
    InvoiceNo,
    InvoiceId,
    Passenger: booking?.Passenger,
    Segments: booking?.Segments,
    IsLCC: booking?.IsLCC,
    flightStatus: booking?.flightStatus,
    userId,
  })) as BookingDetailsTypes[];

  const booking = await BookingDetails?.bulkCreate(bookings, { transaction });

  await transaction.commit();
  return res.status(201).json({data: booking, RequestedData: req.body});
 } catch (error) {
  await transaction.rollback();
  next(error);
 }
};

export default addBookingDetails;