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
import {
  useGetRolesQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "../../../store/api/usersApi";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useGetUsersQuery();
  const { data: roles } = useGetRolesQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();

  const handleRoleChange = async (userId: number, newRoleId: string) => {
    try {
      await updateUserRole({ userId, roleId: newRoleId }).unwrap();
    } catch (error) {
      console.error("Role update failed:", error);
      alert("Failed to update role. Please check backend permissions.");
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "Admin":
        return "destructive";
      case "Instructor":
        return "default";
      case "Content Manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-2">
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
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading platform users...
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
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
                            {roles?.map((role) => (
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
