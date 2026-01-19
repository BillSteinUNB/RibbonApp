/**
 * Deep merge utility for nested object updates
 */

/**
 * Check if value is an object (not array)
 */
function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge multiple objects
 * Later objects override earlier ones
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key] || !isObject(target[key])) {
          (target[key] as Record<string, unknown>) = {};
        }
        deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>);
      } else {
        (target[key] as any) = source[key];
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Shallow clone an object
 */
export function shallowClone<T extends Record<string, any>>(obj: T): T {
  return { ...obj };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const clonedObj = {} as Record<string, unknown>;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj as T;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }

  return result;
}