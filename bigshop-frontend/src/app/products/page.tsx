import ProductGrid from '@/components/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Каталог продуктов
        </h1>
        <p className="text-xl text-gray-600">
          Свежие продукты с доставкой на дом
        </p>
      </div>
      
      <ProductGrid />
    </div>
  );
}