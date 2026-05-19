import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group overflow-hidden rounded-[32px] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="aspect-square relative overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute left-4 top-4 bg-white/90 text-slate-900 backdrop-blur-md border-none">
          {product.category}
        </Badge>
      </div>
      <CardContent className="p-6">
        <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
        <p className="mt-2 text-xl font-black text-blue-600">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white transition-all hover:bg-blue-600">
          <ShoppingBag className="h-4 w-4" /> DETAIL PRODUK
        </button>
      </CardFooter>
    </Card>
  );
}