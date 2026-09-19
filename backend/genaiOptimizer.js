/**
 * FinOpsGuard GenAI Cost Optimizer & Antigravity Integration Module
 * 
 * Parses Antigravity IDE transcript logs to track real LLM token usage,
 * generates mock multi-model GenAI usage data, and computes optimization
 * recommendations (model cascading, context caching, prompt compression).
 * 
 * SECURITY: This module reads local filesystem logs. The transcript path
 * is validated against a strict allowlist pattern to prevent path traversal.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, normalize } from 'path';

// ─── Pricing Models (per 1M tokens, USD) ──────────────────────────────────
const MODEL_PRICING = {
  'gemini-3.1-pro': { input: 1.25, output: 10.00, displayName: 'Gemini 3.1 Pro', provider: 'Google', color: '#4285F4' },
  'gemini-2.5-flash': { input: 0.15, output: 0.60, displayName: 'Gemini 2.5 Flash', provider: 'Google', color: '#34A853' },
  'claude-3.5-sonnet': { input: 3.00, output: 15.00, displayName: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: '#D97706' },
  'claude-3.5-haiku': { input: 0.80, output: 4.00, displayName: 'Claude 3.5 Haiku', provider: 'Anthropic', color: '#F59E0B' },
  'gpt-4o': { input: 2.50, output: 10.00, displayName: 'GPT-4o', provider: 'OpenAI', color: '#10B981' },
  'gpt-4o-mini': { input: 0.15, output: 0.60, displayName: 'GPT-4o Mini', provider: 'OpenAI', color: '#6EE7B7' },
  'bedrock-claude': { input: 3.00, output: 15.00, displayName: 'Bedrock Claude 3.5', provider: 'AWS', color: '#FF9900' },
};

// ─── Security: Validate and sanitize transcript path ──────────────────────
const ALLOWED_BASE_PATH = normalize(join(process.env.USERPROFILE || process.env.HOME || '', '.gemini', 'antigravity-ide', 'brain'));

function isPathSafe(targetPath) {
  const normalized = resolve(normalize(targetPath));
  return normalized.startsWith(resolve(ALLOWED_BASE_PATH));
}

// ─── Antigravity Transcript Parser ────────────────────────────────────────

/**
 * Discovers the most recent Antigravity conversation directories.
 * SECURITY: Only reads from the validated .gemini/antigravity-ide/brain/ path.
 */
function discoverConversations(maxCount = 5) {
  if (!existsSync(ALLOWED_BASE_PATH)) {
    return [];
  }

  try {
    const entries = readdirSync(ALLOWED_BASE_PATH, { withFileTypes: true });
    const conversations = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      // UUID pattern validation for conversation IDs
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.name)) continue;

      const logPath = join(ALLOWED_BASE_PATH, entry.name, '.system_generated', 'logs', 'transcript.jsonl');
      if (!isPathSafe(logPath)) continue;

      if (existsSync(logPath)) {
        const stat = statSync(logPath);
        conversations.push({
          id: entry.name,
          logPath,
          lastModified: stat.mtime,
          sizeBytes: stat.size,
        });
      }
    }

    // Sort by most recent first
    conversations.sort((a, b) => b.lastModified - a.lastModified);
    return conversations.slice(0, maxCount);
  } catch {
    return [];
  }
}

/**
 * Parses a single Antigravity transcript JSONL file and extracts token estimates.
 * Token estimation: characters / 4 (standard GPT tokenizer approximation).
 * SECURITY: File content is parsed line-by-line, never eval'd.
 */
