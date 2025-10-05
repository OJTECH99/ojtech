import React, { Component } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { Skeleton } from "../../components/ui/skeleton";
import { UserCheck, UserX, Search, Briefcase, UserCircle, Plus } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import adminService from "../../lib/api/adminService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/Dialog";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";

interface Role {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  fullName: string;
  role: string;
  hasCompletedOnboarding: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Other profile fields may be present
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  enabled: boolean;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

interface ApiResponse {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface UsersAdminPageState {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterRole: string;
  pageSize: number;
  isCreateUserDialogOpen: boolean;
  isCreating: boolean;
  newUser: {
    username: string;
    email: string;
    role: string;
  };
  createUserError: string | null;
}

export class UsersAdminPage extends Component<{}, UsersAdminPageState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;
  
  constructor(props: {}) {
    super(props);
    this.state = {
      users: [],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      loading: true,
      error: null,
      searchQuery: "",
      filterRole: "all",
      pageSize: 10,
      isCreateUserDialogOpen: false,
      isCreating: false,
      newUser: {
        username: "",
        email: "",
        role: "employer"
      },
      createUserError: null
    };
  }
  
  componentDidMount() {
    this.fetchUsers();
  }
  
  async fetchUsers() {
    try {
      const { currentPage, pageSize, searchQuery } = this.state;
      let response: ApiResponse;
      
      if (searchQuery) {
        response = await adminService.searchUsers(searchQuery, currentPage, pageSize);
      } else {
        response = await adminService.getPaginatedUsers(currentPage, pageSize);
      }
      
      this.setState({
        users: response.users || [],
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      this.setState({ 
        loading: false,
        error: typeof error === 'string' ? error : "Failed to load users" 
      });
    }
  }
  
  handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value });
  }
  
  handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ filterRole: e.target.value });
  }
  
  handleActivateUser = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error activating user:", error);
    }
  }
  
  handleDeactivateUser = async (userId: string) => {
    try {
      await adminService.toggleUserStatus(userId);
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  }
  
  getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <UserCheck className="h-5 w-5 text-gray-600" />;
      case 'ROLE_EMPLOYER':
        return <Briefcase className="h-5 w-5 text-gray-500" />;
      case 'ROLE_STUDENT':
        return <UserCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <UserCircle className="h-5 w-5 text-gray-300" />;
    }
  }
  
  handlePageChange = (newPage: number) => {
    this.setState({ currentPage: newPage }, () => {
      this.fetchUsers();
    });
  }
  
  handleUserDelete = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  handleCreateUserDialogOpen = () => {
    this.setState({ 
      isCreateUserDialogOpen: true,
      newUser: {
        username: "",
        email: "",
        role: "ROLE_STUDENT"
      },
      createUserError: null
    });
  }

  handleCreateUserDialogClose = () => {
    this.setState({ isCreateUserDialogOpen: false });
  }

  handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      newUser: {
        ...prevState.newUser,
        [name]: value
      }
    }));
  }

  handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      this.setState({ createUserError: null, isCreating: true });
      const { newUser } = this.state;
      
      await adminService.createUser({
        username: newUser.username,
        email: newUser.email,
        role: "employer"
      });
      
      this.setState({ isCreateUserDialogOpen: false, isCreating: false });
      await this.fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error creating user:", error);
      this.setState({ 
        createUserError: typeof error === 'string' ? error : "Failed to create user",
        isCreating: false
      });
    }
  }

  getFilteredUsers = () => {
    const { users, filterRole } = this.state;
    
    if (filterRole === 'all') {
      return users;
    }
    
    return users.filter(user => 
      user.roles && user.roles.some(role => role.name === filterRole)
    );
  }
  
  render() {
    const { user } = this.context || {};
    const { 
      loading, 
      error, 
      searchQuery, 
      filterRole, 
      isCreateUserDialogOpen, 
      newUser, 
      createUserError 
    } = this.state;
    
    // Redirect if not logged in or not admin
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }
    
    const filteredUsers = this.getFilteredUsers() || [];
    
    return (
      <div className="container mx-auto py-6 space-y-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage platform users and control account access.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={this.handleCreateUserDialogOpen} variant="default">
              <Plus className="h-4 w-4 mr-1" />
              Create User
            </Button>
            <Button onClick={() => this.fetchUsers()}>
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={this.handleCreateUserDialogClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={this.handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={newUser.username}
                    onChange={this.handleNewUserInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={this.handleNewUserInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    Employer
                    <input
                      type="hidden"
                      id="role"
                      name="role"
                      value="employer"
                    />
                  </div>
                </div>
                {createUserError && (
                  <div className="text-red-500 text-sm mt-2">
                    {createUserError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={this.handleCreateUserDialogClose} disabled={this.state.isCreating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={this.state.isCreating}>
                  {this.state.isCreating ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background"
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>
          
          <select
            className="w-full md:w-auto pl-3 pr-8 py-2 text-sm rounded-md border border-input bg-background"
            value={filterRole}
            onChange={this.handleFilterChange}
          >
            <option value="all">All Roles</option>
            <option value="ROLE_STUDENT">Students</option>
            <option value="ROLE_EMPLOYER">Employers</option>
            <option value="ROLE_ADMIN">Admins</option>
          </select>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                {error}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email Verified</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {user.roles && user.roles.length > 0 ? this.getRoleIcon(user.roles[0].name) : this.getRoleIcon('')}
                              <span className="ml-2">
                                {user.roles && user.roles.length > 0 ? user.roles.map((role) => 
                                  role.name.replace('ROLE_', '')
                                ).join(', ') : 'No Role'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.emailVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.emailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.enabled ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => this.handleDeactivateUser(user.id)}
                                title="Deactivate User"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => this.handleActivateUser(user.id)}
                                title="Activate User"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => this.handleUserDelete(user.id)}
                              className="ml-2"
                              title="Delete User"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}
