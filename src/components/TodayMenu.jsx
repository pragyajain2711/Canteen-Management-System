import React, { useState } from "react";
import defaultMenuData from "./data/menuData";

function TodayMenu() {
  const [openMealType, setOpenMealType] = useState({});
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todayMenu = defaultMenuData[today];

  const toggleMealType = (mealType) => {
    setOpenMealType((prev) => ({
      ...prev,
      [mealType]: !prev[mealType],
    }));
  };

  if (!todayMenu) return null;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9fafb" }}>
      <h2 style={{ textAlign: "center", color: "#0f766e", marginBottom: "20px" }}>
        {today} Menu
      </h2>

      {Object.entries(todayMenu).map(([mealType, items]) => (
        <div key={mealType} style={{ marginBottom: "16px" }}>
          {/* Toggle header */}
          <div
            style={{
              ...styles.mealType,
              backgroundColor: "#e2e8f0",
              borderRadius: "6px",
              padding: "10px 14px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => toggleMealType(mealType)}
          >
            <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
              {mealType}
            </span>
            <span style={{ fontSize: "14px" }}>{openMealType[mealType] ? "▲" : "▼"}</span>
          </div>

          {/* Table if open */}
          {openMealType[mealType] && (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9" }}>
                  <th style={styles.th}>Item</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={styles.td}>{item.name}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  mealType: {
    fontSize: "16px",
    color: "#0369a1",
  },
  th: {
    textAlign: "left",
    padding: "8px 14px",
    fontWeight: "600",
    color: "#334155",
    fontSize: "14px",
    borderBottom: "1px solid #cbd5e1",
  },
  td: {
    padding: "8px 14px",
    fontSize: "14px",
    color: "#1e293b",
    borderBottom: "1px solid #e2e8f0",
  },
};

export default TodayMenu;