import type { NextFunction, Request, Response } from "express";
import Users from "../../database/tables/usersTable";
import razorpay from "../../config/razorpay";

const fetchRazBankInfo = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const userId = res.locals?.user?.id;

  if (!userId) {
   return res.status(401).json({message: "Unauthorized"});
  };

  let data;

  data = await Users.findOne({
   where: {id: userId},
   attributes: ['razAccountNumber', 'razIFSC', 'razName'],
   raw: true,
  });

  if (!data?.razAccountNumber || !data?.razIFSC || !data?.razName) {

  //  const descriptor = (`${userId}${username}${uuid(10, {smallLetters: true})}`)?.slice(0, 10);

   const va = await razorpay.virtualAccounts.create({
    receivers: {
      types: ['bank_account'],
      // vpa: { descriptor }
    }
   });

   const bankInfo = {
    ifsc: '',
    name: '',
    accNo: ''
   };

   va?.receivers?.forEach(receiver => {
    if (receiver?.ifsc && receiver?.account_number && receiver?.name) {
     if (!bankInfo?.ifsc && !bankInfo?.accNo && !bankInfo?.name) {
      bankInfo.ifsc = receiver?.ifsc;
      bankInfo.accNo = receiver?.account_number;
      bankInfo.name = receiver?.name;
     };
    };
   });

   await Users.update({
    razIFSC: bankInfo?.ifsc,
    razAccountNumber: bankInfo?.accNo,
    razName: bankInfo?.name,
   }, {where: { id: userId }});

   data = bankInfo;
  };

  return res.status(200).json(data);
 } catch (error) {
   next(error);
 };
};

export default fetchRazBankInfo;