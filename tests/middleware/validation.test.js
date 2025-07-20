// Tests for validation middleware
const {
    addressSchema,
    chainSchema,
    paginationSchema,
    daysSchema,
    balanceSchema,
    nftsSchema,
    transactionsSchema,
    portfolioSchema,
    historicalSchema,
    insightsSchema,
    validateRequest,
    sanitizeInput
} = require('../../middleware/validation');
const { ValidationError } = require('../../middleware/errorHandler');

describe('Validation Schemas', () => {
    describe('addressSchema', () => {
        it('should validate correct Ethereum address', () => {
            const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
            const result = addressSchema.safeParse(validAddress);
            expect(result.success).toBe(true);
            expect(result.data).toBe(validAddress.toLowerCase());
        });

        it('should reject invalid address format', () => {
            const invalidAddress = '0xinvalid';
            const result = addressSchema.safeParse(invalidAddress);
            expect(result.success).toBe(false);
        });

        it('should reject non-string input', () => {
            const result = addressSchema.safeParse(123);
            expect(result.success).toBe(false);
        });

        it('should convert address to lowercase', () => {
            const mixedCaseAddress = '0x742D35CC6634C0532925A3B8D4C9DB96C4B4D8B6';
            const result = addressSchema.safeParse(mixedCaseAddress);
            expect(result.success).toBe(true);
            expect(result.data).toBe(mixedCaseAddress.toLowerCase());
        });
    });

    describe('chainSchema', () => {
        it('should validate supported chains', () => {
            const validChains = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche'];
            
            validChains.forEach(chain => {
                const result = chainSchema.safeParse(chain);
                expect(result.success).toBe(true);
                expect(result.data).toBe(chain);
            });
        });

        it('should reject unsupported chains', () => {
            const invalidChain = 'unsupported-chain';
            const result = chainSchema.safeParse(invalidChain);
            expect(result.success).toBe(false);
        });

        it('should be case sensitive', () => {
            const result = chainSchema.safeParse('ETHEREUM');
            expect(result.success).toBe(false);
        });
    });

    describe('paginationSchema', () => {
        it('should validate correct pagination parameters', () => {
            const validPagination = { limit: 20, offset: 0 };
            const result = paginationSchema.safeParse(validPagination);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validPagination);
        });

        it('should apply default values', () => {
            const result = paginationSchema.safeParse({});
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ limit: 20, offset: 0 });
        });

        it('should reject limit exceeding maximum', () => {
            const result = paginationSchema.safeParse({ limit: 101 });
            expect(result.success).toBe(false);
        });

        it('should reject negative offset', () => {
            const result = paginationSchema.safeParse({ offset: -1 });
            expect(result.success).toBe(false);
        });
    });

    describe('daysSchema', () => {
        it('should validate valid day ranges', () => {
            const validDays = [1, 30, 90, 365];
            
            validDays.forEach(days => {
                const result = daysSchema.safeParse(days);
                expect(result.success).toBe(true);
                expect(result.data).toBe(days);
            });
        });

        it('should apply default value', () => {
            const result = daysSchema.safeParse(undefined);
            expect(result.success).toBe(true);
            expect(result.data).toBe(30);
        });

        it('should reject days exceeding maximum', () => {
            const result = daysSchema.safeParse(366);
            expect(result.success).toBe(false);
        });

        it('should reject zero or negative days', () => {
            expect(daysSchema.safeParse(0).success).toBe(false);
            expect(daysSchema.safeParse(-1).success).toBe(false);
        });
    });
});

describe('API Schema Validation', () => {
    describe('balanceSchema', () => {
        it('should validate correct balance request', () => {
            const validRequest = {
                params: {
                    chain: 'ethereum',
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                }
            };
            
            const result = balanceSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });

        it('should reject invalid chain in balance request', () => {
            const invalidRequest = {
                params: {
                    chain: 'invalid-chain',
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                }
            };
            
            const result = balanceSchema.safeParse(invalidRequest);
            expect(result.success).toBe(false);
        });
    });

    describe('nftsSchema', () => {
        it('should validate NFTs request with pagination', () => {
            const validRequest = {
                params: {
                    chain: 'ethereum',
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                },
                query: {
                    limit: 10,
                    offset: 20
                }
            };
            
            const result = nftsSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });

        it('should apply default pagination values', () => {
            const requestWithoutPagination = {
                params: {
                    chain: 'polygon',
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                },
                query: {}
            };
            
            const result = nftsSchema.safeParse(requestWithoutPagination);
            expect(result.success).toBe(true);
            expect(result.data.query.limit).toBe(20);
            expect(result.data.query.offset).toBe(0);
        });
    });

    describe('portfolioSchema', () => {
        it('should validate portfolio request with chains filter', () => {
            const validRequest = {
                params: {
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                },
                query: {
                    chains: 'ethereum,polygon,bsc'
                }
            };
            
            const result = portfolioSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });

        it('should validate portfolio request without chains filter', () => {
            const validRequest = {
                params: {
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                },
                query: {}
            };
            
            const result = portfolioSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });
    });

    describe('insightsSchema', () => {
        it('should validate insights request with all fields', () => {
            const validRequest = {
                body: {
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                    chains: ['ethereum', 'polygon'],
                    includeNFTs: true,
                    analysisDepth: 'detailed'
                }
            };
            
            const result = insightsSchema.safeParse(validRequest);
            expect(result.success).toBe(true);
        });

        it('should apply default values for optional fields', () => {
            const minimalRequest = {
                body: {
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                }
            };
            
            const result = insightsSchema.safeParse(minimalRequest);
            expect(result.success).toBe(true);
            expect(result.data.body.includeNFTs).toBe(true);
            expect(result.data.body.analysisDepth).toBe('detailed');
        });

        it('should reject invalid analysis depth', () => {
            const invalidRequest = {
                body: {
                    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                    analysisDepth: 'invalid-depth'
                }
            };
            
            const result = insightsSchema.safeParse(invalidRequest);
            expect(result.success).toBe(false);
        });
    });
});

