import { Suspense } from "react";
import { BuySmsClient } from "./buy-sms-client";

export const dynamic = "force-dynamic";

export default function BuySmsPage() {
  return (
    <Suspense fallback={null}>
      <BuySmsClient />
    </Suspense>
  );
}
