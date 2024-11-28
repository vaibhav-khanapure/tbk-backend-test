import type { Request, Response, NextFunction } from "express";
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import Ledgers from "../../database/tables/ledgerTable";

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

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('User Ledger');

  // Define columns
  worksheet.columns = [
   { header: 'Date', key: 'date', width: 20 },
   { header: 'Type', key: 'type', width: 15 },
   { header: 'Transaction Reference', key: 'txReference', width: 25 },
   { header: 'Debit', key: 'debit', width: 15 },
   { header: 'Credit', key: 'credit', width: 15 },
   { header: 'Balance', key: 'balance', width: 15 },
   { header: 'Pax Name', key: 'paxName', width: 20 },
   { header: 'Invoice Number', key: 'invoiceNo', width: 20 },
   { header: 'Reference Number', key: 'referenceNo', width: 20 }
  ];

  // Add rows
  ledgers.forEach(ledger => {
   worksheet.addRow({
    date: ledger.createdAt,
    type: ledger.type,
    txReference: ledger.TxReferenceId,
    debit: ledger.debit || 0,
    credit: ledger.credit || 0,
    balance: ledger.type === "Receipt" ? `-${ledger.balance}` : ledger.balance,
    paxName: ledger.PaxName,
    invoiceNo: ledger.InvoiceNo,
    referenceNo: ledger.ReferenceNo
   });
  });

  // Style the header row
  worksheet.getRow(1).eachCell((cell) => {
   cell.font = { bold: true };
   cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F0F0F0' }
   };
  });

  // Set response headers for Excel file
  res.setHeader(
   'Content-Type', 
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
   'Content-Disposition', 
   `attachment; filename=User_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`
  );

  // Write to response
  await workbook.xlsx.write(res);
  
  // End the response
  return res.end();
 } catch (error) {
  next(error);
 };
};

export default downloadLedgers;