import axios from "axios";
import type {NextFunction, Request, Response} from "express";
import Settings from "../../database/tables/settingsTable";
import BookingDetails from "../../database/tables/bookingDetailsTable";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";
import sequelize from "../../config/sql";

const sendChangeRequest = async (req: Request,res: Response, next: NextFunction) => {
 const transaction = await sequelize.transaction();

 try {
  const settingData = await Settings.findOne();
  req.body.TokenId = settingData?.dataValues?.TboTokenId;
  req.body.EndUserIp = process.env.EndUserIp;

  const {user} = res.locals;
  const userId = user?.id;

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SendChangeRequest',
   data: req.body,
  });

  if(data?.Response?.ResponseStatus === 1) {
   const info = data?.Response?.TicketCRInfo?.[0];

   await BookingDetails.update(
    { changeRequestId: info?.ChangeRequestId, flightStatus: "Cancelled" },
    { where: { bookingId: req.body.BookingId }, transaction }
   );

   await CancelledFlights.create({
     ChangeRequestId: info?.ChangeRequestId as string,
     TicketId: info?.TicketId,
     cancellationDate: new Date(),
     cancellationCharge: info?.CancellationCharge,
     cancellationType: "Full",
     Status: info?.Status,
     Remarks: info?.Remarks,
     ChangeRequestStatus: info?.Status,
     RefundedAmount: info?.RefundedAmount,
     ServiceTaxOnRAF: info?.ServiceTaxOnRAF || 0,
     SwachhBharatCess: info?.SwachhBharatCess || 0,
     KrishiKalyanCess: info?.KrishiKalyanCess || 0,
     CreditNoteNo: info?.CreditNoteNo,
     CreditNoteCreatedOn: new Date(info?.CreditNoteCreatedOn || new Date()),
     TraceId: data?.Response?.TraceId,
     userId,
   }, { transaction });
  };

  await transaction.commit();
  return res.status(200).json({data}); 
 } catch (error) {
  await transaction.rollback();  
  next(error);
 };
};

export default sendChangeRequest;