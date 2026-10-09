export async function revalidatePublicCatalog(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/revalidate', { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Cache revalidation request failed with status ${response.status}.`);
    }
    return true;
  } catch (error) {
    console.error('Catalog data was saved, but public cache revalidation failed:', error);
    return false;
  }
}
