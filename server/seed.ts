import "dotenv/config";
import db from "./index";
import { products } from "./schema";

async function seed() {
  console.log("Seeding products...");

  await db.insert(products).values([
    // ── Bestsellers (IDs 1-3, match homepage hardcoded array) ──
    {
      name: "Rose Luxe Vibrator",
      price: 49,
      quantity: 60,
      description: "A premium rose-shaped vibrator with 10 whisper-quiet vibration modes. Waterproof and USB rechargeable.",
      image: "/products/rose1.jpg",
      category: "Vibrator",
      bestseller: true,
      featured: false,
    },
    {
      name: "Mini Wand Vibrator",
      price: 29,
      quantity: 80,
      description: "Compact wand vibrator with powerful rumbling vibrations. Perfect for travel and on-the-go pleasure.",
      image: "/products/vibrator.jpg",
      category: "Vibrator",
      bestseller: true,
      featured: false,
    },
    {
      name: "White Strap-On",
      price: 79,
      quantity: 30,
      description: "Comfortable adjustable harness with a realistic silicone shaft. Suitable for all body types.",
      image: "/products/whitestrapon.jpg",
      category: "Dildos",
      bestseller: true,
      featured: false,
    },
    // ── Featured (IDs 4-5, match homepage featured array) ──
    {
      name: "Luxury Glass Dildo",
      price: 59,
      quantity: 25,
      description: "Hand-crafted borosilicate glass dildo. Temperature-play compatible, body-safe and silky smooth.",
      image: "/products/glass.jpg",
      category: "Dildos",
      bestseller: false,
      featured: true,
    },
    {
      name: "Rechargeable Bullet",
      price: 19,
      quantity: 100,
      description: "Discreet and powerful bullet vibrator with 7 stimulation patterns. Magnetic USB charging.",
      image: "/products/bullet.jpg",
      category: "Vibrator",
      bestseller: false,
      featured: true,
    },
    // ── Additional test products ──
    {
      name: "Vibrator Panties",
      price: 39,
      quantity: 45,
      description: "Remote-controlled wearable vibrator panties with 10 modes. Perfect for couples play.",
      image: "/products/rcvibratorpanties.jpg",
      category: "Accessories",
      bestseller: false,
      featured: false,
    },
    {
      name: "Mini Rabbit Vibrator",
      price: 59,
      quantity: 40,
      description: "Dual stimulation rabbit vibrator targeting the G-spot and clitoris simultaneously.",
      image: "/products/rabbit-vibrator.png",
      category: "Vibrator",
      bestseller: false,
      featured: true,
    },
    {
      name: "Leather Paddle",
      price: 29,
      quantity: 55,
      description: "Premium genuine leather paddle with a soft suede reverse side. Perfect for sensation play.",
      image: "/products/leather-paddle.png",
      category: "Accessories",
      bestseller: false,
      featured: false,
    },
    {
      name: "Silk Robe",
      price: 79,
      quantity: 35,
      description: "Luxuriously soft 100% mulberry silk robe. Lightweight and sensual for intimate evenings.",
      image: "/products/silk-robe.png",
      category: "Lingerie",
      bestseller: false,
      featured: true,
    },
    {
      name: "Couples Wand",
      price: 99,
      quantity: 20,
      description: "Hands-free couples vibrator designed to be worn during intimacy. Dual motors with app control.",
      image: "/products/couples-wand.png",
      category: "Massager",
      bestseller: true,
      featured: true,
    },
  ]);

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
