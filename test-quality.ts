const badlyFormatted = {
  name: "test",
  value: 123,
  missing: undefined,
};

function poorFunction(a, b, c) {
  return a + b + c;
}

// Missing semicolon
const result = poorFunction(1, 2, 3);

export { badlyFormatted, poorFunction, result };
