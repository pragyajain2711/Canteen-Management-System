const defaultMenuData = {
  Monday: {
    breakfast: [
      { name: "Samosa", price: 10 },
      { name: "Tea", price: 5 },
      { name: "Coffee", price: 10 },
    ],
    lunch: [
      { name: "Chapati", price: 10 },
      { name: "Rice", price: 15 },
      { name: "Daal", price: 20 },
      { name: "Pattagobhi", price: 15 },
    ],
    snacks: [{ name: "Bhel", price: 20 }],
    Daily: [
      { name: "Chai", price: 5 },
      { name: "Coffee", price: 10 },
      { name: "Juice", price: 20 },
    ],
    Thali: [
      {
        name: "Paratha, Rice, Daalfry, Bhindi, Papad, salad, Aachar",
        price: 150,
      },
    ],
  },
  Tuesday: {
    breakfast: [
      { name: "Poha", price: 20 },
      { name: "Tea", price: 5 },
    ],
    lunch: [
      { name: "Rice", price: 15 },
      { name: "Rajma", price: 25 },
    ],
    snacks: [{ name: "Pakora", price: 15 }],
    Daily: [
      { name: "Chai", price: 5 },
      { name: "Coffee", price: 10 },
    ],
    Thali: [
      {
        name: "Rice, Rajma, Salad, Roti",
        price: 120,
      },
    ],
  },
  Wednesday: {
    breakfast: [
      { name: "Idli", price: 25 },
      { name: "Sambar", price: 15 },
    ],
    lunch: [
      { name: "Chapati", price: 10 },
      { name: "Chole", price: 25 },
    ],
    snacks: [{ name: "Chips", price: 10 }],
    Daily: [
      { name: "Chai", price: 5 },
      { name: "Coffee", price: 10 },
    ],
    Thali: [
      {
        name: "Chole, Roti, Salad",
        price: 130,
      },
    ],
  },
  Thursday: {
    breakfast: [
      { name: "Paratha", price: 20 },
      { name: "Curd", price: 10 },
    ],
    lunch: [
      { name: "Daal", price: 20 },
      { name: "Jeera Rice", price: 15 },
    ],
    snacks: [{ name: "Fries", price: 20 }],
    Daily: [
      { name: "Chai", price: 5 },
      { name: "Coffee", price: 10 },
    ],
    Thali: [
      {
        name: "Daal, Jeera Rice, Salad",
        price: 120,
      },
    ],
  },
  Friday: {
    breakfast: [
      { name: "Upma", price: 20 },
      { name: "Chutney", price: 5 },
    ],
    lunch: [
      { name: "Pulao", price: 25 },
      { name: "Raita", price: 10 },
    ],
    snacks: [{ name: "Bhel", price: 20 }],
    Daily: [
      { name: "Chai", price: 5 },
      { name: "Coffee", price: 10 },
    ],
    Thali: [
      {
        name: "Pulao, Raita, Salad",
        price: 130,
      },
    ],
  },
};

export default defaultMenuData;