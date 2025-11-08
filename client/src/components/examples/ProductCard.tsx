import ProductCard from '../ProductCard';
import productImage from '@assets/generated_images/Blue_rope_dog_toy_9e7809a2.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id={1}
        name="Rope Tug Toy"
        price={12.99}
        image={productImage}
        rating={4.5}
        reviews={128}
        category="Dog Toys"
        isNew={true}
      />
    </div>
  );
}
