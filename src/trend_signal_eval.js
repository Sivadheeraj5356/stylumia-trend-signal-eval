const CHANNELS = ['search', 'social', 'commerce', 'image'];

export function validateSignal(signal) {
  const errors = [];
  if (!signal || typeof signal !== 'object') return ['signal must be an object'];
  if (!signal.trend) errors.push('trend is required');
  if (!Array.isArray(signal.observations) || signal.observations.length === 0) errors.push('at least one observation is required');
  const channels = new Set();
  for (const [index, observation] of (signal.observations || []).entries()) {
    if (!CHANNELS.includes(observation.channel)) errors.push(`observations[${index}].channel is unsupported`);
    if (typeof observation.deltaPct !== 'number') errors.push(`observations[${index}].deltaPct must be numeric`);
    if (!observation.windowDays || observation.windowDays < 1) errors.push(`observations[${index}].windowDays must be positive`);
    channels.add(observation.channel);
  }
  if (channels.size < 2) errors.push('at least two evidence channels are required');
  return errors;
}

export function scoreSignal(signal) {
  const errors = validateSignal(signal);
  const observations = signal.observations || [];
  const averageDelta = observations.reduce((sum, observation) => sum + observation.deltaPct, 0) / (observations.length || 1);
  const confidence = errors.length ? 'reject' : averageDelta >= 20 ? 'high' : averageDelta >= 5 ? 'medium' : 'low';
  return { confidence, ready: confidence === 'high' || confidence === 'medium', errors, metrics: { observations: observations.length, channels: new Set(observations.map((observation) => observation.channel)).size, averageDelta: Number(averageDelta.toFixed(2)) } };
}
