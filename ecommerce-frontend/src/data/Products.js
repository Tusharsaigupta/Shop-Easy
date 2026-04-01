/*const products = [
  {
    id: 1,
    name: "iPhone 18 Pro Max",
    price: 800,
    category: "electronics",
    rating: 4.8,
    description: "Latest Apple flagship smartphone with advanced features",

    highlights: [
      "256 GB Storage",
      "6.9 inch Display",
      "48MP Camera",
      "A19 Bionic Chip",
    ],

    specifications: {
      Brand: "Apple",
      Model: "iPhone 18 Pro Max",
      Color: "Space Black",
      Battery: "4200 mAh",
      Display: "OLED",
    },

    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ddC-wp2HfRluc0ZLso8mt_Q3gBRcG3zpKg&s",
  },

  {
    id: 2,
    name: "Nike Shoes",
    price: 120,
    category: "fashion",
    rating: 4.5,
    description: "Comfortable and stylish Nike shoes",

    highlights: [
      "Lightweight design",
      "Breathable material",
      "Durable sole",
    ],

    specifications: {
      Brand: "Nike",
      Type: "Running Shoes",
      Material: "Mesh",
      Sole: "Rubber",
    },

    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 3,
    name: "Laptop",
    price: 1000,
    category: "electronics",
    rating: 4.6,
    description: "High performance laptop for work and gaming",

    highlights: [
      "16GB RAM",
      "512GB SSD",
      "Intel i7 Processor",
      "Backlit Keyboard",
    ],

    specifications: {
      Brand: "Dell",
      Processor: "Intel i7",
      RAM: "16GB",
      Storage: "512GB SSD",
    },

    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 4,
    name: "T-Shirt",
    price: 30,
    category: "fashion",
    rating: 4.2,
    description: "Premium cotton T-shirt",

    highlights: ["100% Cotton", "Regular Fit", "Soft Fabric"],

    specifications: {
      Brand: "H&M",
      Fabric: "Cotton",
      Fit: "Regular",
    },

    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520975922320-7c1b3a0b5b90?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 5,
    name: "Headphones",
    price: 150,
    category: "electronics",
    rating: 4.4,
    description: "Noise cancelling headphones",

    highlights: ["Noise Cancellation", "Bluetooth 5.0", "20h Battery"],

    specifications: {
      Brand: "Sony",
      Type: "Wireless",
      Battery: "20 hours",
    },

    images: [
      "https://images.unsplash.com/photo-1518441902117-f0a9c8f2f6e4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 6,
    name: "Smart Watch",
    price: 200,
    category: "electronics",
    rating: 4.3,
    description: "Track your fitness and health",

    highlights: ["Heart Rate Monitor", "Water Resistant", "GPS"],

    specifications: {
      Brand: "Samsung",
      Battery: "2 Days",
      Display: "AMOLED",
    },

    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 7,
    name: "Backpack",
    price: 60,
    category: "fashion",
    rating: 4.1,
    description: "Durable travel backpack",

    highlights: ["Waterproof", "Large Capacity", "Comfort Straps"],

    specifications: {
      Brand: "Wildcraft",
      Capacity: "30L",
    },

    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 8,
    name: "Sunglasses",
    price: 50,
    category: "fashion",
    rating: 4.0,
    description: "Stylish sunglasses",

    highlights: ["UV Protection", "Lightweight", "Trendy Design"],

    specifications: {
      Brand: "RayBan",
      Lens: "UV Protected",
    },

    images: [
      "https://images.unsplash.com/photo-1582582494700-7c6d0c0b6f8d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 9,
    name: "Chair",
    price: 90,
    category: "home",
    rating: 4.2,
    description: "Comfortable chair for home",

    highlights: ["Ergonomic Design", "Wood Finish"],

    specifications: {
      Material: "Wood",
      Weight: "5kg",
    },

    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 10,
    name: "Table Lamp",
    price: 40,
    category: "home",
    rating: 4.3,
    description: "Elegant table lamp",

    highlights: ["LED Light", "Energy Saving"],

    specifications: {
      Type: "LED",
      Power: "10W",
    },

    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 11,
    name: "Keyboard",
    price: 70,
    category: "electronics",
    rating: 4.4,
    description: "Mechanical keyboard",

    highlights: ["RGB Lighting", "Mechanical Keys"],

    specifications: {
      Type: "Mechanical",
      Connectivity: "USB",
    },

    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },

  {
    id: 12,
    name: "Gaming Mouse",
    price: 60,
    category: "electronics",
    rating: 4.5,
    description: "RGB gaming mouse",

    highlights: ["Adjustable DPI", "Ergonomic Design"],

    specifications: {
      DPI: "16000",
      Connectivity: "USB",
    },

    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
    ],
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
  },
];

export default products;

*/