function generateRandomNumber(min = 0, max = 100) {
 if(typeof min !== "number" && typeof max !== "number") {
  throw new Error("Both min and max must be numbers");
 };

 return Math.floor(Math.random() * (max - min + 1) + min);
};

export default generateRandomNumber;