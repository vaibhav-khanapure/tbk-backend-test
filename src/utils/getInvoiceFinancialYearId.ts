const getInvoiceFinancialYearId = () => {
 const date = new Date();

 const year = date?.getFullYear();
 const month = date?.getMonth() + 1;

 if (month > 3) {
  const nextYear = String(year + 1)?.slice(2);
  const currentYear = String(year)?.slice(2);
  return `${currentYear}${nextYear}`;
 } else {
  const prevyear = String(year - 1)?.slice(2);
  const currentYear = String(year)?.slice(2);
  return `${prevyear}${currentYear}`
 };
};

export default getInvoiceFinancialYearId;