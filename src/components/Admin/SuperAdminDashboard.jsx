
import { useState, useEffect } from "react";
import { UserPlus, UserMinus, Users, Shield, Search, Settings, Activity, Briefcase } from "lucide-react";
import api from "../api";
import './../../index.css';


export default function SuperAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);

  const promoteToAdmin = async (employeeId) => {
    try {
      const response = await api.post('/api/admin/promote', { employeeId });
      console.log(response.data);
      const updatedResponse = await api.get('/api/admin/employees');
      setEmployees(updatedResponse.data);
    } catch (error) {
      console.error('Promotion failed:', error);
    }
  };

  const demoteAdmin = async (employeeId) => {
    try {
      const response = await api.post('/api/admin/demote', { employeeId });
      console.log(response.data);
      const updatedResponse = await api.get('/api/admin/employees');
      setEmployees(updatedResponse.data);
    } catch (error) {
      console.error('Demotion failed:', error);
    }
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await api.get('/api/admin/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to load employees:', error);
      }
    };
    
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>User Management System</span>
            </p>
          </div>
          
          {/* Search Bar - Positioned to the right */}
          <div className="w-full md:w-auto relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
              <Search className="absolute left-3 text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-800">{employees.filter(e => e.admin).length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-2xl font-bold text-gray-800">{new Set(employees.map(e => e.department)).size}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-blue-100 rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className=" overflow-x-auto">
            <table className="min-w-full divide-y divide-black">
              <thead className="bg-black-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3 text-gray-400" />
                      Employee ID
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-300 divide-y divide-black">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          {emp.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm text-gray-900 font-medium">{emp.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-gray-400" />
                          {emp.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        {emp.admin ? (
                          <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1 w-fit">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1 w-fit">
                            <Users className="h-3 w-3" />
                            Employee
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap ">
                        <div className="flex gap-2">
                          {!emp.admin ? (
                            <button
                              onClick={() => promoteToAdmin(emp.employeeId)}
                              className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200 flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <UserPlus className="h-3 w-3" /> Promote
                            </button>
                          ) : (
                            <button
                              onClick={() => demoteAdmin(emp.employeeId)}
                              className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <UserMinus className="h-3 w-3" /> Demote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No employees found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}