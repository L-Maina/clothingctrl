import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if already seeded
    const existingProducts = await db.product.count();
    if (existingProducts > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already seeded',
        products: existingProducts 
      });
    }

    // Clear existing data
    await db.communityPhoto.deleteMany();
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.cartItem.deleteMany();
    await db.review.deleteMany();
    await db.loyalty.deleteMany();
    await db.customer.deleteMany();
    await db.subscriber.deleteMany();
    await db.nextDrop.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();

    // Create categories with types
    const tshirts = await db.category.create({
      data: { name: 'T-Shirts', slug: 't-shirts', type: 'CLOTHES', description: 'Tees and tops' },
    });
    const hoodies = await db.category.create({
      data: { name: 'Hoodies', slug: 'hoodies', type: 'CLOTHES', description: 'Hoodies and sweatshirts' },
    });
    const jackets = await db.category.create({
      data: { name: 'Jackets', slug: 'jackets', type: 'CLOTHES', description: 'Jackets and coats' },
    });
    const pants = await db.category.create({
      data: { name: 'Pants', slug: 'pants', type: 'CLOTHES', description: 'Pants and jeans' },
    });
    const shorts = await db.category.create({
      data: { name: 'Shorts', slug: 'shorts', type: 'CLOTHES', description: 'Shorts' },
    });

    const sneakers = await db.category.create({
      data: { name: 'Sneakers', slug: 'sneakers', type: 'SHOES', description: 'Designer sneakers' },
    });
    const boots = await db.category.create({
      data: { name: 'Boots', slug: 'boots', type: 'SHOES', description: 'Boots and booties' },
    });
    const loafers = await db.category.create({
      data: { name: 'Loafers', slug: 'loafers', type: 'SHOES', description: 'Loafers and formal shoes' },
    });

    const bags = await db.category.create({
      data: { name: 'Bags', slug: 'bags', type: 'ACCESSORIES', description: 'Bags and backpacks' },
    });
    const belts = await db.category.create({
      data: { name: 'Belts', slug: 'belts', type: 'ACCESSORIES', description: 'Designer belts' },
    });
    const wallets = await db.category.create({
      data: { name: 'Wallets', slug: 'wallets', type: 'ACCESSORIES', description: 'Wallets and card holders' },
    });
    const ties = await db.category.create({
      data: { name: 'Ties', slug: 'ties', type: 'ACCESSORIES', description: 'Ties and bow ties' },
    });
    const chains = await db.category.create({
      data: { name: 'Chains', slug: 'chains', type: 'ACCESSORIES', description: 'Chains and necklaces' },
    });
    const sunglasses = await db.category.create({
      data: { name: 'Sunglasses', slug: 'sunglasses', type: 'ACCESSORIES', description: 'Designer eyewear' },
    });
    const hats = await db.category.create({
      data: { name: 'Hats', slug: 'hats', type: 'ACCESSORIES', description: 'Caps and hats' },
    });

    // Create products
    const productsData = [
      { name: 'Gucci GG Monogram Tee', slug: 'gucci-gg-monogram-tee', price: 75000, compareAt: 95000, categoryId: tshirts.id, brand: 'Gucci', condition: 'NEW', featured: true, isNew: false, images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop"]', colors: '["Black","White","Navy"]', sizes: '["S","M","L","XL"]' },
      { name: 'Balenciaga Logo Oversized Tee', slug: 'balenciaga-logo-oversized-tee', price: 65000, categoryId: tshirts.id, brand: 'Balenciaga', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop"]', colors: '["Black","White"]', sizes: '["S","M","L","XL"]' },
      { name: 'BAPE Shark Camo Tee', slug: 'bape-shark-camo-tee', price: 28000, categoryId: tshirts.id, brand: 'Bape', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop"]', colors: '["Green Camo","Blue Camo","Black"]', sizes: '["S","M","L","XL"]' },
      { name: 'Chrome Hearts Cross Tee', slug: 'chrome-hearts-cross-tee', price: 48000, categoryId: tshirts.id, brand: 'Chrome Hearts', condition: 'NEW', isLimited: true, limitedQty: 15, images: '["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=800&fit=crop"]', colors: '["Black","White"]', sizes: '["S","M","L","XL"]' },
      { name: 'Vintage Diesel Graphic Tee', slug: 'vintage-diesel-graphic-tee', price: 8500, categoryId: tshirts.id, brand: 'Diesel', condition: 'THRIFTED', isNew: true, images: '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop"]', colors: '["Black"]', sizes: '["M","L"]' },
      { name: 'Custom Hand-Painted Tee', slug: 'custom-hand-painted-tee', price: 15000, categoryId: tshirts.id, brand: 'Custom', condition: 'CUSTOM', featured: true, images: '["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=800&fit=crop"]', colors: '["White","Black"]', sizes: '["S","M","L","XL"]' },
      
      { name: 'Balenciaga Logo Hoodie', slug: 'balenciaga-logo-hoodie', price: 125000, categoryId: hoodies.id, brand: 'Balenciaga', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop"]', colors: '["Black","Grey","Navy"]', sizes: '["S","M","L","XL"]' },
      { name: 'BAPE Shark Hoodie', slug: 'bape-shark-hoodie', price: 45000, compareAt: 55000, categoryId: hoodies.id, brand: 'Bape', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=600&h=800&fit=crop"]', colors: '["Black","Red","Green"]', sizes: '["S","M","L","XL"]' },
      { name: 'Carhartt WIP Hoodie', slug: 'carhartt-wip-hoodie', price: 22000, categoryId: hoodies.id, brand: 'Carhartt', condition: 'NEW', images: '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop"]', colors: '["Black","Navy","Grey"]', sizes: '["S","M","L","XL"]' },
      { name: 'Thrifted Vintage Nike Hoodie', slug: 'thrifted-vintage-nike-hoodie', price: 12000, categoryId: hoodies.id, brand: 'Nike', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=800&fit=crop"]', colors: '["Grey","Navy"]', sizes: '["M","L","XL"]' },
      
      { name: 'Gucci Leather Biker Jacket', slug: 'gucci-leather-biker-jacket', price: 550000, categoryId: jackets.id, brand: 'Gucci', condition: 'NEW', isLimited: true, limitedQty: 3, images: '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"]', colors: '["Black"]', sizes: '["S","M","L","XL"]' },
      { name: 'Prada Re-Nylon Jacket', slug: 'prada-re-nylon-jacket', price: 215000, categoryId: jackets.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop"]', colors: '["Black","Navy"]', sizes: '["S","M","L","XL"]' },
      { name: 'Diesel Leather Jacket', slug: 'diesel-leather-jacket', price: 85000, categoryId: jackets.id, brand: 'Diesel', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop"]', colors: '["Black","Brown"]', sizes: '["S","M","L","XL"]' },
      { name: 'Thrifted Vintage Denim Jacket', slug: 'thrifted-vintage-denim-jacket', price: 8500, categoryId: jackets.id, brand: 'Other', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1544923246-77307dd628b7?w=600&h=800&fit=crop"]', colors: '["Blue","Black"]', sizes: '["S","M","L"]' },
      { name: 'Custom Embroidered Jacket', slug: 'custom-embroidered-jacket', price: 35000, categoryId: jackets.id, brand: 'Custom', condition: 'CUSTOM', images: '["https://images.unsplash.com/photo-1544923246-77307dd628b7?w=600&h=800&fit=crop"]', colors: '["Black","Navy"]', sizes: '["S","M","L","XL"]' },
      
      { name: 'Balenciaga Track Pants', slug: 'balenciaga-track-pants', price: 115000, categoryId: pants.id, brand: 'Balenciaga', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1624378439576-3bc4657bab6b?w=600&h=800&fit=crop"]', colors: '["Black","Navy","Grey"]', sizes: '["S","M","L","XL"]' },
      { name: 'Gucci Wide Leg Trousers', slug: 'gucci-wide-leg-trousers', price: 125000, categoryId: pants.id, brand: 'Gucci', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1473966968600-fa803b773c90?w=600&h=800&fit=crop"]', colors: '["Black","Navy","Grey"]', sizes: '["28","30","32","34","36"]' },
      { name: 'Carhartt WIP Cargo Pants', slug: 'carhartt-wip-cargo-pants', price: 18000, categoryId: pants.id, brand: 'Carhartt', condition: 'NEW', images: '["https://images.unsplash.com/photo-1541096090599-0d0a8f88f03e?w=600&h=800&fit=crop"]', colors: '["Black","Olive","Khaki"]', sizes: '["28","30","32","34","36"]' },
      { name: 'Thrifted Vintage Jeans', slug: 'thrifted-vintage-jeans', price: 5500, categoryId: pants.id, brand: 'Other', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1541096090599-0d0a8f88f03e?w=600&h=800&fit=crop"]', colors: '["Blue","Black"]', sizes: '["28","30","32","34"]' },
      
      { name: 'BAPE Shark Shorts', slug: 'bape-shark-shorts', price: 18000, categoryId: shorts.id, brand: 'Bape', condition: 'NEW', images: '["https://images.unsplash.com/photo-1624378439576-3bc4657bab6b?w=600&h=800&fit=crop"]', colors: '["Black","Green"]', sizes: '["S","M","L","XL"]' },
      
      { name: 'Balenciaga Triple S Sneakers', slug: 'balenciaga-triple-s-sneakers', price: 145000, compareAt: 175000, categoryId: sneakers.id, brand: 'Balenciaga', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop"]', colors: '["Black","White","Grey"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      { name: 'Gucci Screener Sneakers', slug: 'gucci-screener-sneakers', price: 98000, categoryId: sneakers.id, brand: 'Gucci', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=800&fit=crop"]', colors: '["White/Green","Black"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      { name: 'Prada Americas Cup Sneakers', slug: 'prada-americas-cup-sneakers', price: 110000, categoryId: sneakers.id, brand: 'Prada', condition: 'NEW', images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop"]', colors: '["Black","White","Silver"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      { name: 'Nike Air Force 1 Custom', slug: 'nike-air-force-1-custom', price: 25000, categoryId: sneakers.id, brand: 'Custom', condition: 'CUSTOM', featured: true, images: '["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop"]', colors: '["White Custom","Black Custom"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      { name: 'Thrifted Vintage Jordans', slug: 'thrifted-vintage-jordans', price: 18000, categoryId: sneakers.id, brand: 'Nike', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=800&fit=crop"]', colors: '["Red/Black","White/Black"]', sizes: '["EU 41","EU 42","EU 43","EU 44"]' },
      
      { name: 'Prada Combat Boots', slug: 'prada-combat-boots', price: 135000, categoryId: boots.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop"]', colors: '["Black"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      
      { name: 'Gucci Horsebit Loafers', slug: 'gucci-horsebit-loafers', price: 85000, categoryId: loafers.id, brand: 'Gucci', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop"]', colors: '["Black","Brown"]', sizes: '["EU 39","EU 40","EU 41","EU 42","EU 43","EU 44"]' },
      
      { name: 'Balenciaga Hourglass Bag', slug: 'balenciaga-hourglass-bag', price: 245000, categoryId: bags.id, brand: 'Balenciaga', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop"]', colors: '["Black","White","Red"]', sizes: '["One Size"]' },
      { name: 'Prada Re-Nylon Backpack', slug: 'prada-re-nylon-backpack', price: 165000, categoryId: bags.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop"]', colors: '["Black","Navy"]', sizes: '["One Size"]' },
      { name: 'Gucci Dionysus Bag', slug: 'gucci-dionysus-bag', price: 295000, categoryId: bags.id, brand: 'Gucci', condition: 'NEW', isLimited: true, limitedQty: 5, images: '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop"]', colors: '["Black","Beige"]', sizes: '["One Size"]' },
      
      { name: 'Gucci GG Belt', slug: 'gucci-gg-belt', price: 55000, categoryId: belts.id, brand: 'Gucci', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1553062407-98eeb64c13499?w=600&h=800&fit=crop"]', colors: '["Black","Brown"]', sizes: '["75cm","80cm","85cm","90cm","95cm","100cm"]' },
      { name: 'Prada Re-Nylon Belt', slug: 'prada-re-nylon-belt', price: 35000, categoryId: belts.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1624222247344-550fb60983d2?w=600&h=800&fit=crop"]', colors: '["Black"]', sizes: '["80cm","85cm","90cm","95cm"]' },
      
      { name: 'Gucci Leather Wallet', slug: 'gucci-leather-wallet', price: 38000, categoryId: wallets.id, brand: 'Gucci', condition: 'NEW', images: '["https://images.unsplash.com/photo-1624222247344-550fb60983d2?w=600&h=800&fit=crop"]', colors: '["Black","Brown"]', sizes: '["One Size"]' },
      { name: 'Balenciaga Card Holder', slug: 'balenciaga-card-holder', price: 18000, categoryId: wallets.id, brand: 'Balenciaga', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1624222247344-550fb60983d2?w=600&h=800&fit=crop"]', colors: '["Black","White"]', sizes: '["One Size"]' },
      
      { name: 'Gucci Silk Tie', slug: 'gucci-silk-tie', price: 25000, categoryId: ties.id, brand: 'Gucci', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1589756823695-278bc923a959?w=600&h=800&fit=crop"]', colors: '["Navy","Burgundy","Black"]', sizes: '["One Size"]' },
      { name: 'Graphic Art Tie', slug: 'graphic-art-tie', price: 2500, categoryId: ties.id, brand: 'Other', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1589756823695-278bc923a959?w=600&h=800&fit=crop"]', colors: '["Multicolor","Black","Blue"]', sizes: '["One Size"]' },
      { name: 'Thrifted Vintage Tie Collection', slug: 'thrifted-vintage-tie-collection', price: 2000, categoryId: ties.id, brand: 'Other', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1589756823695-278bc923a959?w=600&h=800&fit=crop"]', colors: '["Various"]', sizes: '["One Size"]' },
      
      { name: 'Chrome Hearts Cross Pendant', slug: 'chrome-hearts-cross-pendant', price: 98000, categoryId: chains.id, brand: 'Chrome Hearts', condition: 'NEW', isLimited: true, limitedQty: 8, featured: true, images: '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop"]', colors: '["Silver"]', sizes: '["One Size"]' },
      { name: 'Custom Name Chain', slug: 'custom-name-chain', price: 12000, categoryId: chains.id, brand: 'Custom', condition: 'CUSTOM', isNew: true, images: '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop"]', colors: '["Gold","Silver"]', sizes: '["16\\"","18\\"","20\\"","22\\""]' },
      
      { name: 'Gucci Square Sunglasses', slug: 'gucci-square-sunglasses', price: 35000, categoryId: sunglasses.id, brand: 'Gucci', condition: 'NEW', featured: true, images: '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop"]', colors: '["Black","Tortoise"]', sizes: '["One Size"]' },
      { name: 'Prada Linea Rossa Sunglasses', slug: 'prada-linea-rossa-sunglasses', price: 32000, categoryId: sunglasses.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop"]', colors: '["Black","White"]', sizes: '["One Size"]' },
      
      { name: 'Prada Re-Nylon Cap', slug: 'prada-re-nylon-cap', price: 42000, categoryId: hats.id, brand: 'Prada', condition: 'NEW', isNew: true, images: '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=800&fit=crop"]', colors: '["Black","White","Navy"]', sizes: '["One Size"]' },
      { name: 'BAPE STA Cap', slug: 'bape-sta-cap', price: 12000, categoryId: hats.id, brand: 'Bape', condition: 'NEW', images: '["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=800&fit=crop"]', colors: '["Black","Navy","Green"]', sizes: '["One Size"]' },
      { name: 'Thrifted Vintage Snapback', slug: 'thrifted-vintage-snapback', price: 3500, categoryId: hats.id, brand: 'Other', condition: 'THRIFTED', images: '["https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=600&h=800&fit=crop"]', colors: '["Various"]', sizes: '["One Size"]' },
    ];

    for (const product of productsData) {
      await db.product.create({ data: { ...product, description: `${product.name} - Premium quality fashion item from Clothing Ctrl.` } });
    }

    // Create community photos
    const communityPhotos = [
      { imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop', username: '@nairobi_style', approved: true },
      { imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop', username: '@kenya_fits', approved: true },
      { imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', username: '@street_ctrl', approved: true },
      { imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop', username: '@fashion_ke', approved: true },
      { imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=400&fit=crop', username: '@ctrl_clothing', approved: true },
      { imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop', username: '@luxury_nairobi', approved: true },
    ];

    for (const photo of communityPhotos) {
      await db.communityPhoto.create({ data: photo });
    }

    // Create next drop
    const dropDate = new Date();
    dropDate.setDate(dropDate.getDate() + 10);
    dropDate.setHours(12, 0, 0, 0);

    await db.nextDrop.create({
      data: {
        name: 'SPRING COLLECTION DROP',
        description: 'New arrivals from top designers. Exclusive pieces from Gucci, Prada, Balenciaga & more.',
        date: dropDate,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
        active: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      products: productsData.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
