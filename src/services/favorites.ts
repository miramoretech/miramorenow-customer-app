import { supabase } from '@/lib/supabase';

export const favoritesService = {
  async addFavorite(userId: string, menuItemId: string) {
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, menu_item_id: menuItemId });
    if (error) throw error;
  },
  async removeFavorite(userId: string, menuItemId: string) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);
    if (error) throw error;
  },
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        menu_item_id,
        menu_items (
          id, name, description, price, image_url,
          vendor:vendor_id ( store_name )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data?.map(fav => fav.menu_items) || [];
  },
  async isFavorite(userId: string, menuItemId: string) {
    const { count, error } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);
    if (error) throw error;
    return count > 0;
  }
};