import uuid from "./uuid";

const generateTransactionId = () => {
 const date = new Date();

 const year = date?.getFullYear();
 const month = date?.getMonth() + 1;
 const _date = date?.getDate();

 return `TX-${year}${month}${_date}-${uuid(20, {smallLetters: true, capitalLetters: true, numbers: true})}`;
};

export default generateTransactionId;