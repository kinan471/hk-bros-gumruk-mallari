import { createClient } from '@/lib/supabase/server';

interface CheckoutItem {
  id: string;
  quantity: number;
}

interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  items: CheckoutItem[];
}

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  condition: string | null;
}

function isCheckoutPayload(value: unknown): value is CheckoutPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Record<string, unknown>;
  if (
    typeof payload.customerName !== 'string' ||
    typeof payload.customerPhone !== 'string' ||
    typeof payload.customerAddress !== 'string' ||
    (payload.customerNotes !== undefined && typeof payload.customerNotes !== 'string') ||
    !Array.isArray(payload.items) ||
    payload.items.length === 0 ||
    payload.items.length > 50
  ) {
    return false;
  }

  return payload.items.every((item: unknown) => {
    if (!item || typeof item !== 'object') return false;
    const checkoutItem = item as Record<string, unknown>;
    return (
      typeof checkoutItem.id === 'string' &&
      checkoutItem.id.length > 0 &&
      checkoutItem.id.length <= 64 &&
      typeof checkoutItem.quantity === 'number' &&
      Number.isInteger(checkoutItem.quantity) &&
      checkoutItem.quantity > 0 &&
      checkoutItem.quantity <= 99
    );
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'İstek içeriği geçersiz.' }, { status: 400 });
  }

  if (!isCheckoutPayload(payload)) {
    return Response.json({ error: 'Sipariş bilgileri eksik veya geçersiz.' }, { status: 400 });
  }

  const customerName = payload.customerName.trim();
  const customerPhone = payload.customerPhone.trim();
  const customerAddress = payload.customerAddress.trim();
  const customerNotes = payload.customerNotes?.trim() ?? '';
  const phoneDigits = customerPhone.replace(/\D/g, '');

  if (
    customerName.length < 2 ||
    customerName.length > 120 ||
    phoneDigits.length < 7 ||
    customerPhone.length > 30 ||
    customerAddress.length < 8 ||
    customerAddress.length > 1000 ||
    customerNotes.length > 1000
  ) {
    return Response.json({ error: 'Lütfen teslimat bilgilerinizi kontrol edin.' }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  for (const item of payload.items) {
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 99)) {
    return Response.json({ error: 'Her ürün için en fazla 99 adet sipariş verilebilir.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, regular_price, sale_price, product_condition, is_active, track_inventory, stock_quantity, stock_status')
    .in('id', [...quantities.keys()])
    .eq('is_active', true);

  if (productsError) {
    console.error('Checkout product lookup failed:', productsError);
    return Response.json({ error: 'Ürünler doğrulanamadı. Lütfen tekrar deneyin.' }, { status: 500 });
  }

  if (!products || products.length !== quantities.size) {
    return Response.json({ error: 'Bir veya daha fazla ürün artık mevcut değil.' }, { status: 409 });
  }

  const orderItems: OrderItem[] = [];
  for (const product of products) {
    const quantity = quantities.get(product.id);
    if (quantity === undefined) {
      console.error('Checkout product quantity was missing:', product.id);
      return Response.json({ error: 'Sipariş miktarı doğrulanamadı.' }, { status: 500 });
    }
    if (
      product.track_inventory === true &&
      (product.stock_status === 'out_of_stock' ||
        (product.stock_status !== 'pre_order' && quantity > (product.stock_quantity ?? 0)))
    ) {
      return Response.json(
        { error: `${product.name} için yeterli stok bulunmuyor.` },
        { status: 409 }
      );
    }

    const regularPrice = product.regular_price;
    if (typeof regularPrice !== 'number' || !Number.isFinite(regularPrice) || regularPrice < 0) {
      console.error('Checkout encountered an invalid product price:', product.id);
      return Response.json({ error: 'Bir ürünün fiyatı şu anda alınamıyor.' }, { status: 500 });
    }

    const salePrice = product.sale_price;
    const currentPrice =
      typeof salePrice === 'number' && Number.isFinite(salePrice) && salePrice >= 0 && salePrice < regularPrice
        ? salePrice
        : regularPrice;
    const price = Math.round(currentPrice * 100) / 100;

    orderItems.push({
      product_id: product.id,
      name: product.name,
      quantity,
      price,
      condition: product.product_condition,
    });
  }

  const subtotalCents = orderItems.reduce(
    (total, item) => total + Math.round(item.price * 100) * item.quantity,
    0
  );
  const subtotal = subtotalCents / 100;
  const shippingCost = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shippingCost;
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { error: orderError } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    items: orderItems,
    total_amount: total,
    shipping_cost: shippingCost,
    subtotal,
    status: 'pending',
    payment_status: 'pending',
    source: 'website',
    notes: customerNotes || null,
  });

  if (orderError) {
    console.error('Order save failed:', orderError);
    return Response.json({ error: 'Sipariş kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 });
  }

  return Response.json({ orderNumber, items: orderItems, subtotal, shippingCost, total });
}
