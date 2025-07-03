import { addProduct } from "@/actions/productActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddProduct() {
  async function handleSubmit (e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get("productId") as string;

    const response = await addProduct(productId);
    console.log(response);
    
  }
  return (
    <div className="col-span-9">
      <div className="max-w-md mx-auto bg-white/50 rounded-xl p-6">
        <h1 className="font-bold mb-2 text-center">Add product</h1>
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
            <Button type="submit" className="cursor-pointer">Add product</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
