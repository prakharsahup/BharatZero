"use client";

import { useEffect, useState } from "react";
import { callBackend } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    callBackend("/user/me")
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading...</p>;

  return <div>Welcome {data.email}</div>;
}