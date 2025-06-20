import React, { useState } from "react";
import {useTheme} from "../ThemeContext";

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
  Wednesday: {
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
  Thursday: {
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
  Friday: {
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
  
  
};
/*
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f0f9f8",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  dayCard: {
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  dayTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#0f766e",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },
  mealType: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "12px 0 6px",
    color: "#0891b2",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },
  itemBox: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #e0e0e0",
  },
  itemName: {
    flex: 2,
    fontSize: "15px",
    color: "#333",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  price: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    color: "#16a34a",
  },
  button: {
    flex: 1,
    textAlign: "right",
    padding: "4px 8px",
    backgroundColor: "#0d9488",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
    maxWidth: "70px",
  },
};
*/

function Menu({ menuData = defaultMenuData, onAddToCart = () => {} }) {
  const {theme} = useTheme();
  const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f0f9f8",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
     backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
  },
  dayCard: {
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  dayTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#0f766e",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },
  mealType: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "12px 0 6px",
    color: "#0891b2",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },
  itemBox: {
    display: "flex",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #e0e0e0",
  },
  itemName: {
    flex: 2,
    fontSize: "15px",
    color: "#333",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  price: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    color: "#16a34a",
  },
  button: {
    flex: 1,
    textAlign: "right",
    padding: "4px 8px",
    backgroundColor: "#0d9488",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
    maxWidth: "70px",
  },
};
  const [openDay, setOpenDay] = useState(null);
  const [openMealType, setOpenMealType] = useState({});

  const toggleDay = (day) => {
    setOpenDay(openDay === day ? null : day);
    setOpenMealType({}); // reset meal toggles when switching day
  };

  const toggleMealType = (day, meal) => {
    setOpenMealType((prev) => ({
      ...prev,
      [meal]: prev[meal] === day ? null : day,
    }));
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center", color: "#0f766e" }}>Weekly Menu</h2>
      {Object.entries(menuData).map(([day, meals]) => (
        <div key={day} style={styles.dayCard}>
          <div style={styles.dayTitle} onClick={() => toggleDay(day)}>
            {day}
            <span>{openDay === day ? "▲" : "▼"}</span>
          </div>

          {openDay === day &&
            Object.entries(meals).map(([mealType, items]) => (
              <div key={mealType}>
                <div
                  style={styles.mealType}
                  onClick={() => toggleMealType(day, mealType)}
                >
                  {mealType}
                  <span>
                    {openMealType[mealType] === day ? "▲" : "▼"}
                  </span>
                </div>

                {openMealType[mealType] === day &&
                  (Array.isArray(items) ? (
                    items.map((item, index) => (
                      <div key={index} style={styles.itemBox}>
                        <div style={styles.itemName}>{item.name}</div>
                        <div style={styles.price}>₹{item.price}</div>
                        <button
                          style={styles.button}
                          onClick={() =>
                            onAddToCart({
                              day,
                              mealType,
                              item: item.name,
                              price: item.price,
                            })
                          }
                        >
                          Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={styles.itemBox}>
                      <div style={styles.itemName}>{items}</div>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default Menu;
