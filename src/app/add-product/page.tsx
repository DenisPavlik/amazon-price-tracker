import AddProductForm from "@/components/AddProductForm";

export default function AddProduct() {
  return (
    <div className="col-span-12 md:col-span-9">
      <div className="max-w-md mx-auto bg-white/50 rounded-xl p-6">
        <h1 className="font-bold mb-2 text-center">Add product</h1>
        <AddProductForm />
      </div>
    </div>
  );
}
