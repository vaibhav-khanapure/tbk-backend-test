import type { FlightMealType, FlightSeatType, FlightBaggageType, Passenger } from "../types/BookedFlights";

const calculateSSRPrice = (passengers: Passenger[]) => {
 let total = 0;

 let seats = 0;
 let meals = 0;
 let baggages = 0;

 const Seats = passengers?.map((passenger) => passenger?.SeatDynamic)?.flat(10);
 const Meals = passengers?.map((passenger) => passenger?.MealDynamic)?.flat(10);
 const Baggages = passengers?.map((passenger) => passenger?.Baggage)?.flat(10);

 Seats?.forEach(seat => {
  const price = Number(seat?.Price || 0) || 0;
  total += price;
  seats += price;
 });

 Meals?.forEach(meal => {
  const price = Number(meal?.Price || 0) || 0;
  total += price;
  meals += price;
 });

 Baggages?.forEach(baggage => {
  const price = Number(baggage?.Price || 0) || 0;
  total += price;
  baggages += price;
 });

 return {total, seats, meals, baggages};
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

export {calculateBaggageTotalPrice, calculateMealsTotalPrice, calculateSeatsTotalPrice, calculateSSRPrice};