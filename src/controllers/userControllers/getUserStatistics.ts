import type {NextFunction, Request, Response} from "express";
import FlightBookings from "../../database/tables/flightBookingsTable";
import type { Segment } from "../../types/BookedFlights";
import dayjs from "dayjs";
import { Op } from "sequelize";

interface topBookedFlight {
 name: string;
 city: string;
 totalBookings: number;
 totalSpendings: number;
};

interface monthlyBooking {
 bookings: number;
 month: string;
 type: "flight" | "hotel"
};

interface query {
 year: number;
 month: number;
 quarter: string;
 week: boolean;
};

const getUserStatistics = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const {id: userId} = res.locals?.user;
  const { year, month, week, quarter } = req.query as unknown as query;

  let dateRange;

  if (week) {
   const startOfWeek = dayjs().startOf('week').subtract(1, 'day');
   const endOfWeek = dayjs().endOf('week').subtract(1, 'day');
   dateRange = [startOfWeek.toISOString(), endOfWeek.toISOString()];
  } else if (quarter) {
   switch (quarter) {
    case 'Q1':
     dateRange = [dayjs(`${year}-01-01`).toISOString(), dayjs(`${year}-03-31`).toISOString()];
     break;
    case 'Q2':
     dateRange = [dayjs(`${year}-04-01`).toISOString(), dayjs(`${year}-06-30`).toISOString()];
     break;
    case 'Q3':
     dateRange = [dayjs(`${year}-07-01`).toISOString(), dayjs(`${year}-09-30`).toISOString()];
     break;
    case 'Q4':
     dateRange = [dayjs(`${year}-10-01`).toISOString(), dayjs(`${year}-12-31`).toISOString()];
     break;
    default:
     dateRange = null;
   }
  } else if (month) {
   const startDay = 1;
   const endDay = dayjs(`${year}-${month}`).daysInMonth();
   dateRange = [dayjs(`${year}-${month}-${startDay}`).toISOString(), dayjs(`${year}-${month}-${endDay}`).toISOString()];
  } else {
   dateRange = [dayjs(`${year}-01-01`).toISOString(), dayjs(`${year}-12-31`).toISOString()]; 
  };

  const queryOptions = { userId } as Record<string, unknown>;

  if (dateRange) queryOptions["bookedDate"] = { [Op.between]: dateRange };

  console.log("#################", dateRange);

  const bookings = await FlightBookings?.findAll({where: queryOptions});

  const totalBookings = bookings?.length;
  const totalSpendings = bookings?.reduce((acc, flight) => acc + flight?.tbkAmount, 0);
  const flightsTravelled = {} as Record<string, number>;
  const flightSpendings = {} as Record<string, number>;

  const topBookedFlights = [] as topBookedFlight[];
  const monthlyBookings = [] as monthlyBooking[];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  months?.forEach(month => {
   const booking = {bookings: 0, month, type: "flight"} as monthlyBooking;
   monthlyBookings?.push(booking);
  });

  bookings?.forEach(flight => {
   const segments = flight?.Segments as Segment[];
   const name = segments?.[0]?.Airline?.AirlineName;

   if(flightsTravelled?.[name]) flightsTravelled[name]++
   else flightsTravelled[name] = 1;

   if(flightSpendings?.[name]) flightSpendings[name] += flight?.tbkAmount;
   else flightSpendings[name] = flight?.tbkAmount;

   // monthly bookings
   const getMonthlyBookings = () => {
    const month = dayjs(flight?.bookedDate)?.format("MMM");
    const index = monthlyBookings?.findIndex(flight => flight?.month === month);

    if(index > -1) {
     monthlyBookings[index].bookings++;
    } else {
     const booking = {bookings: 1, month, type: "flight"} as monthlyBooking;
     monthlyBookings?.push(booking);
    };
   };

   // top booked flights
   const getTopBookedFlights = () => {
    const city = segments?.[0]?.Origin?.Airport?.CityName;
    const index = topBookedFlights?.findIndex(flight => flight?.name === name && flight?.city === city);

    if(index > -1) {
     topBookedFlights[index].totalBookings++;
     topBookedFlights[index].totalSpendings += flight?.tbkAmount;
    } else {
     const flightData = {city, name, totalBookings: 1, totalSpendings: flight?.tbkAmount} as topBookedFlight;
     topBookedFlights.push(flightData);
    };
   };

   getMonthlyBookings();
   getTopBookedFlights();
  });

  const data = {totalBookings, totalSpendings, flightSpendings, flightsTravelled, topBookedFlights, monthlyBookings};
  return res.status(200).json({data});
 } catch (error) {
  next(error);
 };
};

export default getUserStatistics;