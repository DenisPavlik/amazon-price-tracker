"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduct } from "@/actions/productActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function AddProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get("productId") as string;

    setLoading(true);

    try {
      const response = await addProduct(productId);

      if (response) {
        toast.success("Product added!");
        router.push("/");
      } else {
        toast.error("Oops! Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <Label
        htmlFor="productId"
        className="mb-1 uppercase font-extrabold text-gray-600"
      >
        Product ID
      </Label>
      <Input
        id="productId"
        name="productId"
        placeholder="Enter productID, example: L02IF44P817C"
      />
      <div className="flex justify-center mt-6">
        <Button type="submit" className="cursor-pointer" disabled={loading}>
          {loading ? "Adding..." : "Add product"}
        </Button>
      </div>
    </form>
  );
}
