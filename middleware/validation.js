// Input validation middleware using Zod schemas
const { z } = require('zod');
const { ValidationError } = require('./errorHandler');

// Common validation schemas
const addressSchema = z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
    .transform(addr => addr.toLowerCase());

const chainSchema = z.enum([
    'ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche'
]);

const paginationSchema = z.object({
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().min(0).optional().default(0)
});

const daysSchema = z.number().min(1).max(365).optional().default(30);

// API endpoint schemas
const balanceSchema = z.object({
    params: z.object({
        chain: chainSchema,
        address: addressSchema
    })
});

const nftsSchema = z.object({
    params: z.object({
        chain: chainSchema,
        address: addressSchema
    }),
    query: paginationSchema
});

const transactionsSchema = z.object({
    params: z.object({
        chain: chainSchema,
        address: addressSchema
    }),
    query: paginationSchema
});

const portfolioSchema = z.object({
    params: z.object({
        address: addressSchema
    }),
    query: z.object({
        chains: z.string().optional().transform(str => 
            str ? str.split(',').map(s => s.trim()) : undefined
        )
    })
});

const historicalSchema = z.object({
    params: z.object({
        address: addressSchema
    }),
    query: z.object({
        days: daysSchema
    })
});

const insightsSchema = z.object({
    body: z.object({
        portfolioData: z.record(z.any()).refine(data => 
            Object.keys(data).length > 0, {
            message: 'Portfolio data cannot be empty'
        }),
        address: addressSchema,
        chains: z.array(chainSchema).optional()
    })
});

// Legacy schemas object for backward compatibility
const schemas = {
    balance: balanceSchema,
    nfts: nftsSchema,
    transactions: transactionsSchema,
    portfolio: portfolioSchema,
    historical: historicalSchema,
    insights: insightsSchema
};

// Validation middleware factory
function validateRequest(schemaName) {
    return (req, res, next) => {
        try {
            const schema = schemas[schemaName];
            if (!schema) {
                throw new Error(`Validation schema '${schemaName}' not found`);
            }

            // Validate params
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }

            // Validate query parameters
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }

            // Validate request body
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const validationError = new ValidationError(
                    'Invalid request data',
                    error.errors[0]?.path?.join('.') || 'unknown'
                );
                validationError.details = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    received: err.received
                }));
                return next(validationError);
            }
            next(error);
        }
    };
}

// Sanitization helpers
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>"'&]/g, '');
}

function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

// Sanitization middleware
function sanitizeInput(req, res, next) {
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
}

module.exports = {
    validateRequest,
    sanitizeInput,
    schemas,
    addressSchema,
    chainSchema,
    paginationSchema,
    daysSchema,
    balanceSchema,
    nftsSchema,
    transactionsSchema,
    portfolioSchema,
    historicalSchema,
    insightsSchema
};