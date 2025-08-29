import { db, categories, products, users } from './index';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order due to foreign keys)
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);

    console.log('✅ Cleared existing data');

    // Create sample categories
    const categoryData = [
      {
        name: 'Фрукты и овощи',
        slug: 'fruits-vegetables',
        description: 'Свежие фрукты и овощи высокого качества',
        imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500',
        isActive: true,
      },
      {
        name: 'Молочные продукты',
        slug: 'dairy-products',
        description: 'Молоко, сыры, йогурты и другие молочные продукты',
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500',
        isActive: true,
      },
      {
        name: 'Мясо и рыба',
        slug: 'meat-fish',
        description: 'Свежее мясо, птица и рыба',
        imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500',
        isActive: true,
      },
      {
        name: 'Хлеб и выпечка',
        slug: 'bread-bakery',
        description: 'Свежий хлеб и кондитерские изделия',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
        isActive: true,
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${insertedCategories.length} categories`);

    // Create sample products
    const productData = [
      // Фрукты и овощи
      {
        name: 'Яблоки Гала',
        slug: 'apples-gala',
        description: 'Сочные и сладкие яблоки сорта Гала. Идеально подходят для употребления в свежем виде.',
        shortDescription: 'Сочные яблоки сорта Гала',
        sku: 'APPLE-GALA-001',
        price: '3.50',
        categoryId: insertedCategories[0].id,
        inventory: 100,
        weight: '0.200',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'],
        tags: ['фрукты', 'здоровое питание', 'витамины'],
        metaTitle: 'Яблоки Гала - свежие и сочные',
        metaDescription: 'Купить свежие яблоки Гала в интернет-магазине BigShop',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Бананы',
        slug: 'bananas',
        description: 'Спелые бананы, богатые калием и витаминами. Отличный источник энергии.',
        shortDescription: 'Спелые бананы',
        sku: 'BANANA-001',
        price: '2.80',
        categoryId: insertedCategories[0].id,
        inventory: 150,
        weight: '0.150',
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'],
        tags: ['фрукты', 'калий', 'энергия'],
        metaTitle: 'Свежие бананы',
        metaDescription: 'Спелые бананы с доставкой на дом',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Морковь',
        slug: 'carrots',
        description: 'Свежая морковь, богатая бета-каротином. Отлично подходит для салатов и готовки.',
        shortDescription: 'Свежая морковь',
        sku: 'CARROT-001',
        price: '1.90',
        categoryId: insertedCategories[0].id,
        inventory: 80,
        weight: '1.000',
        images: ['https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500'],
        tags: ['овощи', 'бета-каротин', 'здоровое питание'],
        metaTitle: 'Свежая морковь',
        metaDescription: 'Купить свежую морковь в BigShop',
        isFeatured: false,
        isActive: true,
      },

      // Молочные продукты
      {
        name: 'Молоко 3.2%',
        slug: 'milk-32-percent',
        description: 'Натуральное коровье молоко жирностью 3.2%. Богато кальцием и белком.',
        shortDescription: 'Молоко 3.2% жирности',
        sku: 'MILK-32-001',
        price: '2.50',
        categoryId: insertedCategories[1].id,
        inventory: 50,
        weight: '1.000',
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'],
        tags: ['молочные продукты', 'кальций', 'белок'],
        metaTitle: 'Молоко 3.2% - натуральное и свежее',
        metaDescription: 'Купить свежее молоко 3.2% жирности',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Сыр Гауда',
        slug: 'gouda-cheese',
        description: 'Классический голландский сыр Гауда с нежным вкусом и ароматом.',
        shortDescription: 'Сыр Гауда голландский',
        sku: 'CHEESE-GOUDA-001',
        price: '12.90',
        comparePrice: '15.00',
        categoryId: insertedCategories[1].id,
        inventory: 25,
        weight: '0.300',
        images: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500'],
        tags: ['сыр', 'голландский', 'деликатес'],
        metaTitle: 'Сыр Гауда голландский',
        metaDescription: 'Натуральный голландский сыр Гауда',
        isFeatured: true,
        isActive: true,
      },

      // Мясо и рыба
      {
        name: 'Куриное филе',
        slug: 'chicken-breast',
        description: 'Свежее куриное филе без кости и кожи. Диетический продукт с высоким содержанием белка.',
        shortDescription: 'Куриное филе без кости',
        sku: 'CHICKEN-BREAST-001',
        price: '8.50',
        categoryId: insertedCategories[2].id,
        inventory: 30,
        weight: '0.500',
        images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500'],
        tags: ['мясо', 'курица', 'белок', 'диетическое'],
        metaTitle: 'Свежее куриное филе',
        metaDescription: 'Куриное филе высокого качества',
        isFeatured: false,
        isActive: true,
      },

      // Хлеб и выпечка
      {
        name: 'Хлеб ржаной',
        slug: 'rye-bread',
        description: 'Традиционный ржаной хлеб, выпеченный по классическому рецепту.',
        shortDescription: 'Ржаной хлеб традиционный',
        sku: 'BREAD-RYE-001',
        price: '2.20',
        categoryId: insertedCategories[3].id,
        inventory: 40,
        weight: '0.400',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'],
        tags: ['хлеб', 'ржаной', 'традиционный'],
        metaTitle: 'Ржаной хлеб',
        metaDescription: 'Традиционный ржаной хлеб',
        isFeatured: false,
        isActive: true,
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Created ${insertedProducts.length} products`);

    // Create sample user
    const userData = [
      {
        email: 'admin@bigshop.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
      }
    ];

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${insertedUsers.length} users`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Log some statistics
    console.log('\n📊 Seeded data summary:');
    console.log(`- Categories: ${insertedCategories.length}`);
    console.log(`- Products: ${insertedProducts.length}`);
    console.log(`- Users: ${insertedUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.main) {
  seed();
}

export default seed;