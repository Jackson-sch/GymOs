const { Decimal } = require("@prisma/client/runtime/library");

const data = {
  id: "1",
  price: new Decimal(100.50)
};

console.log("Original:", data);
console.log("Type of price:", typeof data.price);
console.log("Is Decimal:", data.price instanceof Decimal);

const serialized = JSON.parse(JSON.stringify(data));
console.log("Serialized:", serialized);
console.log("Type of serialized price:", typeof serialized.price);
