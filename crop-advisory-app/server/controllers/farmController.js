import { supabase, isLiveSupabase, memoryStore } from '../config/supabase.js';
import { farmInputSchema } from '../schemas/advisorySchema.js';
import crypto from 'crypto';

export const getFarms = async (req, res) => {
  try {
    const userId = req.user.id;

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ farms: data || [] });
    }

    // In-memory demo fallback
    const farms = Array.from(memoryStore.farms.values())
      .filter(f => f.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ farms });
  } catch (err) {
    console.error('Error in getFarms:', err);
    res.status(500).json({ error: 'Failed to retrieve farms', message: err.message });
  }
};

export const getFarmById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Farm not found' });
      }
      return res.json({ farm: data });
    }

    const farm = memoryStore.farms.get(id);
    if (!farm || farm.user_id !== userId) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    res.json({ farm });
  } catch (err) {
    console.error('Error in getFarmById:', err);
    res.status(500).json({ error: 'Failed to retrieve farm', message: err.message });
  }
};

export const createFarm = async (req, res) => {
  try {
    const parsed = farmInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
      });
    }

    const { name, location, size_acres, soil_type } = parsed.data;
    const userId = req.user.id;

    if (isLiveSupabase) {
      const { data, error } = await supabase
        .from('farms')
        .insert([{
          user_id: userId,
          name,
          location,
          size_acres: parseFloat(size_acres),
          soil_type
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ message: 'Farm registered successfully', farm: data });
    }

    // In-memory demo mode
    const newFarm = {
      id: `farm-${crypto.randomUUID().slice(0, 8)}`,
      user_id: userId,
      name,
      location,
      size_acres: parseFloat(size_acres),
      soil_type,
      created_at: new Date().toISOString()
    };

    memoryStore.farms.set(newFarm.id, newFarm);
    res.status(201).json({ message: 'Farm registered successfully (demo)', farm: newFarm });
  } catch (err) {
    console.error('Error in createFarm:', err);
    res.status(500).json({ error: 'Failed to create farm', message: err.message });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isLiveSupabase) {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return res.json({ message: 'Farm deleted successfully' });
    }

    const farm = memoryStore.farms.get(id);
    if (!farm || farm.user_id !== userId) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    memoryStore.farms.delete(id);
    res.json({ message: 'Farm deleted successfully' });
  } catch (err) {
    console.error('Error in deleteFarm:', err);
    res.status(500).json({ error: 'Failed to delete farm', message: err.message });
  }
};
