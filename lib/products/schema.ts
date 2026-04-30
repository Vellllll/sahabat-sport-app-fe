import z from "zod";

const ProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  product_category_id: z.string().min(1, "Kategori wajib dipilih"), // <--- Sesuaikan
  isDisplayed: z.boolean(),
});
