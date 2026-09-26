import app from './src/server.js';
import http from 'http';

const PORT = 5099;
const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Runner] Test server listening on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api`;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-mock-token'
  };

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // Test 1: Health check
  await test('GET /api/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'healthy') {
      throw new Error(`Unexpected health response: ${JSON.stringify(data)}`);
    }
  });

  // Test 2: Pantry List
  let testItemId = null;
  await test('GET /api/pantry returns items array', async () => {
    const res = await fetch(`${baseUrl}/pantry`, { headers: authHeaders });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(`Pantry fetch failed: ${JSON.stringify(data)}`);
    }
  });

  // Test 3: Add Pantry Item
  await test('POST /api/pantry creates new staple item', async () => {
    const payload = {
      itemName: 'Organic Canned Cannellini Beans',
      category: 'canned',
      isLazyBackup: true
    };
    const res = await fetch(`${baseUrl}/pantry`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success || !data.data?.id) {
      throw new Error(`Add item failed: ${JSON.stringify(data)}`);
    }
    testItemId = data.data.id;
  });

  // Test 4: Zod Validation rejection on Pantry Item
  await test('POST /api/pantry rejects invalid category with 400', async () => {
    const payload = {
      itemName: 'Invalid Item',
      category: 'junk-category-not-allowed'
    };
    const res = await fetch(`${baseUrl}/pantry`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // Test 5: Toggle Lazy Backup
  await test('PATCH /api/pantry/:id/toggle-backup updates backup flag', async () => {
    if (!testItemId) throw new Error('No testItemId');
    const res = await fetch(`${baseUrl}/pantry/${testItemId}/toggle-backup`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const data = await res.json();
    if (!data.success || data.data.is_lazy_backup !== false) {
      throw new Error(`Toggle backup failed: ${JSON.stringify(data)}`);
    }
  });

  // Test 6: Delete Pantry Item
  await test('DELETE /api/pantry/:id deletes the created item', async () => {
    if (!testItemId) throw new Error('No testItemId');
    const res = await fetch(`${baseUrl}/pantry/${testItemId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Delete item failed: ${JSON.stringify(data)}`);
    }
  });

  // Test 7: Get Planner
  await test('GET /api/planner returns 7 anchor themes and current plan', async () => {
    const res = await fetch(`${baseUrl}/planner`, { headers: authHeaders });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data.themes) || data.data.themes.length < 7) {
      throw new Error(`Planner themes missing or incomplete: ${JSON.stringify(data)}`);
    }
  });

  // Test 8: Save Weekly Plan (Rule of Three)
  await test('POST /api/planner saves 3-idea core dinner plan', async () => {
    const payload = {
      weekStartDate: '2026-09-28',
      mealIdeas: [
        '10-Minute Soy Garlic Veggie Ramen',
        'Soft Scrambled Eggs with Sourdough',
        'One-Pot Tomato Chickpea Skillet'
      ],
      isCompleted: false
    };
    const res = await fetch(`${baseUrl}/planner`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success || data.data.meal_ideas?.length !== 3) {
      throw new Error(`Save plan failed: ${JSON.stringify(data)}`);
    }
  });

  // Test 9: AI Generate Meal (Panic Mode)
  await test('POST /api/ai/generate-meal returns structured recipe under time limit', async () => {
    const payload = {
      ingredients: ['Eggs', 'Buttered Bread', 'Cheddar Cheese', 'Baby Spinach'],
      timeLimit: 15,
      energyLevel: 'Low'
    };
    const res = await fetch(`${baseUrl}/ai/generate-meal`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(`AI generation failed: ${JSON.stringify(data)}`);
    }
    const recipe = data.data;
    if (!recipe.title || !recipe.prepTimeMinutes || !Array.isArray(recipe.steps) || !recipe.encouragementNote) {
      throw new Error(`Recipe missing mandatory fields: ${JSON.stringify(recipe)}`);
    }
    if (recipe.prepTimeMinutes > 15) {
      throw new Error(`Recipe exceeded 15 minute anti-fatigue constraint: ${recipe.prepTimeMinutes} mins`);
    }
    console.log(`   Generated Recipe: "${recipe.title}" (${recipe.prepTimeMinutes} mins)`);
  });

  console.log(`\n================================`);
  console.log(`Test Results: ${passed}/${total} PASSED`);
  console.log(`================================\n`);

  server.close(() => {
    process.exit(passed === total ? 0 : 1);
  });
}

runTests().catch(err => {
  console.error('[Fatal Test Error]', err);
  server.close(() => process.exit(1));
});
