import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Admin revalidation authentication failed:', error);
    return Response.json({ error: 'Unable to verify admin access.' }, { status: 401 });
  }

  if (!user || user.user_metadata?.role !== 'admin') {
    return Response.json({ error: 'Admin access is required.' }, { status: 403 });
  }

  revalidatePath('/', 'page');
  revalidatePath('/products', 'page');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/category/[slug]', 'page');
  revalidateTag('product-search', 'max');

  return Response.json({ revalidated: true });
}
