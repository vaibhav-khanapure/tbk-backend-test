interface options {
 symbols?: boolean;
 capitalLetters?: boolean;
 numbers?: boolean;
 smallLetters?: boolean;
 all?: boolean;
};

const Options: options = {
 symbols: false,
 capitalLetters: true,
 numbers: false,
 smallLetters: false,
 all: false,
};

const uuid = (length: number = 12, options = Options) => {
 const {capitalLetters, numbers, smallLetters, symbols, all} = options;

 const letters = "abcdefghijklmnopqrstuvwxyz";
 const num = "0123456789";
 const Symbols = "~!@#$%^&*()_+=-{}|?<>";

 let str = "";

 if(capitalLetters) str += letters.toLocaleUpperCase();
 if(smallLetters) str += letters;
 if(numbers) str += num;
 if(symbols) str += Symbols;
 if(all) str += `${letters}${letters.toLocaleUpperCase()}${num}${Symbols}`;

 for (let i = 0; i < 10; i++) {
  str += str;
 };

 const id = str.split("").sort(() => Math.random() - 0.5).slice(0, length).join("");
 return id;
};

export default uuid;