import type { FlightMealType, FlightSeatType, FlightBaggageType } from "../types/BookedFlights";

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