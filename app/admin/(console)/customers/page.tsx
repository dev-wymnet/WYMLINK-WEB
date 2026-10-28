"use client";

import { PageHeader } from "@/components/app/ui";
import { CustomerTable } from "@/components/admin/customer_table";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" subtitle="Search any customer to review their identity checks and account." />
      <CustomerTable showStatusFilter emptyTitle="No customers yet" />
    </div>
  );
}
