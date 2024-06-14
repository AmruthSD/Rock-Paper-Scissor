function generateRandom5DigitString() {
    let randomString = '';
    for (let i = 0; i < 5; i++) {
      const randomDigit = Math.floor(Math.random() * 10);
      randomString += randomDigit.toString();
    }
    return randomString;
  }

  module.exports = {
    generateRandom5DigitString
  }