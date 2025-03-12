# DevLaunch - 钱包API文档

此文档详细介绍了DevLaunch平台的钱包API，包括与Solana区块链交互的所有端点。

## 基础URL

所有API请求的基础URL为:

```
https://api.devlaunch.fun/api
```

开发环境:

```
http://localhost:3000/api
```

## 认证

除了公开端点外，所有API请求都需要通过JWT令牌进行认证。令牌应当在HTTP请求头的`Authorization`字段中提供，格式为`Bearer <token>`。

例如:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 速率限制

为了保护API不被滥用，我们实施了以下速率限制:

- 一般钱包操作: 每IP每5分钟最多30个请求
- 代币创建操作: 每IP每小时最多10个请求

超过限制会返回HTTP 429状态码。

## 端点

### 获取SOL余额

获取已认证用户的SOL余额。

**请求**:

```http
GET /wallet/balance
Authorization: Bearer <token>
```

**响应**:

```json
{
  "success": true,
  "balance": 5.5,
  "walletAddress": "SolanaWalletAddress123456789012345678901234"
}
```

**错误**:

- 401: 未提供认证令牌或令牌无效
- 400: 用户没有有效的钱包地址
- 404: 未找到用户
- 500: 服务器错误

### 获取代币余额

获取已认证用户的特定代币余额。

**请求**:

```http
GET /wallet/token-balance/:tokenAddress
Authorization: Bearer <token>
```

**参数**:

- `tokenAddress`: SPL代币的地址

**响应**:

```json
{
  "success": true,
  "balance": 1000,
  "tokenAddress": "TokenAddress123456789012345678901234",
  "walletAddress": "SolanaWalletAddress123456789012345678901234"
}
```

**错误**:

- 401: 未提供认证令牌或令牌无效
- 400: 用户没有有效的钱包地址或代币地址无效
- 404: 未找到用户
- 500: 服务器错误

### 验证Solana地址

验证提供的Solana地址是否有效。

**请求**:

```http
POST /wallet/validate-address
Content-Type: application/json

{
  "address": "SolanaWalletAddress123456789012345678901234"
}
```

**响应**:

```json
{
  "success": true,
  "isValid": true,
  "address": "SolanaWalletAddress123456789012345678901234"
}
```

**错误**:

- 400: 请求体中缺少地址
- 500: 服务器错误

### 创建SPL代币

在Solana区块链上创建新的SPL代币。

**请求**:

```http
POST /wallet/create-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Test Token",
  "symbol": "TEST",
  "decimals": 9,
  "initialSupply": 1000000000,
  "description": "A test token for the DevLaunch platform"
}
```

**参数**:

- `name`: 代币名称 (必填)
- `symbol`: 代币符号 (必填)
- `decimals`: 代币精度，范围0-9 (可选，默认为9)
- `initialSupply`: 初始供应量 (可选，默认为1000000000)
- `description`: 代币描述 (可选)

**响应**:

```json
{
  "success": true,
  "tokenAddress": "NewTokenAddress123456789012345678901234",
  "txSignature": "txSignature12345",
  "name": "Test Token",
  "symbol": "TEST"
}
```

**错误**:

- 401: 未提供认证令牌或令牌无效
- 400: 必填字段缺失或无效
- 404: 未找到用户
- 429: 请求过于频繁，已超过速率限制
- 500: 服务器错误，包括创建代币时的区块链错误

### 获取代币信息

获取特定SPL代币的详细信息。

**请求**:

```http
GET /wallet/token-info/:tokenAddress
```

**参数**:

- `tokenAddress`: SPL代币的地址

**响应**:

```json
{
  "success": true,
  "tokenInfo": {
    "supply": "1000000",
    "decimals": 9,
    "mint": "TokenAddress123456789012345678901234",
    "name": "DB Token",
    "symbol": "DBT",
    "creator": {
      "username": "testuser",
      "email": "test@example.com"
    },
    "description": "Database token for testing",
    "launchDate": "2023-05-25T15:30:00.000Z"
  }
}
```

**错误**:

- 400: 代币地址无效
- 500: 服务器错误，包括获取代币信息时的区块链错误

## 使用示例

### Node.js使用axios

```javascript
const axios = require('axios');

// 配置
const API_URL = 'https://api.devlaunch.fun/api';
const token = 'your-jwt-token';

// 获取SOL余额
async function getSolBalance() {
  try {
    const response = await axios.get(`${API_URL}/wallet/balance`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('SOL Balance:', response.data.balance);
    return response.data;
  } catch (error) {
    console.error('Error getting SOL balance:', error.response?.data || error.message);
    throw error;
  }
}

// 创建SPL代币
async function createToken(tokenData) {
  try {
    const response = await axios.post(`${API_URL}/wallet/create-token`, tokenData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Token created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating token:', error.response?.data || error.message);
    throw error;
  }
}

// 验证Solana地址
async function validateAddress(address) {
  try {
    const response = await axios.post(`${API_URL}/wallet/validate-address`, {
      address
    });
    console.log('Address validation result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating address:', error.response?.data || error.message);
    throw error;
  }
}
```

### 使用curl

获取SOL余额:

```bash
curl -X GET "https://api.devlaunch.fun/api/wallet/balance" \
  -H "Authorization: Bearer your-jwt-token"
```

创建SPL代币:

```bash
curl -X POST "https://api.devlaunch.fun/api/wallet/create-token" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Token",
    "symbol": "TEST",
    "decimals": 9,
    "initialSupply": 1000000000,
    "description": "A test token for the DevLaunch platform"
  }'
```

验证Solana地址:

```bash
curl -X POST "https://api.devlaunch.fun/api/wallet/validate-address" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "SolanaWalletAddress123456789012345678901234"
  }'
```

## 错误处理

所有API错误响应都遵循相同的格式:

```json
{
  "success": false,
  "message": "错误描述"
}
```

对于验证错误，可能还会包含一个`errors`数组，提供更详细的错误信息:

```json
{
  "success": false,
  "message": "验证错误",
  "errors": [
    {
      "param": "name",
      "msg": "Token name is required",
      "location": "body"
    }
  ]
}
```

## 安全注意事项

- 所有API请求都应通过HTTPS进行
- 切勿在客户端代码中硬编码JWT令牌
- 对于生产环境，建议实施用户特定的限制，而不仅仅是基于IP的限制
- 敏感操作（如创建代币）应当使用更高级别的身份验证方法 