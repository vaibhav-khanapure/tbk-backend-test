interface FlightSeatType {
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

interface FlightMealType {
    AirlineCode: string;
    AirlineDescription: string;
    Code: string;
    Currency: string;
    Description: number;
    Destination: string;
    FlightNumber: string;
    Origin: string;
    Price: number;
    Quantity: number;
    WayType: number;
};

const calculateSeatsTotalPrice = (seats: FlightSeatType[]) => {
 const Seats = seats?.flat(10);
 let totalPrice = 0;

 Seats?.forEach(seat => {
  totalPrice += Number(seat?.Price) || 0;
 });

 return totalPrice;
};

const calculateMealsTotalPrice = (meals: FlightMealType[]) => {
 const Meals = meals?.flat(10);
 let totalPrice = 0;

 Meals?.forEach(meal => {
  totalPrice += Number(meal?.Price) || 0;
 });

 return totalPrice;
};

const calculateBaggageTotalPrice = (bagagge: FlightBaggageType[]) => {
 const Baggages = bagagge?.flat(10);
 let totalPrice = 0;

 Baggages?.forEach(baggage => {
  totalPrice += Number(baggage?.Price) || 0;
 });

 return totalPrice;
};

export {calculateBaggageTotalPrice, calculateMealsTotalPrice, calculateSeatsTotalPrice};