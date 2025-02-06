import type { NextFunction, Request, Response } from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";
import type { Segment } from "../../types/BookedFlights";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Op } from "sequelize";

dayjs.extend(utc);

interface topBookedFlight {
  name: string;
  city: string;
  totalBookings: number;
  totalSpendings: number;
};

interface monthlyBooking {
  bookings: number;
  month: string;
  type: "flight" | "hotel";
};

interface query {
  year: number;
  month: number;
  quarter: string;
  week: boolean;
};

const getUserStatistics = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;
  const {year, month, week, quarter} = req.query as unknown as query;

  let dateRange;

  if (week) {
   const startOfWeek = dayjs.utc().startOf("week");
   const endOfWeek = dayjs.utc().endOf("week");
   dateRange = [startOfWeek.toISOString(), endOfWeek.toISOString()];
  } else if (quarter) {

   const quarterRanges = {
    Q1: [`${year}-01-01`, `${year}-03-31`],
    Q2: [`${year}-04-01`, `${year}-06-30`],
    Q3: [`${year}-07-01`, `${year}-09-30`],
    Q4: [`${year}-10-01`, `${year}-12-31`],
   };

   dateRange = quarterRanges[quarter as keyof typeof quarterRanges] || null;
  } else if (month) {
   const startDay = dayjs.utc(`${year}-${month}-01`);
   const endDay = startDay.endOf("month");
   dateRange = [startDay.toISOString(), endDay.toISOString()];
  } else {
   const startOfYear = dayjs.utc(`${year}-01-01`);
   const endOfYear = dayjs.utc(`${year}-12-31`);
   dateRange = [startOfYear.toISOString(), endOfYear.toISOString()];
  };

  const queryOptions = {userId} as Record<string, unknown>;

  if (dateRange) {
   queryOptions["bookedDate"] = { [Op.between]: dateRange.map(date => dayjs.utc(date).toDate()) };
  };

  const bookings = await FlightBookings.findAll({
   where: queryOptions,
   raw: true,
   attributes: ["tbkAmount", "Segments", "bookedDate"],
  });

  const totalBookings = bookings?.length;
  const totalSpendings = bookings?.reduce((acc, flight) => acc + Number(flight?.tbkAmount), 0);

  const flightsTravelled = {} as Record<string, number>;
  const flightSpendings = {} as Record<string, number>;

  const topBookedFlights = [] as topBookedFlight[];
  const monthlyBookings = [] as monthlyBooking[];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",];

  months.forEach(month => {
   const booking = { bookings: 0, month, type: "flight" } as monthlyBooking;
   monthlyBookings.push(booking);
  });

  bookings.forEach(flight => {
   const segments = flight?.Segments?.flat(10) as Segment[];
   const name = segments?.[0]?.Airline?.AirlineName;

   if (flightsTravelled?.[name]) flightsTravelled[name]++
   else flightsTravelled[name] = 1;

   if (flightSpendings?.[name]) flightSpendings[name] += Number(flight?.tbkAmount)
   else flightSpendings[name] = Number(flight?.tbkAmount);

   // Monthly bookings
   const getMonthlyBookings = () => {
    const month = dayjs?.utc(flight?.bookedDate)?.format("MMM");
    const index = monthlyBookings.findIndex(flight => flight?.month === month);

    if (index > -1) monthlyBookings[index].bookings++
    else {
     const booking = { bookings: 1, month, type: "flight" } as monthlyBooking;
     monthlyBookings.push(booking);
    };
   };

   // Top booked flights
   const getTopBookedFlights = () => {
    const city = segments?.[0]?.Origin?.Airport?.CityName;
    const index = topBookedFlights.findIndex(flight => flight?.name === name && flight?.city === city);

    if (index > -1) {
     topBookedFlights[index].totalBookings++;
     topBookedFlights[index].totalSpendings += Number(flight?.tbkAmount);
    } else {
     const flightData = {city, name, totalBookings: 1, totalSpendings: Number(flight?.tbkAmount)} as topBookedFlight;
     topBookedFlights.push(flightData);
    };
   };

   getMonthlyBookings();
   getTopBookedFlights();
  });

  const data = {
   totalBookings,
   totalSpendings,
   flightSpendings,
   flightsTravelled,
   topBookedFlights,
   monthlyBookings,
  };

  return res.status(200).json({data});
 } catch (error) {
  next(error);
 }
};

export default getUserStatistics;