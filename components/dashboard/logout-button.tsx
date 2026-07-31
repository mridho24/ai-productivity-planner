"use client";

import { LogOut } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => void logout()}>
      <LogOut className="h-4 w-4" />
      Keluar
    </Button>
  );
}
