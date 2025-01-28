import initDB from "../database/dbinit";
import Discounts from "../database/tables/discountsTable";
import init from "./app";

const fareTypes = [
  "Publish",  
  "Inst_SeriesPurPF6",  
  "SME.CrpCon",  
  "Coupon",  
  "Flexi",  
  "Saver",  
  "Value",  
  "Corporate",  
  "Inst_SeriesPurPF4",  
  "Super6E",  
  "Ultimate",  
  "Business",  
  "BusinessPlus",  
  "InstantPur",  
  "InstSeriesPurIWN",  
  "SME",  
  "Savor",  
  "Promo",  
  "XpressBiz",  
  "Tactical",  
  "Private"  
];

const data = fareTypes.map(fare => ({
    discount: 0,
    markup: 0,
    userId: 0,
    fareType: fare
}));

const server = async () => {
 try {
  await initDB();
  init();

//   Discounts.bulkCreate(data);
 } catch (err) {
  const error = err as Error;
  console.log("SOME ERROR OCCURRED", error?.message);
 };
};

server();