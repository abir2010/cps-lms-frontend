"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/store";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: Role | null;
}

export default function AdminUsersPage() {
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // 1. Fetch Users and Available Roles
  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;
      try {
        const headers = { Authorization: `Bearer ${jwt}` };

        const [usersRes, rolesRes] = await Promise.all([
          fetch(`${STRAPI_URL}/api/users?populate=role`, { headers }),
          fetch(`${STRAPI_URL}/api/users-permissions/roles`, { headers }),
        ]);

        const usersData = await usersRes.json();
        const rolesData = await rolesRes.json();

        setUsers(usersData);
        setRoles(rolesData.roles || []);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jwt, STRAPI_URL]);

  // 2. Handle Role Upgrades/Downgrades
  const handleRoleChange = async (userId: number, newRoleId: string) => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          role: newRoleId, // Strapi requires the role ID to update the relation
        }),
      });

      if (!response.ok) throw new Error("Failed to update user role");

      const updatedUser = await response.json();

      // Instantly update the UI without reloading the page
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user,
        ),
      );
    } catch (error) {
      console.error("Role update failed:", error);
      alert("Failed to update role. Please check backend permissions.");
    }
  };

  // 3. Visual formatting for different permission levels
  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "destructive";
      case "Instructor":
        return "default";
      case "Content Manager":
        return "secondary";
      default:
        return "outline"; // Default for Student
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-slate-500 mt-2">
          View registered accounts and modify platform access levels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="w-50">Update Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      Loading platform users...
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(
                            user.role?.name || "Student",
                          )}
                        >
                          {user.role?.name || "Unassigned"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role?.id?.toString() || undefined}
                          onValueChange={(value) =>
                            value && handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
