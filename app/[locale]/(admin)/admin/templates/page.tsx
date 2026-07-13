import { Suspense } from "react";
import { AdminTemplatesClient } from "./templates-client";

export default function AdminTemplatesPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <AdminTemplatesClient />
    </Suspense>
  );
}