const uuid = (length: number = 12, options: {symbols: boolean} = {symbols: false}) => {
 const letters = "abcdefghijklmnopqrstuvwxyz";
 const num = "0123456789";
 const symbols = "~!@#$%^&*()_+=-{}|?<>";

 const str = `${letters}${letters.toLocaleUpperCase()}${num}${options.symbols && symbols}`;
 const id = str.split("").sort(() => Math.random() - 0.5).slice(0, length).join("");
 return id;
};

export default uuid;