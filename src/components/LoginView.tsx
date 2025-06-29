"use client";
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginView() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle className="text-center text-2xl flex flex-col">
      Welcome to
      <span className="text-3xl bg-gradient-to-r from-[#FF9900] to-[#FF6600] bg-clip-text text-transparent">
        Amazon Price Tracker
      </span>
      <svg
  className="w-full h-8 mt-2"
  viewBox="0 0 200 40"
  preserveAspectRatio="none"
>
  <polyline
    fill="none"
    stroke="#FF9900"
    strokeWidth="2"
    points="0,30 20,10 40,20 60,5 80,25 100,15 120,35 140,20 160,30 180,10 200,25"
  />
</svg>
    </CardTitle>
    <CardDescription className="text-center mt-4">
      Please, log in with Google to track a price of your favorite items
    </CardDescription>
  </CardHeader>
  <CardFooter className="flex-col gap-2">
    <Button onClick={() => signIn("google")} className="w-full cursor-pointer">
      Login with Google
    </Button>
  </CardFooter>
</Card>
    </div>
  );
}
