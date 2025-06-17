import React from "react";

function Cart({ cartItems = [], onIncrement, onDecrement, onClearCart }) {
  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
    },
    heading: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    row: {
      display: "flex",
      flexDirection: "row",
      gap: "20px",
      flexWrap: "wrap",
    },
    cartBox: {
      flex: "2",
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      minWidth: "300px",
    },
    summaryBox: {
      flex: "1",
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      minWidth: "250px",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      marginBottom: "10px",
    },
    item: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
    },
    itemDetails: {
      fontWeight: "bold",
    },
    itemPrice: {
      color: "#666",
    },
    quantityBox: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    qtyBtn: {
      padding: "4px 10px",
    },
    clearBtn: {
      color: "#e74c3c",
      border: "none",
      background: "none",
      marginTop: "10px",
      cursor: "pointer",
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "5px",
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      fontWeight: "bold",
      fontSize: "1.2rem",
    },
    totalAmount: {
      color: "#007bff",
    },
    placeOrderBtn: {
      marginTop: "15px",
      width: "100%",
      padding: "10px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    note: {
      fontSize: "0.9rem",
      color: "#666",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Your Cart</h1>
      <div style={styles.row}>
        {/* Cart Items Section */}
        <div style={styles.cartBox}>
          <h2 style={styles.sectionTitle}>Order Items</h2>
          {cartItems.map((item, index) => (
            <div key={index} style={styles.item}>
              <div>
                <div style={styles.itemDetails}>{item.name}</div>
                <div style={styles.itemPrice}>₹{item.price} each</div>
              </div>
              <div style={styles.quantityBox}>
                <button onClick={() => onDecrement(item)} style={styles.qtyBtn}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => onIncrement(item)} style={styles.qtyBtn}>+</button>
              </div>
              <div style={styles.itemDetails}>₹{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <button onClick={onClearCart} style={styles.clearBtn}>🗑️ Clear Cart</button>
        </div>

        {/* Order Summary Section */}
        <div style={styles.summaryBox}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          {cartItems.map((item, index) => (
            <div key={index} style={styles.summaryRow}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ margin: "10px 0" }} />
          <div style={styles.totalRow}>
            <span>Total</span>
            <span style={styles.totalAmount}>₹{getTotal().toFixed(2)}</span>
          </div>
          <button style={styles.placeOrderBtn}>Place Order</button>
          <p style={styles.note}>
            You'll receive a notification when your order is ready for pickup.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cart;
