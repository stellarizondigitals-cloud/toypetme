import ProductCard from "./ProductCard";
import ropeImage from "@assets/generated_images/Blue_rope_dog_toy_9e7809a2.png";
import ballImage from "@assets/generated_images/Orange_squeaky_ball_toy_1c7bd6bd.png";
import plushImage from "@assets/generated_images/Pink_plush_teddy_toy_48b5bc9b.png";
import puzzleImage from "@assets/generated_images/Green_puzzle_cat_toy_aec3417d.png";

const products = [
  {
    id: 1,
    name: "Rope Tug Toy",
    price: 12.99,
    image: ropeImage,
    rating: 4.5,
    reviews: 128,
    category: "Dog Toys",
    isNew: true,
  },
  {
    id: 2,
    name: "Squeaky Ball",
    price: 8.99,
    image: ballImage,
    rating: 4.8,
    reviews: 256,
    category: "Dog Toys",
    isNew: false,
  },
  {
    id: 3,
    name: "Plush Teddy",
    price: 15.99,
    image: plushImage,
    rating: 4.3,
    reviews: 89,
    category: "Dog Toys",
    isNew: true,
  },
  {
    id: 4,
    name: "Puzzle Feeder",
    price: 19.99,
    image: puzzleImage,
    rating: 4.7,
    reviews: 174,
    category: "Cat Toys",
    isNew: false,
  },
  {
    id: 5,
    name: "Interactive Ball",
    price: 14.99,
    image: ballImage,
    rating: 4.6,
    reviews: 203,
    category: "Cat Toys",
    isNew: false,
  },
  {
    id: 6,
    name: "Chew Rope",
    price: 11.99,
    image: ropeImage,
    rating: 4.4,
    reviews: 142,
    category: "Dog Toys",
    isNew: false,
  },
  {
    id: 7,
    name: "Soft Plush",
    price: 13.99,
    image: plushImage,
    rating: 4.5,
    reviews: 95,
    category: "Cat Toys",
    isNew: true,
  },
  {
    id: 8,
    name: "Smart Puzzle",
    price: 24.99,
    image: puzzleImage,
    rating: 4.9,
    reviews: 311,
    category: "Dog Toys",
    isNew: true,
  },
];

export default function ProductGrid() {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 
            className="text-3xl md:text-4xl font-semibold" 
            style={{ fontFamily: 'Outfit, sans-serif' }}
            data-testid="text-products-title"
          >
            Featured Products
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
