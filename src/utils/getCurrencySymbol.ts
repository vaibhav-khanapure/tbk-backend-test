const currencies = {
 "INR": '₹',
 "USD": '$',
};

const getCurrencySymbol = (currency: string) => {
 const cur = currency as keyof typeof currencies;
 if (currencies[cur]) return currencies[cur];
 return '₹';
};

export default getCurrencySymbol;