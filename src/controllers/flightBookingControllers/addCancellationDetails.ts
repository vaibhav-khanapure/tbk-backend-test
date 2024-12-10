import type {NextFunction, Request, Response} from "express";
import CancelledFlights from "../../database/tables/cancelledFlightsTable";

const addCancellationDetails = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {user} = res.locals;
  const userId = user?.id;

  const cancellationDetails = req.body.data;

  // Check if the input is an array
  if(!Object.keys(cancellationDetails).length) {
   return res.status(400).json({ message: 'Expected Some cancellation details not empty object' });
  }; 

  // Insert each traveller detail into the database
  const cancelledData = await CancelledFlights.create({
    flightData: cancellationDetails?.flightData,
    cancelledDate: cancellationDetails?.cancelledDate,
    CancellationCharge: cancellationDetails?.CancellationCharge,
    ServiceTaxOnRAF: cancellationDetails?.ServiceTaxOnRAF,
    ChangeRequestId: cancellationDetails?.ChangeRequestId,
    ChangeRequestStatus: cancellationDetails?.ChangeRequestStatus,
    CreditNoteCreatedOn: cancellationDetails?.CreditNoteCreatedOn,
    CreditNoteNo: cancellationDetails?.CreditNoteNo,
    KrishiKalyanCess: cancellationDetails?.KrishiKalyanCess,
    RefundedAmount: cancellationDetails?.RefundedAmount,
    refundExpectedBy: cancellationDetails?.refundExpectedBy,
    refundRequestRaised: cancellationDetails?.refundRequestRaised,
    SwachhBharatCess: cancellationDetails?.SwachhBharatCess,
    TicketId: cancellationDetails?.TicketId,
    TraceId: cancellationDetails?.TraceId,
    userId
  });

  return res.status(201).json({data: cancelledData});
 } catch (error) {
  next(error);
 };
};

export default addCancellationDetails;