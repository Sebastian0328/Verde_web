import type { Product } from "@/lib/products";
import clsx from "clsx";

interface ProductCardProps {
  product: Product;
  selected: boolean;
  onSelect: (productId: string) => void;
}

export default function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      disabled={!product.available}
      className={clsx(
        "w-full text-left border rounded-lg p-5 transition-colors",
        selected
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-400",
        !product.available && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Imagen placeholder — reemplazar con <Image> cuando haya branding */}
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded mb-4"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400 text-sm">
          Foto próximamente
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
          {product.allergens && product.allergens.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Contiene: {product.allergens.join(", ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">{product.finalPrice} €</p>
          <p className="text-xs text-gray-500 mt-0.5">reserva 1 €</p>
        </div>
      </div>

      {!product.available && (
        <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
          Agotado
        </span>
      )}
    </button>
  );
}
