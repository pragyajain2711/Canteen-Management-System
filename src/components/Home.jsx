
import React from "react";
import { Link } from "react-router-dom";
import TodayMenu from "./TodayMenu";
import { useTheme } from "../ThemeContext"; // adjust the path if needed


function Home({ addToCart }) {
  const {theme} = useTheme();
const styles = {
  container: {
    backgroundColor: theme === "light" ? "#f8f9fa" : "#1a1a1a",
    color: theme === "light" ? "#000" : "#fff",
  },
};

const headlineStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center",
    color: theme === "light" ? "#000" : "#fff"
  };
  const subTextStyle = {
    fontSize: "1.2rem",
    textAlign: "center",
    color: "#555",
    color: theme === "light" ? "#555" : "#aaa"
  };
  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
    color: theme === "light" ? "#000" : "#fff",
  };

  const browseButton = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold",
  };

  const signUpButton = {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#007bff",
    border: "2px solid #007bff",
    borderRadius: "5px",
    fontWeight: "bold",
    textDecoration: "none",
  };

  const Dishes = [
    {
      name: "Paneer Butter Masala",
      price: 90,
      image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZGlzaHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      name: "Bhel",
      price: 30,
      image: "https://images.unsplash.com/photo-1643892548578-d0a056dd2ee5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmhlbHxlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      name: "Chai",
      price: 10,
      image: "https://images.unsplash.com/photo-1630748662359-40a2105640c7?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Samosa",
      price: 15,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftb3NhfGVufDB8fDB8fHww",
    },
  ];

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
        backgroundColor: theme === "light" ? "#e2e8f0" : "#fff",

  };
  const cardStyle = {
    //border: "1px solid #ddd",
    border: `1px solid ${theme === "light" ? "#ddd" : "#444"}`,
    borderRadius: "10px",
    padding: "10px",
    textAlign: "center",
    //backgroundColor: "#f9f9f9",
        backgroundColor: theme === "light" ? "#e2e8f0" : "#000",

  };

  const imageStyle = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "5px",
  };

  const addButtonStyle = {
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <>
    <div style={{...styles.container, padding: "20px"}}>
      <h1 style={headlineStyle}>Skip the queue, order online.</h1>
      <p style={subTextStyle}>
        Fresh, delicious meals from your office canteen. Order ahead and pick up
        when ready.
      </p>

      <div style={buttonContainerStyle}>
        <Link to="/menu" style={browseButton}>
          Browse Menu
        </Link>
        <Link to="/sign_up" style={signUpButton}>
          Sign Up Today
        </Link>
      </div>

      <h2 style={{ textAlign: "center", fontWeight: "bold" }}>Top Dishes</h2>
      <div style={gridStyle}>
        {Dishes.map((dish, index) => (
          <div key={index} className="card" style={cardStyle}>
            <img src={dish.image} alt={dish.name} style={imageStyle} />
            <h3>{dish.name}</h3>
            <p style={{ fontWeight: "bold" }}>₹{dish.price}</p>
            <button style={addButtonStyle} onClick={() => addToCart(dish)}>
              + Add to Cart
            </button>
          </div>
        ))}
      </div>
     <TodayMenu addToCart={addToCart} />
     </div>
    </>
  );
}

export default Home;