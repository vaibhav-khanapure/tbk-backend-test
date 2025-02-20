import type { TicketsData } from "../../types/TicketBookTypes";

const getBookingBodyData = (data: TicketsData) => {
 const body = { ...data } as Record<string, unknown>;

 const removeKeys = ["LCCType", "wayType", "fareType", "oldPassengers", "isFLightCombo", "flightCities"];

 removeKeys?.forEach((key) => {
  if (key in body) delete body[key];
 });

 return body;
};

export default getBookingBodyData;