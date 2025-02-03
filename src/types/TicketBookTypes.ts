import type { Passenger, Segment } from "./BookedFlights";

export interface TicketsData {
    LCCType: "LCC" | "NONLCC";
    wayType: "one-way" | "return";
    fareType: string;
    ResultIndex: string;
    Passengers: Passenger[];
    oldPassengers: Passenger[];
    TokenId: string;
    EndUserIp: string;
    TraceId: string;
    isFlightCombo: boolean;
    flightCities: { origin: string; destination: string };
};

export interface RequestBody {
    ticketsData: TicketsData[];
    TraceId: string;
    paymentType: "wallet" | "razorpay" | "partial";
    razorpayPaymentDetails: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        //   reason: string;
    };
};

export interface UnsuccessfulFlightsArgs {
    bookingAmount: number;
    flightCities?: { origin: string; destination: string; } | undefined;
    paymentMethod: string;
    TraceId: string;
    RefundCreditedDate: Date;
    RefundedAmount: string;
    ResultIndex: string;
    RefundProcessedOn: Date;
    RefundStatus: "Approved" | "Rejected" | "Pending";
    travellers: Passenger[];
    isFlightCombo?: boolean;
    Reason: string;
    RefundedUntil: Date;
    Currency?: string;
    userId: number;
};

export interface NonLCCFlightArgs {
    userId: number;
    bookingId: number;
    TraceId: string;
    PNR: string;
    isFlightCombo?: boolean;
    tboAmount: string;
    tbkAmount: string;
    bookedDate: Date;
    Segments: Segment[];
    flightStatus: string;
    paymentTransactionId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    bookingStatus: 'hold',
    Source: number;
    bookingExpiryDate: string;
    Passenger: Passenger[];
    flightCities?: { origin: string; destination: string } | undefined;
    isPNRCancelled: boolean;
    isTicketGenerated: boolean;
};