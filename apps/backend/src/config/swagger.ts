import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevLaunch API Documentation',
      version,
      description: 'API documentation for DevLaunch platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'DevLaunch Team',
        url: 'https://devlaunch.fun',
        email: 'info@devlaunch.fun',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Base URL',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            walletAddress: {
              type: 'string',
              description: 'Solana wallet address',
            },
            bio: {
              type: 'string',
              description: 'User biography',
            },
            verificationLevel: {
              type: 'integer',
              description: 'User verification level',
            },
            githubUsername: {
              type: 'string',
              description: 'GitHub username',
            },
            tokens: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of token IDs created by user',
            },
            githubId: {
              type: 'string',
              description: 'GitHub user ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update date',
            },
          },
        },
        Token: {
          type: 'object',
          required: ['name', 'symbol', 'tokenAddress', 'creator'],
          properties: {
            id: {
              type: 'string',
              description: 'Token ID',
            },
            name: {
              type: 'string',
              description: 'Token name',
            },
            symbol: {
              type: 'string',
              description: 'Token symbol',
            },
            tokenAddress: {
              type: 'string',
              description: 'Token address on Solana',
            },
            description: {
              type: 'string',
              description: 'Token description',
            },
            creator: {
              type: 'string',
              description: 'ID of the token creator',
            },
            creatorWallet: {
              type: 'string',
              description: 'Wallet address of the creator',
            },
            status: {
              type: 'string',
              enum: ['pending', 'deployed', 'trading', 'delisted'],
              description: 'Token status',
            },
            supply: {
              type: 'number',
              description: 'Token total supply',
            },
            decimals: {
              type: 'integer',
              description: 'Token decimals',
            },
            logo: {
              type: 'string',
              description: 'URL to token logo',
            },
            website: {
              type: 'string',
              description: 'Token website URL',
            },
            twitter: {
              type: 'string',
              description: 'Token Twitter profile URL',
            },
            discord: {
              type: 'string',
              description: 'Token Discord server URL',
            },
            github: {
              type: 'string',
              description: 'Token GitHub repository URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Token creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Token last update date',
            },
          },
        },
        Project: {
          type: 'object',
          required: ['name', 'description', 'category', 'creator'],
          properties: {
            id: {
              type: 'string',
              description: 'Project ID',
            },
            name: {
              type: 'string',
              description: 'Project name',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            category: {
              type: 'string',
              enum: ['web', 'mobile', 'desktop', 'blockchain', 'ai', 'other'],
              description: 'Project category',
            },
            creator: {
              $ref: '#/components/schemas/User',
              description: 'Project creator',
            },
            teamMembers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
              description: 'Project team members',
            },
            githubRepo: {
              type: 'string',
              description: 'GitHub repository URL',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Project tags',
            },
            status: {
              type: 'string',
              enum: ['planning', 'in-progress', 'completed', 'abandoned'],
              description: 'Project status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Project last update date',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false,
              description: 'Success status',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  param: {
                    type: 'string',
                    description: 'Parameter name with error',
                  },
                  msg: {
                    type: 'string',
                    description: 'Error message',
                  },
                  value: {
                    type: 'string',
                    description: 'Value that caused the error',
                  },
                  location: {
                    type: 'string',
                    description: 'Location of the parameter',
                  },
                },
              },
              description: 'Validation errors',
            },
          },
        },
        GitHubUser: {
          type: 'object',
          properties: {
            login: {
              type: 'string',
              description: 'GitHub username',
            },
            id: {
              type: 'integer',
              description: 'GitHub user ID',
            },
            avatar_url: {
              type: 'string',
              description: 'User avatar URL',
            },
            html_url: {
              type: 'string',
              description: 'User GitHub profile URL',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            bio: {
              type: 'string',
              description: 'User bio',
            },
            public_repos: {
              type: 'integer',
              description: 'Number of public repositories',
            },
            followers: {
              type: 'integer',
              description: 'Number of followers',
            },
            following: {
              type: 'integer',
              description: 'Number of following',
            },
          },
        },
        GitHubRepository: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Repository ID',
            },
            name: {
              type: 'string',
              description: 'Repository name',
            },
            full_name: {
              type: 'string',
              description: 'Repository full name (owner/name)',
            },
            html_url: {
              type: 'string',
              description: 'Repository URL',
            },
            description: {
              type: 'string',
              description: 'Repository description',
            },
            language: {
              type: 'string',
              description: 'Repository primary language',
            },
            stargazers_count: {
              type: 'integer',
              description: 'Number of stars',
            },
            forks_count: {
              type: 'integer',
              description: 'Number of forks',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Repository creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Repository last update date',
            },
          },
        },
        GitHubLinkResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'GitHub account linked successfully',
            },
            githubUsername: {
              type: 'string',
              example: 'octocat',
            },
            verificationLevel: {
              type: 'integer',
              example: 2,
            },
          },
        },
        SolanaBalance: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status of the request',
            },
            balance: {
              type: 'number',
              description: 'SOL balance amount',
            },
            walletAddress: {
              type: 'string',
              description: 'Solana wallet address',
            }
          }
        },
        TokenBalance: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status of the request',
            },
            balance: {
              type: 'number',
              description: 'Token balance amount',
            },
            tokenAddress: {
              type: 'string',
              description: 'SPL token address',
            },
            walletAddress: {
              type: 'string',
              description: 'Solana wallet address',
            }
          }
        },
        AddressValidation: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status of the request',
            },
            isValid: {
              type: 'boolean',
              description: 'Whether the address is valid',
            },
            address: {
              type: 'string',
              description: 'Solana address that was validated',
            }
          }
        },
        TokenCreation: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status of the request',
            },
            tokenAddress: {
              type: 'string',
              description: 'Address of the created token',
            },
            txSignature: {
              type: 'string',
              description: 'Transaction signature',
            },
            name: {
              type: 'string',
              description: 'Token name',
            },
            symbol: {
              type: 'string',
              description: 'Token symbol',
            }
          }
        },
        TokenInfo: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status of the request',
            },
            tokenInfo: {
              type: 'object',
              properties: {
                supply: {
                  type: 'number',
                  description: 'Total token supply',
                },
                decimals: {
                  type: 'integer',
                  description: 'Token decimals',
                },
                mint: {
                  type: 'string',
                  description: 'Token mint address',
                },
                name: {
                  type: 'string',
                  description: 'Token name',
                },
                symbol: {
                  type: 'string',
                  description: 'Token symbol',
                },
                creator: {
                  type: 'object',
                  description: 'Creator information',
                },
                description: {
                  type: 'string',
                  description: 'Token description',
                },
                launchDate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Token launch date',
                }
              }
            }
          }
        },
      },
    },
    paths: {
      '/wallet/balance': {
        get: {
          tags: ['Wallet'],
          summary: 'Get SOL balance',
          description: 'Retrieve the SOL balance for authenticated user\'s wallet',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SolanaBalance'
                  }
                }
              }
            },
            400: {
              description: 'Invalid wallet address',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      
      '/wallet/token-balance/{tokenAddress}': {
        get: {
          tags: ['Wallet'],
          summary: 'Get token balance',
          description: 'Retrieve the SPL token balance for authenticated user\'s wallet',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'tokenAddress',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'SPL token address'
            }
          ],
          responses: {
            200: {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenBalance'
                  }
                }
              }
            },
            400: {
              description: 'Invalid token address or wallet address',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      
      '/wallet/validate-address': {
        post: {
          tags: ['Wallet'],
          summary: 'Validate Solana address',
          description: 'Validate a Solana wallet address',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['address'],
                  properties: {
                    address: {
                      type: 'string',
                      description: 'Solana wallet address to validate'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AddressValidation'
                  }
                }
              }
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      
      '/wallet/create-token': {
        post: {
          tags: ['Wallet'],
          summary: 'Create SPL token',
          description: 'Create a new SPL token on Solana blockchain',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'symbol'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Token name'
                    },
                    symbol: {
                      type: 'string',
                      description: 'Token symbol'
                    },
                    decimals: {
                      type: 'integer',
                      description: 'Token decimals (default: 9)',
                      default: 9
                    },
                    initialSupply: {
                      type: 'number',
                      description: 'Initial token supply (default: 1000000000)',
                      default: 1000000000
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Token created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenCreation'
                  }
                }
              }
            },
            400: {
              description: 'Invalid request parameters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            401: {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
      
      '/wallet/token-info/{tokenAddress}': {
        get: {
          tags: ['Wallet'],
          summary: 'Get token info',
          description: 'Get information about a specific SPL token',
          parameters: [
            {
              name: 'tokenAddress',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'SPL token address'
            }
          ],
          responses: {
            200: {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenInfo'
                  }
                }
              }
            },
            400: {
              description: 'Invalid token address',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse'
                  }
                }
              }
            }
          }
        }
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerJsdoc(options); 