function parseTranscript(logPath) {
  if (!isPathSafe(logPath)) {
    throw new Error('Security: Path traversal blocked');
  }

  const content = readFileSync(logPath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  let totalInputChars = 0;
  let totalOutputChars = 0;
  let stepCount = 0;
  let toolCallCount = 0;
  let userMessages = 0;
  let modelResponses = 0;
  const modelUsage = {};

  for (const line of lines) {
    let step;
    try {
      step = JSON.parse(line);
    } catch {
      continue; // Skip malformed lines
    }

    stepCount++;

    if (step.type === 'USER_INPUT') {
      userMessages++;
      const inputLen = (step.content || '').length;
      totalInputChars += inputLen;
    }

    if (step.type === 'PLANNER_RESPONSE' || step.source === 'MODEL') {
      modelResponses++;
      const outputLen = (step.content || '').length;
      totalOutputChars += outputLen;

      // Extract model name if available
      const model = step.model || 'gemini-3.1-pro'; // Default assumption
      if (!modelUsage[model]) {
        modelUsage[model] = { inputTokens: 0, outputTokens: 0, calls: 0 };
      }
      modelUsage[model].outputTokens += Math.ceil(outputLen / 4);
      modelUsage[model].calls++;
    }

    if (step.tool_calls && Array.isArray(step.tool_calls)) {
      toolCallCount += step.tool_calls.length;
    }
  }

  // Estimate tokens (chars / 4)
  const estimatedInputTokens = Math.ceil(totalInputChars / 4);
  const estimatedOutputTokens = Math.ceil(totalOutputChars / 4);

  // Default model attribution if none detected
  if (Object.keys(modelUsage).length === 0) {
    modelUsage['gemini-3.1-pro'] = {
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      calls: modelResponses
    };
  }

  // Distribute input tokens across model usage proportionally
  const totalModelOutputTokens = Object.values(modelUsage).reduce((s, m) => s + m.outputTokens, 0);
  for (const model of Object.keys(modelUsage)) {
    const proportion = totalModelOutputTokens > 0
      ? modelUsage[model].outputTokens / totalModelOutputTokens
      : 1 / Object.keys(modelUsage).length;
    modelUsage[model].inputTokens = Math.ceil(estimatedInputTokens * proportion);
  }

  return {
    stepCount,
    userMessages,
    modelResponses,
    toolCallCount,
    estimatedInputTokens,
    estimatedOutputTokens,
    totalEstimatedTokens: estimatedInputTokens + estimatedOutputTokens,
    modelUsage,
    lineCount: lines.length,
  };
}

/**
 * Calculates cost for a parsed transcript using the pricing model.
 */
function calculateTranscriptCost(parsed) {
  let totalCost = 0;
  const costBreakdown = {};

  for (const [modelKey, usage] of Object.entries(parsed.modelUsage)) {
    const pricing = MODEL_PRICING[modelKey] || MODEL_PRICING['gemini-3.1-pro'];
    const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
    const modelCost = inputCost + outputCost;
    totalCost += modelCost;

    costBreakdown[modelKey] = {
      displayName: pricing.displayName,
      provider: pricing.provider,
      color: pricing.color,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      inputCost: parseFloat(inputCost.toFixed(4)),
      outputCost: parseFloat(outputCost.toFixed(4)),
      totalCost: parseFloat(modelCost.toFixed(4)),
      calls: usage.calls
    };
  }

  return {
    totalCost: parseFloat(totalCost.toFixed(4)),
    costBreakdown,
  };
}

// ─── Mock GenAI Usage Data Generator ──────────────────────────────────────

function generateMockUsageData() {
  const now = new Date();
  const dailyUsage = [];

  // Generate 30 days of mock multi-model usage
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate realistic usage patterns (weekdays higher, weekends lower)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? 0.3 : (0.8 + Math.random() * 0.4);

    dailyUsage.push({
      date: dateStr,
      models: {
        'gemini-3.1-pro': {
          inputTokens: Math.floor(450000 * multiplier + Math.random() * 120000),
          outputTokens: Math.floor(280000 * multiplier + Math.random() * 80000),
          requests: Math.floor(85 * multiplier + Math.random() * 30),
        },
        'gemini-2.5-flash': {
          inputTokens: Math.floor(180000 * multiplier + Math.random() * 50000),
          outputTokens: Math.floor(95000 * multiplier + Math.random() * 30000),
          requests: Math.floor(220 * multiplier + Math.random() * 60),
        },
        'claude-3.5-sonnet': {
          inputTokens: Math.floor(320000 * multiplier + Math.random() * 90000),
          outputTokens: Math.floor(190000 * multiplier + Math.random() * 60000),
          requests: Math.floor(45 * multiplier + Math.random() * 20),
        },
        'bedrock-claude': {
          inputTokens: Math.floor(210000 * multiplier + Math.random() * 70000),
          outputTokens: Math.floor(130000 * multiplier + Math.random() * 40000),
          requests: Math.floor(35 * multiplier + Math.random() * 15),
        },
        'gpt-4o': {
          inputTokens: Math.floor(150000 * multiplier + Math.random() * 50000),
          outputTokens: Math.floor(95000 * multiplier + Math.random() * 30000),
          requests: Math.floor(30 * multiplier + Math.random() * 10),
        },
      }
    });
  }

  // Aggregate monthly totals
  const monthlyTotals = {};
  for (const day of dailyUsage) {
    for (const [model, usage] of Object.entries(day.models)) {
      if (!monthlyTotals[model]) {
        monthlyTotals[model] = { inputTokens: 0, outputTokens: 0, requests: 0, cost: 0 };
      }
      monthlyTotals[model].inputTokens += usage.inputTokens;
      monthlyTotals[model].outputTokens += usage.outputTokens;
      monthlyTotals[model].requests += usage.requests;

      const pricing = MODEL_PRICING[model];
      if (pricing) {
        monthlyTotals[model].cost += (usage.inputTokens / 1_000_000) * pricing.input
          + (usage.outputTokens / 1_000_000) * pricing.output;
      }
    }
  }

  // Round costs
  for (const model of Object.keys(monthlyTotals)) {
    monthlyTotals[model].cost = parseFloat(monthlyTotals[model].cost.toFixed(2));
    monthlyTotals[model].displayName = MODEL_PRICING[model]?.displayName || model;
    monthlyTotals[model].provider = MODEL_PRICING[model]?.provider || 'Unknown';
    monthlyTotals[model].color = MODEL_PRICING[model]?.color || '#888';
  }

  const totalMonthlyCost = Object.values(monthlyTotals).reduce((s, m) => s + m.cost, 0);

  return {
    dailyUsage,
    monthlyTotals,
    totalMonthlyCost: parseFloat(totalMonthlyCost.toFixed(2)),
    activeModels: Object.keys(monthlyTotals).length,
    period: {
      start: dailyUsage[0]?.date,
      end: dailyUsage[dailyUsage.length - 1]?.date,
    }
  };
}

