export interface BookedFlightTypes {
    id: string;
    bookingId: number;
    TraceId: string;
    PNR: string;
    tboAmount: number;
    tbkAmount: number;
    bookedDate: string; // ISO 8601 date string
    InvoiceNo: string;
    flightCities: {origin: string; destination: string};
    InvoiceId: number;
    isFlightCombo: boolean;
    Passenger: Passenger[];
    cancelledTickets: number[];
    Segments: Segment[];
    IsLCC: boolean;
    flightStatus: string;
    userId: number;

    discount: number;
    markup: number;
    discountUpdatedByStaffId: number;
    fareType: string;

    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
}

export interface Passenger {
    BarcodeDetails: BarcodeDetails;
    DocumentDetails: any; // Adjust type if you have a specific structure
    GuardianDetails: any; // Adjust type if you have a specific structure
    PaxId: number;
    Title: string;
    FirstName: string;
    LastName: string;
    PaxType: number;
    Gender: number;
    isBookingCancelled?: boolean;
    IsPANRequired: boolean;
    IsPassportRequired: boolean;
    PAN: string;
    PassportNo: string;
    PassportExpiry: string;
    DateOfBirth: string;
    AddressLine1: string;
    AddressLine2: string;
    Fare: Fare;
    City: string;
    CountryCode: string;
    CountryName: string;
    Nationality: string;
    ContactNo: string;
    Email: string;
    IsLeadPax: boolean;
    GSTNumber: string;
    FFAirlineCode: string | null;
    FFNumber: string | null;
    Baggage: FlightBaggageType[];
    Seat: { Code: string; Description: string; };
    Meal: { Code: string; Description: string; };
    MealDynamic: MealDynamic[];
    SeatDynamic: SeatDynamic[];
    Ssr: any[];
    Ticket: Ticket;
    SegmentAdditionalInfo: SegmentAdditionalInfo[];
}

interface SegmentAdditionalInfo {
    FareBasis: string;
    NVA: string;
    NVB: string;
    Baggage: string;
    Meal: string;
    Seat: string;
    SpecialService: string;
};

interface BarcodeDetails {
    Id: number;
    Barcode: Barcode[];
};

interface Barcode {
    Index: number;
    Format: string;
    Content: string;
    BarCodeInBase64: string | null;
    JourneyWayType: number;
};

interface Fare {
    Currency: string;
    BaseFare: number;
    Tax: number;
    TaxBreakup: TaxBreakup[];
    YQTax: number;
    AdditionalTxnFeeOfrd: number;
    AdditionalTxnFeePub: number;
    AirlineTransFee: number;
    PGCharge: number;
    OtherCharges: number;
    ChargeBU: ChargeBU[];
    Discount: number;
    PublishedFare: number;
    CommissionEarned: number;
    PLBEarned: number;
    IncentiveEarned: number;
    OfferedFare: number;
    TdsOnCommission: number;
    TdsOnPLB: number;
    TdsOnIncentive: number;
    ServiceFee: number;
    TotalBaggageCharges: number;
    TotalMealCharges: number;
    TotalSeatCharges: number;
    TotalSpecialServiceCharges: number;
    TransactionFee: number;
};

interface TaxBreakup {
    key: string;
    value: number;
};

interface ChargeBU {
    key: string;
    value: number;
};

interface FlightBaggageType {
    AirlineCode: string;
    FlightNumber: string;
    WayType: 0 | 1 | 2;
    Code: string;
    Description: 0 | 1 | 2 | 3 | 4 | 5;
    Weight: number;
    Currency: string;
    Price: number;
    Origin: string;
    Destination: string;
    Text: string;
};

interface MealDynamic {
    AirlineCode: string;
    FlightNumber: string;
    WayType: number;
    Code: string;
    Description: number;
    AirlineDescription: string;
    Quantity: number;
    Currency: string;
    Price: number;
    Origin: string;
    Destination: string;
};

interface SeatDynamic {
    AirlineCode: string;
    AvailablityType: 0 | 1 | 3 | 4 | 5;
    Code: string;
    Compartment: number;
    CraftType: string;
    Currency: string;
    Deck: number;
    Description: number;
    Destination: string;
    FlightNumber: string;
    Origin: string;
    Price: number;
    RowNo: string;
    SeatNo: string;
    SeatType: 1 | 2 | 3;
    SeatWayType: number;
    Text: string;
};

interface Ticket {
    TicketId: number;
    TicketNumber: string;
    IssueDate: string; // ISO 8601 date string
    ValidatingAirline: string;
    Remarks: string;
    ServiceFeeDisplayType: string;
    Status: string;
    ConjunctionNumber: string;
    TicketType: string;
};

export interface Segment {
    Baggage: string;
    CabinBaggage: string;
    CabinClass: number;
    SupplierFareClass: string | null;
    TripIndicator: number;
    SegmentIndicator: number;
    Airline: Airline;
    AirlinePNR: string;
    Origin: Origin;
    Destination: Destination;
    Duration: number;
    GroundTime: number;
    Mile: number;
    StopOver: boolean;
    FlightInfoIndex: string;
    StopPoint: string;
    StopPointArrivalTime: string;
    StopPointDepartureTime: string;
    Craft: string;
    Remark: string | null;
    IsETicketEligible: boolean;
    FlightStatus: string;
    Status: string;
    FareClassification: string | null;
};

interface Airline {
    AirlineCode: string;
    AirlineName: string;
    FlightNumber: string;
    FareClass: string;
    OperatingCarrier: string;
};

interface Origin {
    Airport: Airport;
    DepTime: string; // ISO 8601 date string
};

interface Destination {
    Airport: Airport;
    ArrTime: string; // ISO 8601 date string
};

interface Airport {
    AirportCode: string;
    AirportName: string;
    Terminal: string;
    CityCode: string;
    CityName: string;
    CountryCode: string;
    CountryName: string;
};