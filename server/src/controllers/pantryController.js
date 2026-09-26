import { supabase, isMockSupabase, mockDataStore } from '../config/supabase.js';
import { randomUUID } from 'crypto';

export async function getPantryItems(req, res) {
  try {
    const userId = req.user.id;

    if (isMockSupabase) {
      const items = mockDataStore.pantryItems.filter(item => item.user_id === userId);
      return res.json({ success: true, data: items });
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[PantryController] getPantryItems error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch pantry items' });
  }
}

export async function addPantryItem(req, res) {
  try {
    const userId = req.user.id;
    const { itemName, category, isLazyBackup } = req.body;

    if (isMockSupabase) {
      const newItem = {
        id: randomUUID(),
        user_id: userId,
        item_name: itemName,
        category,
        is_lazy_backup: Boolean(isLazyBackup),
        created_at: new Date().toISOString()
      };
      mockDataStore.pantryItems.unshift(newItem);
      return res.status(201).json({ success: true, data: newItem });
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .insert({
        user_id: userId,
        item_name: itemName,
        category,
        is_lazy_backup: Boolean(isLazyBackup)
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[PantryController] addPantryItem error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to add pantry item' });
  }
}

export async function deletePantryItem(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isMockSupabase) {
      const index = mockDataStore.pantryItems.findIndex(i => i.id === id && i.user_id === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Pantry item not found' });
      }
      mockDataStore.pantryItems.splice(index, 1);
      return res.json({ success: true, message: 'Item deleted successfully' });
    }

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('[PantryController] deletePantryItem error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete pantry item' });
  }
}

export async function toggleLazyBackup(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isMockSupabase) {
      const item = mockDataStore.pantryItems.find(i => i.id === id && i.user_id === userId);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Pantry item not found' });
      }
      item.is_lazy_backup = !item.is_lazy_backup;
      return res.json({ success: true, data: item });
    }

    // First fetch current status
    const { data: existing, error: fetchErr } = await supabase
      .from('pantry_items')
      .select('is_lazy_backup')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ success: false, error: 'Pantry item not found' });
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .update({ is_lazy_backup: !existing.is_lazy_backup })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error('[PantryController] toggleLazyBackup error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to toggle lazy backup' });
  }
}
