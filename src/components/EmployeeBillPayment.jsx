import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Send,
  Eye as Preview,
  Printer,
  Download,
  CreditCard,
  X,
  Bell,
  RefreshCw,
  MessageSquare,
  Edit3,
  FileText
} from "lucide-react";
import { transactionApi } from "./api";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function EmployeeBillPayment() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [billPreview, setBillPreview] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [notification, setNotification] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [hasGeneratedBill, setHasGeneratedBill] = useState(false);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId") || "102";
    setEmployeeId(storedEmployeeId);
  }, []);

  useEffect(() => {
    if (employeeId) {
      loadData();
      checkBillGenerated();
    }
  }, [filters.month, filters.year, employeeId]);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await transactionApi.getBillableTransactions(
      employeeId,
      filters.month,
      filters.year
    );

    // Double filter to ensure only current employee's transactions
    const filtered = response.data.filter(
      t => t.employeeBusinessId === employeeId
    );

    setTransactions(filtered);
  } catch (error) {
    console.error("Error loading data:", error);
    setNotification({
      type: "error",
      message: "Failed to load transactions"
    });
  } finally {
    setLoading(false);
  }
};


  const checkBillGenerated = async () => {
    try {
      const response = await transactionApi.checkBillGenerated({
        employeeId,
        month: filters.month,
        year: filters.year
      });
      setHasGeneratedBill(response.data.hasGenerated);
    } catch (error) {
      console.error("Error checking bill status:", error);
      setHasGeneratedBill(false);
    }
  };


  const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, filename + ".xlsx");
};


  const handlePreviewBill = async () => {
  try {
    const response = await transactionApi.getGeneratedBill({
      employeeId,
      month: filters.month,
      year: filters.year
    });

    // Filter to only show relevant transactions
    const relevantTransactions = response.data.transactions.filter(
      t => t.employeeBusinessId === employeeId && 
          (t.status === "ACTIVE" || t.status === "GENERATED" || t.status === "PAID")
    );

    if (!relevantTransactions.length) {
      setNotification({
        type: "warning",
        message: "No billable transactions found"
      });
      return;
    }

    setBillPreview({
      transactions: relevantTransactions,
      totalAmount: relevantTransactions.reduce((sum, t) => sum + t.totalPrice, 0),
      statusCounts: {
        active: relevantTransactions.filter(t => t.status === "ACTIVE").length,
        generated: relevantTransactions.filter(t => t.status === "GENERATED").length,
        paid: relevantTransactions.filter(t => t.status === "PAID").length
      }
    });
    setShowBillPreview(true);
  } catch (error) {
    console.error("Error previewing bill:", error);
    setNotification({
      type: "error",
      message: "Failed to load bill preview"
    });
  }
};

  const handleSendPaymentRequest = async () => {
    try {
      // Mark only ACTIVE transactions as MODIFIED when sending payment request
      const activeTransactions = transactions.filter(t => t.status === "ACTIVE");
      await Promise.all(
        activeTransactions.map(t => 
          transactionApi.updateStatus(t.id, "MODIFIED")
        )
      );
      
      setNotification({
        type: "success",
        message: "Payment request sent to admin successfully!"
      });
      setTimeout(() => setNotification(null), 5000);
      loadData();
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to send payment request"
      });
      console.error("Error sending payment request:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      INACTIVE: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
      MODIFIED: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertTriangle },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const parseConversation = (remarks, responses) => {
    const conversation = [];
    
    if (remarks) {
      remarks.split("\n").forEach(line => {
        const match = line.match(/^(.*?) - (.*?): (.*)$/);
        if (match) {
          conversation.push({
            type: 'remark',
            timestamp: match[1],
            user: match[2],
            message: match[3],
          });
        }
      });
    }
    
    if (responses) {
      responses.split("\n").forEach(line => {
        const match = line.match(/^(.*?) - (.*?): (.*)$/);
        if (match) {
          conversation.push({
            type: 'response',
            timestamp: match[1],
            user: match[2],
            message: match[3],
          });
        }
      });
    }

    return conversation.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;

    try {
      await transactionApi.addRemark(selectedTransaction.id, remarkText);
      setRemarkText("");
      setSelectedTransaction(null);
      setShowRemarkDialog(false);
      loadData();
      setNotification({
        type: "success",
        message: "Remark added successfully!"
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error adding remark:", error);
      setNotification({
        type: "error",
        message: "Failed to add remark"
      });
    }
  };

  const showConversation = (transaction) => {
    setSelectedTransaction(transaction);
    setConversation(parseConversation(transaction.remarks, transaction.responses));
  };

  const calculateTotal = () => {
    return transactions
      .filter(t => t.status === "ACTIVE")
      .reduce((sum, transaction) => sum + transaction.totalPrice, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Payment</h1>
            <p className="text-gray-600">View and manage your monthly food bills</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generate Monthly Bill</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={filters.month}
                onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={handlePreviewBill}
                disabled={!hasGeneratedBill}
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  hasGeneratedBill 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                <Preview className="w-4 h-4 mr-2" />
                {hasGeneratedBill ? "Preview Bill" : "Bill Not Generated"}
              </button>
              <div className="flex items-center justify-center px-4 py-2 bg-gray-100 rounded-md">
                <DollarSign className="w-4 h-4 mr-2 text-gray-600" />
                <span className="font-medium">Total: ${calculateTotal()}</span>
              </div>
            </div>
            {!hasGeneratedBill && (
              <div className="flex items-center p-4 bg-yellow-50 rounded-md">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                <p className="text-yellow-700">Bill for selected period has not been generated by admin yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Your Transactions ({transactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} 
                    className={`${
                      transaction.status === "MODIFIED" ? "bg-yellow-50" :
                      transaction.status === "INACTIVE" ? "bg-gray-100 opacity-75" : ""
                    }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono">{transaction.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.menuItemName}</div>
                        <div className="text-sm text-gray-500">{transaction.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {formatDateTime(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        {transaction.totalPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => showConversation(transaction)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-900"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {transaction.status === "ACTIVE" && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowRemarkDialog(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Add remark"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showBillPreview && billPreview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bill Preview - {new Date(filters.year, filters.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => setShowBillPreview(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">${calculateTotal()}</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => exportToExcel(billPreview.transactions, 'monthly-bill')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billPreview.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.menuItemName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${transaction.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
{/* Add conversation section */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-2">Transaction Remarks</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {billPreview.transactions.map(tx => (
            tx.remarks && (
              <div key={tx.id} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">{tx.menuItemName}</p>
                <p className="text-sm text-gray-600">{tx.remarks}</p>
              </div>
            )
          ))}
        </div>
      </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowBillPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleSendPaymentRequest}
                  disabled={transactions.filter(t => t.status === "ACTIVE").length === 0}
                  className={`flex items-center px-4 py-2 rounded-md text-white ${
                    transactions.filter(t => t.status === "ACTIVE").length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Send Payment Request
                </button>
              </div>
            </div>
          </div>
        )}

        {showRemarkDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Remark</h3>
                <button onClick={() => {
                  setShowRemarkDialog(false);
                  setSelectedTransaction(null);
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Type your remark..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowRemarkDialog(false);
                      setSelectedTransaction(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRemark}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Remark
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTransaction && conversation.length > 0 && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Conversation for Transaction #{selectedTransaction.transactionId}
                </h3>
                <button
                  onClick={() => {
                    setSelectedTransaction(null);
                    setConversation([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.type === 'remark' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-lg p-3 max-w-xs ${msg.type === 'remark' ? 'bg-gray-100' : 'bg-blue-100'}`}
                    >
                      <div className={`text-sm font-medium ${msg.type === 'remark' ? 'text-gray-600' : 'text-blue-600'}`}>
                        {msg.user}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className={`text-xs mt-1 ${msg.type === 'remark' ? 'text-gray-400' : 'text-blue-400'}`}>
                        {formatDateTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowRemarkDialog(true);
                    setSelectedTransaction(null);
                    setConversation([]);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add New Remark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}