// ─── Optimization Engine ──────────────────────────────────────────────────

function computeOptimizations(usageData) {
  const { monthlyTotals, totalMonthlyCost } = usageData;

  const optimizations = [];
  let totalProjectedSavings = 0;

  // 1. Model Cascading: Route simple queries from Pro → Flash
  const proUsage = monthlyTotals['gemini-3.1-pro'];
  if (proUsage) {
    const cascadeRatio = 0.70; // 70% of Pro queries can be routed to Flash
    const proInputCost = (proUsage.inputTokens / 1_000_000) * MODEL_PRICING['gemini-3.1-pro'].input;
    const proOutputCost = (proUsage.outputTokens / 1_000_000) * MODEL_PRICING['gemini-3.1-pro'].output;
    const proCost = proInputCost + proOutputCost;

    const flashInputCost = (proUsage.inputTokens * cascadeRatio / 1_000_000) * MODEL_PRICING['gemini-2.5-flash'].input;
    const flashOutputCost = (proUsage.outputTokens * cascadeRatio / 1_000_000) * MODEL_PRICING['gemini-2.5-flash'].output;
    const cascadedCost = flashInputCost + flashOutputCost + proCost * (1 - cascadeRatio);

    const savings = proCost - cascadedCost;
    totalProjectedSavings += savings;

    optimizations.push({
      id: 'model-cascading',
      title: 'Model Cascading (Pro → Flash)',
      description: 'Route 70% of simple queries from Gemini Pro ($1.25/$10) to Gemini Flash ($0.15/$0.60). Complex reasoning tasks remain on Pro.',
      icon: 'Zap',
      currentCost: parseFloat(proCost.toFixed(2)),
      optimizedCost: parseFloat(cascadedCost.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      savingsPercent: parseFloat(((savings / proCost) * 100).toFixed(1)),
      impact: 'high',
      effort: 'medium',
      strategy: 'Implement a prompt classifier that routes queries by complexity score. Queries with < 200 output tokens or simple lookups go to Flash.',
    });
  }

  // 2. Context Caching: Cache repeated system prompts
  const totalInputTokens = Object.values(monthlyTotals).reduce((s, m) => s + m.inputTokens, 0);
  const cacheableRatio = 0.40; // 40% of input tokens are repeated system/context
  const cacheSavingsRatio = 0.60; // Caching saves 60% on cacheable tokens
  const avgInputCostPerToken = totalMonthlyCost > 0
    ? (Object.values(monthlyTotals).reduce((s, m) => s + (m.inputTokens / 1_000_000) * (MODEL_PRICING[Object.keys(monthlyTotals).find(k => monthlyTotals[k] === m)]?.input || 1.25), 0))
    : 0;
  const contextCacheSavings = avgInputCostPerToken * cacheableRatio * cacheSavingsRatio;
  totalProjectedSavings += contextCacheSavings;

  optimizations.push({
    id: 'context-caching',
    title: 'Context Caching (System Prompts)',
    description: 'Cache recurring system prompts, tool definitions, and code context. Gemini API supports explicit context caching with 75% discount on cached tokens.',
    icon: 'Database',
    currentCost: parseFloat(avgInputCostPerToken.toFixed(2)),
    optimizedCost: parseFloat((avgInputCostPerToken - contextCacheSavings).toFixed(2)),
    savings: parseFloat(contextCacheSavings.toFixed(2)),
    savingsPercent: parseFloat(((contextCacheSavings / (avgInputCostPerToken || 1)) * 100).toFixed(1)),
    impact: 'high',
    effort: 'low',
    strategy: 'Enable Gemini context caching API for system prompts > 32K tokens. Set TTL to 1 hour for development sessions.',
  });

  // 3. Prompt Compression: Reduce average prompt length
  const compressionRatio = 0.30; // 30% reduction in prompt length
  const promptCompressionSavings = totalMonthlyCost * 0.12; // ~12% overall cost reduction
  totalProjectedSavings += promptCompressionSavings;

  optimizations.push({
    id: 'prompt-compression',
    title: 'Prompt Compression & Optimization',
    description: 'Reduce average prompt length by 30% using structured prompts, removing redundant context, and using reference IDs instead of full content.',
    icon: 'FileText',
    currentCost: parseFloat(totalMonthlyCost.toFixed(2)),
    optimizedCost: parseFloat((totalMonthlyCost - promptCompressionSavings).toFixed(2)),
    savings: parseFloat(promptCompressionSavings.toFixed(2)),
    savingsPercent: 12.0,
    impact: 'medium',
    effort: 'medium',
    strategy: 'Implement structured prompt templates with variable injection. Use file hashes instead of full file contents for context.',
  });

  // 4. Batch Processing: Aggregate non-urgent requests
  const batchSavingsRatio = 0.15;
  const batchSavings = totalMonthlyCost * batchSavingsRatio * 0.5; // 50% of traffic is batchable
  totalProjectedSavings += batchSavings;

  optimizations.push({
    id: 'batch-processing',
    title: 'Batch Processing (Non-Urgent Requests)',
    description: 'Aggregate non-urgent analysis, documentation, and reporting tasks into batch API calls. Google offers 50% discount on batch Gemini API.',
    icon: 'Layers',
    currentCost: parseFloat((totalMonthlyCost * 0.5).toFixed(2)),
    optimizedCost: parseFloat(((totalMonthlyCost * 0.5) - batchSavings).toFixed(2)),
    savings: parseFloat(batchSavings.toFixed(2)),
    savingsPercent: parseFloat(((batchSavings / (totalMonthlyCost * 0.5 || 1)) * 100).toFixed(1)),
    impact: 'medium',
    effort: 'high',
    strategy: 'Queue non-interactive requests (code reviews, documentation generation, test suggestions) and submit as batch jobs during off-peak hours.',
  });

  return {
    optimizations,
    totalProjectedSavings: parseFloat(totalProjectedSavings.toFixed(2)),
    totalCurrentCost: parseFloat(totalMonthlyCost.toFixed(2)),
    optimizedCost: parseFloat((totalMonthlyCost - totalProjectedSavings).toFixed(2)),
    savingsPercent: parseFloat(((totalProjectedSavings / (totalMonthlyCost || 1)) * 100).toFixed(1)),
  };
}

// ─── Exported API Handlers ────────────────────────────────────────────────

/**
 * GET /api/genai/usage
 * Returns GenAI usage analytics with mock multi-model data.
 */
export function getGenAIUsage(req, res) {
  try {
    const usageData = generateMockUsageData();
    const optimizationResults = computeOptimizations(usageData);

    res.json({
      status: 'success',
      usage: usageData,
      optimizations: optimizationResults,
      pricing: MODEL_PRICING,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate GenAI usage data', details: err.message });
  }
}

/**
 * GET /api/genai/antigravity
 * Parses the current and recent Antigravity IDE transcripts for real token spend.
 * SECURITY: Only reads from validated local .gemini paths. No user-supplied paths accepted.
 */
export function getAntigravityUsage(req, res) {
  try {
    const conversations = discoverConversations(5);

    if (conversations.length === 0) {
      return res.json({
        status: 'success',
        message: 'No Antigravity transcripts found',
        sessions: [],
        aggregate: { totalTokens: 0, totalCost: 0, sessionCount: 0 },
      });
    }

    const sessions = [];
    let aggregateTokens = 0;
    let aggregateCost = 0;

    for (const conv of conversations) {
      try {
        const parsed = parseTranscript(conv.logPath);
        const costed = calculateTranscriptCost(parsed);

        aggregateTokens += parsed.totalEstimatedTokens;
        aggregateCost += costed.totalCost;

        sessions.push({
          conversationId: conv.id,
          lastModified: conv.lastModified.toISOString(),
          sizeBytes: conv.sizeBytes,
          ...parsed,
          ...costed,
        });
      } catch {
        // Skip unreadable transcripts silently
        continue;
      }
    }

    res.json({
      status: 'success',
      sessions,
      aggregate: {
        totalTokens: aggregateTokens,
        totalCost: parseFloat(aggregateCost.toFixed(4)),
        sessionCount: sessions.length,
        averageCostPerSession: parseFloat((aggregateCost / (sessions.length || 1)).toFixed(4)),
      },
      basePath: ALLOWED_BASE_PATH, // Safe to expose — it's the user's own machine
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse Antigravity transcripts', details: err.message });
  }
}

/**
 * POST /api/genai/optimize
 * Runs the full optimization engine and returns recommendations with projected savings.
 */
export function runGenAIOptimizer(req, res) {
  try {
    const usageData = generateMockUsageData();
    const optimizations = computeOptimizations(usageData);

    // Also include live Antigravity data if available
    const conversations = discoverConversations(3);
    let antigravityInsight = null;

    if (conversations.length > 0) {
      try {
        const latestParsed = parseTranscript(conversations[0].logPath);
        const latestCosted = calculateTranscriptCost(latestParsed);
        antigravityInsight = {
          currentSessionCost: latestCosted.totalCost,
          currentSessionTokens: latestParsed.totalEstimatedTokens,
          recommendation: latestParsed.estimatedOutputTokens > latestParsed.estimatedInputTokens * 2
            ? 'High output-to-input ratio detected. Consider using structured output formats to reduce verbosity.'
            : 'Token usage is balanced. Consider enabling context caching for repeated system prompts.',
        };
      } catch {
        // Continue without Antigravity insight
      }
    }

    res.json({
      status: 'success',
      ...optimizations,
      antigravityInsight,
      executedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Optimization engine failed', details: err.message });
  }
}
