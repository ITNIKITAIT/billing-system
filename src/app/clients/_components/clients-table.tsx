"use client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { getClients } from "@/lib/services/client.service";

type ClientWithPlan = Awaited<ReturnType<typeof getClients>>[number];

interface ClientsTableProps {
  clients: ClientWithPlan[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client list</CardTitle>
        <CardDescription>
          All clients with their plan and status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No clients yet. Add a client to get started.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.plan?.name ?? "—"}</TableCell>
                  <TableCell>
                    {client.discount > 0 ? `${client.discount}%` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
