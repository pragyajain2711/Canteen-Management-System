import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  DollarSign,
  Clock,
  Send,
  Eye,
  ToggleLeft,
  ToggleRight,
  FileText,
  RefreshCw,
  ViewIcon as Preview,
  Mail,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { transactionApi } from "../api";

export default function AdminTransactionDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    employee: "ALL",
    status: "ALL",
    month: "all",
    year: new Date().getFullYear().toString(),
  });
  const [billFilters, setBillFilters] = useState({
    employee: "",
    month: "",
    year: new Date().getFullYear().toString(),
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [billPreview, setBillPreview] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, employeesResponse] = await Promise.all([
        transactionApi.getTransactions(),
        transactionApi.getEmployeesWithTransactions(),
      ]);
      setTransactions(transactionsResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      INACTIVE: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
      MODIFIED: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse",
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
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

  const handleAddResponse = async () => {
    if (!responseText.trim()) return;

    try {
      await transactionApi.addResponse(selectedTransaction.id, responseText);
      setResponseText("");
      setSelectedTransaction(null);
      setShowResponseDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding response:", error);
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;

    try {
      await transactionApi.addRemark(selectedTransaction.id, remarkText);
      setRemarkText("");
      setSelectedTransaction(null);
      setShowRemarkDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding remark:", error);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;

    try {
      await transactionApi.updateStatus(selectedTransaction.id, newStatus);
      setNewStatus("");
      setSelectedTransaction(null);
      setShowStatusDialog(false);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const showConversation = (transaction) => {
    setSelectedTransaction(transaction);
    setConversation(parseConversation(transaction.remarks, transaction.responses));
  };

  const getNextStatusOptions = (currentStatus) => {
    switch(currentStatus) {
      case "ACTIVE":
        return ["MODIFIED", "INACTIVE"];
      case "MODIFIED":
        return ["ACTIVE", "INACTIVE"];
      case "INACTIVE":
        return ["ACTIVE", "MODIFIED"];
      default:
        return ["ACTIVE", "MODIFIED", "INACTIVE"];
    }
  };

  const handlePreviewBill = async () => {
    if (!billFilters.employee || !billFilters.month || !billFilters.year) {
      alert("Please select employee, month, and year");
      return;
    }

    try {
      const response = await transactionApi.generateBill({
        employeeId: billFilters.employee,
        month: billFilters.month,
        year: billFilters.year,
      });
      setBillPreview({
        ...response.data,
        modifiedCount: response.data.transactions.filter(t => t.status === "MODIFIED").length,
        inactiveCount: response.data.transactions.filter(t => t.status === "INACTIVE").length,
        activeTransactions: response.data.transactions.filter(t => t.status === "ACTIVE")
      });
      setShowBillPreview(true);
    } catch (error) {
      console.error("Error previewing bill:", error);
    }
  };

  const handleSendBill = async () => {
    if (billPreview.modifiedCount > 0) {
      alert("Cannot send bill. Some transactions have MODIFIED status. Please resolve all remarks first.");
      return;
    }

    try {
      await transactionApi.updateStatus(billPreview.id, "PAID");
      alert("Bill sent successfully!");
      setShowBillPreview(false);
      setBillPreview(null);
      loadData();
    } catch (error) {
      console.error("Error sending bill:", error);
    }
  };

  const handleCreateTransactions = async () => {
    try {
      await transactionApi.createTransactions();
      loadData();
      alert("Transactions created successfully from order history");
    } catch (error) {
      console.error("Error creating transactions:", error);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !filters.search ||
      transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.menuItemName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesEmployee = filters.employee === "ALL" || transaction.employeeBusinessId === filters.employee;
    const matchesStatus = filters.status === "ALL" || transaction.status === filters.status;

    const transactionDate = new Date(transaction.createdAt);
    const matchesMonth = filters.month === "all" || transactionDate.getMonth() + 1 === Number.parseInt(filters.month);
    const matchesYear = !filters.year || transactionDate.getFullYear() === Number.parseInt(filters.year);

    return matchesSearch && matchesEmployee && matchesStatus && matchesMonth && matchesYear;
  });

  const getStatusCounts = () => {
    return {
      total: filteredTransactions.length,
      active: filteredTransactions.filter((t) => t.status === "ACTIVE").length,
      inactive: filteredTransactions.filter((t) => t.status === "INACTIVE").length,
      modified: filteredTransactions.filter((t) => t.status === "MODIFIED").length,
    };
  };

  const statusCounts = getStatusCounts();

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600">Manage employee orders, remarks, and billing</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTransactions}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Orders
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.modified}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Bill Generation Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generate Monthly Bill</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={billFilters.employee}
                onChange={(e) => setBillFilters({ ...billFilters, employee: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
              <select
                value={billFilters.month}
                onChange={(e) => setBillFilters({ ...billFilters, month: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={billFilters.year}
                onChange={(e) => setBillFilters({ ...billFilters, year: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Year</option>
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
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Preview className="w-4 h-4 mr-2" />
                Preview Bill
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filters.employee}
              onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.fullName}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MODIFIED">Modified</option>
            </select>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
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
              onClick={() =>
                setFilters({
                  search: "",
                  employee: "ALL",
                  status: "ALL",
                  month: "all",
                  year: new Date().getFullYear().toString(),
                })
              }
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Menu Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono">{transaction.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.employeeBusinessId}</div>
                        </div>
                      </div>
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
                        View Conversation
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowStatusDialog(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Change status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        {transaction.status === "MODIFIED" && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowResponseDialog(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Add response"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {transaction.status !== "MODIFIED" && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowRemarkDialog(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Add remark"
                          >
                            <MessageSquare className="w-4 h-4" />
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

        {/* Response Dialog */}
        {showResponseDialog && selectedTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Response</h3>
                <button onClick={() => {
                  setShowResponseDialog(false);
                  setSelectedTransaction(null);
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Responding to Transaction #{selectedTransaction.transactionId}</p>
                </div>
                <textarea
                  placeholder="Type your response..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowResponseDialog(false);
                      setSelectedTransaction(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddResponse}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remark Dialog */}
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
                    Add Remark
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Dialog */}
        {showStatusDialog && selectedTransaction && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Status</h3>
                <button onClick={() => setShowStatusDialog(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <span>{getStatusBadge(selectedTransaction.status)}</span>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change to:
                  </label>
                  <div className="space-y-2">
                    {getNextStatusOptions(selectedTransaction.status).map((status) => (
                      <div key={status} className="flex items-center">
                        <input
                          type="radio"
                          id={`status-${status}`}
                          name="status"
                          value={status}
                          checked={newStatus === status}
                          onChange={() => setNewStatus(status)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor={`status-${status}`} className="ml-2 block text-sm text-gray-900">
                          {getStatusBadge(status)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setShowStatusDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={!newStatus}
                    className={`px-4 py-2 rounded-md text-white ${
                      !newStatus ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Conversation Dialog */}
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
            setShowResponseDialog(true);
            setSelectedTransaction(null);
            setConversation([]);
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Response
        </button>
      </div>
    </div>
  </div>
)}

        {/* Bill Preview Dialog */}
        {showBillPreview && billPreview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bill Preview</h3>
                <button onClick={() => setShowBillPreview(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Employee:</strong> {billPreview.employeeName}
                    </p>
                    <p>
                      <strong>Employee ID:</strong> {billPreview.employeeId}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Period:</strong> {billPreview.month}/{billPreview.year}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> ${billPreview.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Show warning if there are modified transactions */}
                {statusCounts.modified > 0 && (
                  <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          Warning: {statusCounts.modified} transaction(s) have MODIFIED status. Please resolve all
                          remarks before sending the bill.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status summary cards */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">Active Transactions</p>
                    <p className="text-2xl font-bold text-green-700">{billPreview.activeTransactions.length}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm text-red-600">Inactive Transactions</p>
                    <p className="text-2xl font-bold text-red-700">{statusCounts.inactive}</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-600">Modified Transactions</p>
                    <p className="text-2xl font-bold text-yellow-700">{statusCounts.modified}</p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Active transactions table */}
                <div className="max-h-96 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Active Transactions (Will be included in bill)</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billPreview.activeTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">#{transaction.orderBusinessId}</td>
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

                {/* Action buttons */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowBillPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBill}
                    disabled={statusCounts.modified > 0}
                    className={`flex items-center px-4 py-2 rounded-md text-white ${
                      statusCounts.modified > 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Generate & Send Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}