describe('validateRequest middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = testUtils.createMockReq();
        res = testUtils.createMockRes();
        next = testUtils.createMockNext();
    });

    it('should pass validation with valid data', () => {
        req.params = {
            chain: 'ethereum',
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        };
        
        const middleware = validateRequest(balanceSchema);
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith();
        expect(req.params.address).toBe('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
    });

    it('should call next with ValidationError on invalid data', () => {
        req.params = {
            chain: 'invalid-chain',
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
        };
        
        const middleware = validateRequest(balanceSchema);
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
        const error = next.mock.calls[0][0];
        expect(error.message).toContain('Validation failed');
        expect(error.details).toBeDefined();
    });

    it('should transform request data according to schema', () => {
        req.params = {
            chain: 'ethereum',
            address: '0x742D35CC6634C0532925A3B8D4C9DB96C4B4D8B6' // Mixed case
        };
        req.query = {}; // Should get default pagination
        
        const middleware = validateRequest(nftsSchema);
        middleware(req, res, next);
        
        expect(next).toHaveBeenCalledWith();
        expect(req.params.address).toBe('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
        expect(req.query.limit).toBe(20);
        expect(req.query.offset).toBe(0);
    });
});

describe('sanitizeInput middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = testUtils.createMockReq();
        res = testUtils.createMockRes();
        next = testUtils.createMockNext();
    });

    it('should sanitize string inputs', () => {
        req.body = {
            name: '  Test Name  ',
            description: '<script>alert("xss")</script>Normal text'
        };
        req.query = {
            search: '  search term  '
        };
        
        sanitizeInput(req, res, next);
        
        expect(req.body.name).toBe('Test Name');
        expect(req.body.description).toBe('Normal text');
        expect(req.query.search).toBe('search term');
        expect(next).toHaveBeenCalledWith();
    });

    it('should preserve non-string values', () => {
        req.body = {
            count: 42,
            active: true,
            items: ['item1', 'item2'],
            nested: {
                value: '  nested value  '
            }
        };
        
        sanitizeInput(req, res, next);
        
        expect(req.body.count).toBe(42);
        expect(req.body.active).toBe(true);
        expect(req.body.items).toEqual(['item1', 'item2']);
        expect(req.body.nested.value).toBe('nested value');
    });

    it('should handle empty or null values', () => {
        req.body = {
            empty: '',
            nullValue: null,
            undefined: undefined
        };
        
        sanitizeInput(req, res, next);
        
        expect(req.body.empty).toBe('');
        expect(req.body.nullValue).toBe(null);
        expect(req.body.undefined).toBe(undefined);
        expect(next).toHaveBeenCalledWith();
    });

    it('should sanitize deeply nested objects', () => {
        req.body = {
            level1: {
                level2: {
                    level3: {
                        value: '  deep value  '
                    }
                }
            }
        };
        
        sanitizeInput(req, res, next);
        
        expect(req.body.level1.level2.level3.value).toBe('deep value');
    });

    it('should sanitize arrays of objects', () => {
        req.body = {
            items: [
                { name: '  item 1  ' },
                { name: '  item 2  ' }
            ]
        };
        
        sanitizeInput(req, res, next);
        
        expect(req.body.items[0].name).toBe('item 1');
        expect(req.body.items[1].name).toBe('item 2');
    });
});

describe('Helper Functions', () => {
    describe('stripHtml', () => {
        const { stripHtml } = require('../../middleware/validation');
        
        it('should remove HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const result = stripHtml(input);
            expect(result).toBe('Hello world');
        });

        it('should handle self-closing tags', () => {
            const input = 'Line 1<br/>Line 2<hr>Line 3';
            const result = stripHtml(input);
            expect(result).toBe('Line 1Line 2Line 3');
        });

        it('should handle malformed HTML', () => {
            const input = '<div>Unclosed tag';
            const result = stripHtml(input);
            expect(result).toBe('Unclosed tag');
        });
    });

    describe('normalizeWhitespace', () => {
        const { normalizeWhitespace } = require('../../middleware/validation');
        
        it('should normalize multiple spaces', () => {
            const input = 'Multiple    spaces   here';
            const result = normalizeWhitespace(input);
            expect(result).toBe('Multiple spaces here');
        });

        it('should normalize different whitespace characters', () => {
            const input = 'Tab\there\nNewline\r\nCarriage return';
            const result = normalizeWhitespace(input);
            expect(result).toBe('Tab here Newline Carriage return');
        });
    });
});