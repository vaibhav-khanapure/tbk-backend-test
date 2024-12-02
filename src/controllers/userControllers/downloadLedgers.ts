import type { Request, Response, NextFunction } from "express";
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import Ledgers from "../../database/tables/ledgerTable";
import dayjs from "dayjs";

const downloadLedgers = async (req: Request, res: Response, next: NextFunction) => {
 try {
  const { user } = res.locals;
  const userId = user?.id;
  const { from, to = new Date() } = req.query;

  const queryOptions = {
   where: { userId },
   order: [['createdAt', 'DESC']]
  } as Record<string, any>;

  if (from?.length) {
   queryOptions.where.createdAt = {
    [Op.between]: [new Date(from as string), new Date(to as string)]
   };
  };

  const ledgers = await Ledgers.findAll(queryOptions);

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
   const particularsEntries = ledger.particulars ? Object.entries(ledger.particulars) : [];

   particularsEntries.forEach(([key, value], index) => {
    worksheet.addRow({
     date: index === 0 ? dayjs(ledger?.createdAt)?.format('DD MMM YYYY, hh:mm A') : '',
     type: index === 0 ? ledger.type : '',
     invoiceNo: index === 0 ? ledger.InvoiceNo : '',
     particulars: `${key}: ${value}`,
     debit: index === 0 ? (ledger.debit || 0) : '',
     credit: index === 0 ? (ledger.credit || 0) : '',
     balance: index === 0 ? (ledger.type === "Invoice" ? `-${ledger.balance}` : ledger.balance) : '',
     paxName: index === 0 ? ledger.PaxName : '',
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

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=User_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);

  await workbook.xlsx.write(res);
  return res.end();
 } catch (error) {
  next(error);
 };
};

export default downloadLedgers;