import type {NextFunction, Request, Response} from "express";
import axios from "axios";
import Settings from "../../database/tables/settingsTable";

const tdata = {
    "EndUserIp": "192.168.11.58",
    "TraceId": "2989f201-8d4a-4355-a8a7-1fc96c04ab90",
    "ResultIndex": "OB6[TBO]Iz5Xm6401F90qK7y4jA9Pzjw5YFtxvVvlyVoO4HHjAPRh0XC9Rkpuhun8xHU5jkGPue1a36OsefHCEncNRk+IspBt6jUu8zWuth61qrVx2Tsq5lPkLfc/h22V7AJ8fZuTv6dE31BJ0OCQv5L5siwVfdnztBfodw27nEJJBTKzfjVfKvmIV8APdUsEGNnvUkf5lHu7y8/7REKlTd8iJo44Nw300Zgf1QnWIKXG3Re8n8KjhYiqFbT7zzPAU3ScUtHFBaTE0qNA5mlRNK4+sYcJ1Z5Y9ODcHlq8Otez4vXi+0grWBWpaXV+PeLV/EUn3XngBtYzP042U+31BZkyY5VJM5XV3QmqpV+SM5Hf0BzN8l976NEBO3vTbfG6StgeJzZ+QWx8P+PYzIdTLrRmSTAyGG1yYtaLCc70dlYMI10uotrureQjm/y6CerK3B7H1lBPxtXCpw/gBwtYcR4N97aemmZFOEKjC5nPlMRc2FdJ/tqIXPHq07ij34xtV/N+hbJMghiBHQvfuoWvonXMoTgAg==",
    "Passengers": [
        {
            "Title": "Mr",
            "FirstName": "Vaibhav",
            "LastName": "sagar",
            "PaxType": "1",
            "DateOfBirth": null,
            "Gender": "1",
            "GSTCompanyAddress": "Hiranandani Gardens,269 Powai Plaza,OPP. IIT Powai, JVLR",
            "GSTCompanyContactNumber": "7782646141",
            "GSTCompanyName": "Fixfly travels and tours private limited",
            "GSTNumber": "27AADCF5384N1Z2",
            "GSTCompanyEmail": "sa@ticketbookkaro.com",
            "AddressLine1": "Galaxy Colony",
            "AddressLine2": "Indo Society",
            "City": "Pune",
            "CountryCode": "IN",
            "CountryName": "India",
            "ContactNo": "919975564393",
            "Email": "vaibhavk754@gmail.com",
            "IsLeadPax": true,
            "Nationality": "IN",
            "CellCountryCode": "+91",
            "Fare": {
                "BaseFare": 3535,
                "Tax": 1344,
                "YQTax": 900,
                "AdditionalTxnFeePub": 0,
                "AdditionalTxnFeeOfrd": 0,
                "OtherCharges": 0,
                "AirTransFee": 0,
                "TransactionFee": 0
            },
            "SeatDynamic": [
                {
                    "AirlineCode": "SG",
                    "FlightNumber": "251",
                    "CraftType": "B-737-800 (Y189)SGH",
                    "Origin": "DEL",
                    "Destination": "CCU",
                    "AvailablityType": 1,
                    "Description": 2,
                    "Code": "10E",
                    "RowNo": "10",
                    "SeatNo": "E",
                    "SeatType": 3,
                    "SeatWayType": 2,
                    "Compartment": 1,
                    "Deck": 1,
                    "Currency": "INR",
                    "Price": 99
                }
            ]
        }
    ],
    "TokenId": "d34be6df-93c5-47cd-8692-9d190dae2ccd"
}

const ticketBook = async (req: Request, res: Response, next: NextFunction)=>{
 try {
  const ticketBookData = req.body; 
  const settingData = await Settings.findOne();
  ticketBookData.TokenId = settingData?.dataValues?.TboTokenId;

//   const data = {};

  const {data} = await axios({
   method: 'post',
   headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
   },
   url: 'http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket',
   data: ticketBookData,
  });

  return res.status(200).json({data, RequestData: ticketBookData});
 } catch (error) {
  next(error);
 };
};

export default ticketBook;