import type {Request, Response, NextFunction} from "express";
import {Op} from 'sequelize';
import ExcelJS from 'exceljs';
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";

const downloadLedger = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const user = res.locals?.user;
  const userId = user?.id;

  const {from, to = new Date()} = req.query as {from: string; to: string};

  const queryOptions = {
   where: {userId},
   order: [['createdAt', 'DESC']],
   attributes: {exclude: ["addedBy"]},
  } as Record<string, any>;

  if (from?.length) {
   queryOptions.where.createdAt = {
    [Op.between]: [new Date(from as string), new Date(to as string)]
   };
  };

  const ledgers = await Ledgers?.findAll(queryOptions);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('User Ledger');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Invoice Number', key: 'invoiceNo', width: 20 },
    { header: 'Particulars', key: 'particulars', width: 50 },
    { header: 'Debit', key: 'debit', width: 15 },
    { header: 'Credit', key: 'credit', width: 15 },
    { header: 'Balance', key: 'balance', width: 15 },
    { header: 'Pax Name', key: 'paxName', width: 20 }
  ];

  ledgers.forEach(ledger => {
   const particularsEntries = ledger?.particulars ? Object.entries(ledger.particulars) : [];

   particularsEntries.forEach(([key, value], index) => {
    worksheet.addRow({
     date: index === 0 ? dayjs(ledger?.createdAt)?.format('DD MMM YYYY, hh:mm A') : '',
     type: index === 0 ? ledger?.type : '',
     invoiceNo: index === 0 ? ledger?.InvoiceNo : '',
     particulars: `${key}: ${value}`,
     debit: index === 0 ? (ledger?.debit || 0) : '',
     credit: index === 0 ? (ledger?.credit || 0) : '',
     balance: index === 0 ? (ledger?.balance || 0) : '',
     paxName: index === 0 ? ledger?.PaxName : '',
    });
   });
  });

  worksheet.getRow(1).eachCell((cell) => {
   cell.font = { bold: true };
   cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F0F0F0' }
   };
  });

  let filename = `${user?.name}-ledger`;
  if(from?.length) filename = `ledger_${dayjs(from)?.format('DD-MMM-YYYY')} to ${dayjs(to)?.format('DD-MMM-YYYY')}`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Content-Disposition', `attachment; filename=TBK-${filename}.xlsx`);

  await workbook.xlsx.write(res);
  return res.end();
 } catch (error) {
  next(error);
 };
};

export default downloadLedger;