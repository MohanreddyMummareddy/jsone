/**
 * JSON Schema Validation Module
 * Validate JSON objects against a schema
 * Supports basic JSON Schema draft 7 features
 */

export interface ValidationResult {
  valid: boolean;
  errors: SchemaError[];
}

export interface SchemaError {
  path: string;
  message: string;
  keyword: string;
  value?: any;
}

export interface JsonSchema {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: any[];
  default?: any;
  additionalProperties?: boolean | JsonSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  const?: any;
  [key: string]: any;
}

/**
 * Validate JSON against schema
 */
export function validate(jsonStr: string, schemaStr: string): ValidationResult {
  try {
    const obj = JSON.parse(jsonStr);
    const schema = JSON.parse(schemaStr);
    
    const errors: SchemaError[] = [];
    validateValue(obj, schema, '', errors);
    
    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (e) {
    return {
      valid: false,
      errors: [
        {
          path: '$',
          message: e instanceof Error ? e.message : String(e),
          keyword: 'parse',
        },
      ],
    };
  }
}

/**
 * Get schema from JSON object (infer schema)
 */
export function inferSchema(jsonStr: string): { success: boolean; schema: JsonSchema; error?: string } {
  try {
    const obj = JSON.parse(jsonStr);
    const schema = inferSchemaFromValue(obj);
    
    return { success: true, schema };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { success: false, schema: {}, error };
  }
}

/**
 * Recursively validate value against schema
 */
function validateValue(value: any, schema: JsonSchema, path: string, errors: SchemaError[]): void {
  if (!schema || typeof schema !== 'object') {
    return;
  }

  // Check type
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!isValidType(value, types)) {
      const expectedType = types.join(' or ');
      const actualType = typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'object') : typeof value;
      errors.push({
        path: path || '$',
        message: `Expected ${expectedType}, got ${actualType}`,
        keyword: 'type',
        value,
      });
      return; // Skip further validation if type is wrong
    }
  }

  // Check const
  if ('const' in schema && value !== schema.const) {
    errors.push({
      path: path || '$',
      message: `Value must be ${JSON.stringify(schema.const)}`,
      keyword: 'const',
      value,
    });
  }

  // Check enum
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({
      path: path || '$',
      message: `Value must be one of: ${schema.enum.map(v => JSON.stringify(v)).join(', ')}`,
      keyword: 'enum',
      value,
    });
  }

  // String validations
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path: path || '$',
        message: `String length must be at least ${schema.minLength}`,
        keyword: 'minLength',
        value,
      });
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        path: path || '$',
        message: `String length must not exceed ${schema.maxLength}`,
        keyword: 'maxLength',
        value,
      });
    }

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          path: path || '$',
          message: `String does not match pattern ${schema.pattern}`,
          keyword: 'pattern',
          value,
        });
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({
        path: path || '$',
        message: `Number must be >= ${schema.minimum}`,
        keyword: 'minimum',
        value,
      });
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({
        path: path || '$',
        message: `Number must be <= ${schema.maximum}`,
        keyword: 'maximum',
        value,
      });
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        path: path || '$',
        message: `Array must have at least ${schema.minItems} items`,
        keyword: 'minItems',
        value,
      });
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        path: path || '$',
        message: `Array must not have more than ${schema.maxItems} items`,
        keyword: 'maxItems',
        value,
      });
    }

    if (schema.uniqueItems && !hasUniqueItems(value)) {
      errors.push({
        path: path || '$',
        message: 'Array items must be unique',
        keyword: 'uniqueItems',
        value,
      });
    }

    // Validate array items
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const itemPath = `${path}[${i}]`;
        validateValue(value[i], schema.items, itemPath, errors);
      }
    }
  }

  // Object validations
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, any>;

    // Check required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const required of schema.required) {
        if (!(required in obj)) {
          errors.push({
            path: path || '$',
            message: `Missing required property: ${required}`,
            keyword: 'required',
          });
        }
      }
    }

    // Validate properties
    if (schema.properties && typeof schema.properties === 'object') {
      for (const key in schema.properties) {
        if (key in obj) {
          const propPath = path ? `${path}.${key}` : key;
          validateValue(obj[key], schema.properties[key], propPath, errors);
        }
      }
    }

    // Check additional properties
    if (schema.additionalProperties === false && schema.properties) {
      const allowedProps = Object.keys(schema.properties);
      for (const key in obj) {
        if (!allowedProps.includes(key)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Additional property not allowed: ${key}`,
            keyword: 'additionalProperties',
            value: obj[key],
          });
        }
      }
    } else if (typeof schema.additionalProperties === 'object') {
      // Validate additional properties against schema
      if (schema.properties) {
        const allowedProps = Object.keys(schema.properties);
        for (const key in obj) {
          if (!allowedProps.includes(key)) {
            const propPath = path ? `${path}.${key}` : key;
            validateValue(obj[key], schema.additionalProperties, propPath, errors);
          }
        }
      }
    }
  }
}

/**
 * Check if value matches any of the allowed types
 */
function isValidType(value: any, types: string[]): boolean {
  const valueType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  return types.includes(valueType);
}

/**
 * Check if array has unique items
 */
function hasUniqueItems(arr: any[]): boolean {
  const seen = new Set<string>();
  for (const item of arr) {
    const str = JSON.stringify(item);
    if (seen.has(str)) {
      return false;
    }
    seen.add(str);
  }
  return true;
}

/**
 * Infer schema from a value
 */
function inferSchemaFromValue(value: any): JsonSchema {
  if (value === null) {
    return { type: 'null' };
  }

  const type = Array.isArray(value) ? 'array' : typeof value;

  switch (type) {
    case 'string':
      return { type: 'string' };

    case 'number':
      return { type: Number.isInteger(value) ? 'integer' : 'number' };

    case 'boolean':
      return { type: 'boolean' };

    case 'array':
      const schema: JsonSchema = { type: 'array' };
      if (value.length > 0) {
        // Infer common schema for all items
        schema.items = inferCommonSchema(value);
      }
      return schema;

    case 'object':
      return inferObjectSchema(value);

    default:
      return { type: 'object' };
  }
}

/**
 * Infer common schema for array items
 */
function inferCommonSchema(items: any[]): JsonSchema {
  if (items.length === 0) {
    return {};
  }

  // Get types of all items
  const types = new Set<string>();
  for (const item of items) {
    const itemType = Array.isArray(item) ? 'array' : typeof item;
    types.add(itemType);
  }

  // If all same type, infer common schema
  if (types.size === 1) {
    return inferSchemaFromValue(items[0]);
  }

  // Mixed types
  return { type: Array.from(types) };
}

/**
 * Infer schema from object
 */
function inferObjectSchema(obj: Record<string, any>): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    properties: {},
  };

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (schema.properties as Record<string, JsonSchema>)[key] = inferSchemaFromValue(obj[key]);
    }
  }

  // Mark all properties as required
  schema.required = Object.keys(obj);

  return schema;
}

/**
 * Generate schema validation report
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('=== JSON Schema Validation Report ===\n');
  lines.push(`Status: ${result.valid ? '✓ Valid' : '✗ Invalid'}`);
  lines.push(`Errors: ${result.errors.length}\n`);

  if (result.errors.length > 0) {
    lines.push('--- Validation Errors ---');
    for (const error of result.errors) {
      lines.push(`• [${error.keyword}] ${error.path}`);
      lines.push(`  ${error.message}`);
      if (error.value !== undefined) {
        lines.push(`  Value: ${JSON.stringify(error.value)}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
