const generateTransactionId = () => {
 const date = Date.now();
 const num = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

 return `TX-${date}-${num}`;
};

export default generateTransactionId;