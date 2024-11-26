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
   const update = async () => {
    await BookingDetails.update(
     { changeRequestId: data?.Response?.ChangeRequestId, flightStatus: "Cancelled" },
     { where: { bookingId: req.body.BookingId }, transaction }
    );

    const booking = await BookingDetails.findOne({ where: { bookingId: req.body.BookingId }, transaction });    
    const info = data?.Response?.TicketCRInfo?.[0];

    await CancelledFlights.create({
     ChangeRequestId: booking?.changeRequestId as string,
     TicketId: info?.TicketId,
     cancelledDate: new Date(),
     Status: info?.Status,
     Remarks: info?.Remarks,
     ChangeRequestStatus: info?.Status,
     CancellationCharge: info?.CancellationCharge,
     RefundedAmount: info?.RefundedAmount,
     ServiceTaxOnRAF: info?.ServiceTaxOnRAF || 0,
     SwachhBharatCess: info?.SwachhBharatCess || 0,
     KrishiKalyanCess: info?.KrishiKalyanCess || 0,
     CreditNoteNo: info?.CreditNoteNo,
     CreditNoteCreatedOn: new Date(info?.CreditNoteCreatedOn),
     TraceId: data?.Response?.TraceId,
     userId,
    }, { transaction });
   };

   update();
  };

  return res.status(200).json({data}); 
 } catch (error) {
  next(error);
 };
};

export default sendChangeRequest;