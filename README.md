# DevLaunch - Solana Token Ecosystem for Developers

<div align="center">
  <img src="https://raw.githubusercontent.com/DevLaunch-team/DevLaunch/main/apps/frontend/public/images/DVLlogo.png" alt="DevLaunch Logo" width="200" />
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Website](https://img.shields.io/badge/Website-devlaunch.fun-blue)](https://devlaunch.fun)
  [![Twitter](https://img.shields.io/badge/Twitter-@Dev__Launch__-blue)](https://x.com/Dev_Launch_)
  [![GitHub](https://img.shields.io/badge/GitHub-DevLaunch--team-blue)](https://github.com/DevLaunch-team/DevLaunch)
</div>

## 🚀 Project Overview

DevLaunch is a comprehensive ecosystem designed specifically for developers to streamline the token creation and launch process on Solana. By integrating token issuance workflows, trading platform integration, and community verification mechanisms, DevLaunch lowers the barriers to blockchain project launching while promoting innovative project development and liquidity.

### Key Features

- **Seamless Token Creation**: One-click SPL token deployment with customizable templates
- **Pump.fun Integration**: Immediate trading capabilities through deep API integration
- **Developer Identity System**: GitHub-based verification and reputation scoring
- **Community Validation**: Transparent project validation mechanisms
- **Liquidity Incentives**: Structured programs to encourage market making
- **Advanced UI Components**: Reusable component library for consistent user experience
- **Multi-language Support**: Full internationalization for English and Chinese

## 🏗️ Project Architecture

### High-Level Architecture

DevLaunch follows a modern web architecture with clear separation of concerns:

```
DevLaunch/
├── apps/                    # Applications directory
│   ├── frontend/            # Next.js frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── contexts/    # React contexts for state management
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── locales/     # Internationalization files
│   │   │   ├── pages/       # Next.js page components
│   │   │   ├── services/    # API and web3 services
│   │   │   ├── types/       # TypeScript type definitions
│   │   │   └── utils/       # Utility functions
│   │   └── public/          # Static assets
│   └── backend/             # Express backend API
├── contracts/               # Solana smart contracts
├── docs/                    # Documentation
└── packages/                # Shared packages and libraries
```

### Component Architecture

The frontend is built with a component-based architecture, focusing on reusability and separation of concerns:

1. **Core Components**: Base components like Card, Modal, Tabs, and Pagination
2. **Feature Components**: Higher-level components specific to features
3. **Layout Components**: Page layouts and structural components
4. **Context Providers**: Global state management with React Context API

### Data Flow Architecture

The application follows a unidirectional data flow model:

1. User interactions trigger events
2. Events call service functions or update context state
3. Services communicate with the backend API or blockchain
4. State changes propagate to components through context
5. Components re-render with updated data

## 💻 Technical Implementation

### Frontend Stack

- **Framework**: Next.js with React 18
- **Language**: TypeScript for type safety
- **Styling**: TailwindCSS for utility-first styling
- **State Management**: React Context API with custom hooks
- **Form Handling**: Custom form validation hooks
- **API Communication**: Axios with interceptors
- **Blockchain Integration**: Solana Web3.js and Wallet Adapter

### Backend Stack

- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Blockchain Integration

- **Solana SDK**: @solana/web3.js for blockchain interactions
- **Token Standard**: SPL Token for token creation and management
- **Wallet Connection**: Multiple wallet support (Phantom, Solflare)
- **Transaction Building**: Custom transaction builders for token operations

### Key Implementation Patterns

1. **Custom Hooks Pattern**:
   - `useFormValidation` for form state management and validation
   - `useApi` for API request handling with loading/error states
   - `useWallet` for blockchain wallet integration

2. **Provider Pattern**:
   - Auth context for user authentication state
   - Theme context for light/dark mode
   - Language context for internationalization

3. **Service Layer Pattern**:
   - Centralized API service for backend communication
   - Token service for blockchain interactions
   - User service for authentication operations

## 🔍 Core Components

### UI Component Library

DevLaunch includes a comprehensive UI component library:

#### Card Component

The Card component provides a flexible container for content with various styling options:

```tsx
<Card
  title="Account Overview"
  subtitle="Your current Solana token balance"
  variant="primary"
  hover={true}
  shadow="md"
  bordered={true}
>
  <TokenBalanceDisplay amount={balance} symbol="SOL" />
</Card>
```

#### Modal Component

The Modal component creates accessible dialogs with customizable headers and footers:

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Create New Token"
  size="lg"
  onSubmit={handleSubmit}
  submitButtonText="Create Token"
>
  <TokenCreationForm />
</Modal>
```

#### Tabs Component

The Tabs component provides content organization with multiple display styles:

```tsx
<Tabs
  tabs={[
    {
      id: 'overview',
      label: 'Overview',
      content: <Overview />
    },
    {
      id: 'transactions',
      label: 'Transactions',
      content: <TransactionHistory />
    }
  ]}
  variant="underlined"
  onChange={handleTabChange}
/>
```

#### Pagination Component

The Pagination component handles large data sets with customizable display options:

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  showFirstLast={true}
  variant="rounded"
/>
```

### Form Validation

The `useFormValidation` hook provides comprehensive form state management and validation:

```tsx
const { 
  formData, 
  errors, 
  handleChange, 
  validateForm 
} = useFormValidation(
  { name: '', symbol: '', supply: '' },
  {
    name: [validators.required()],
    symbol: [validators.required(), validators.maxLength(5)],
    supply: [validators.required()]
  }
);
```

### Internationalization

The project uses a custom internationalization system with translations stored in JSON files:

```tsx
// In component
const { t, locale, setLocale } = useTranslation();

// Usage
<h1>{t('welcome.title')}</h1>
<p>{t('welcome.description')}</p>
<button onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
  {t('common.switchLanguage')}
</button>
```

## 📊 Data Flow

### Authentication Flow

1. User enters credentials in the Login component
2. Auth service sends request to the backend
3. Backend validates credentials and returns JWT tokens
4. Auth context stores tokens and user information
5. Protected routes check auth state before rendering

### Token Creation Flow

1. User fills out token creation form with metadata
2. Form validation ensures all fields are valid
3. On submit, token service creates an on-chain transaction
4. User approves the transaction in their wallet
5. Backend records the token in the database
6. UI updates to show the new token

### API Request Flow

1. Components call API service functions
2. API service builds request with Axios
3. Request interceptors add authentication headers
4. Response interceptors handle errors and token refresh
5. Data is returned to the component for rendering

## 🛠️ Development Setup

### Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- Solana CLI tools for contract development
- MongoDB (if not using Docker)

### Installation

1. Clone the repository
```bash
git clone https://github.com/DevLaunch-team/DevLaunch.git
cd DevLaunch
```

2. Install dependencies
```bash
# Install dependencies for all workspaces
npm install
```

3. Set up environment variables
```bash
# Copy environment files
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
```

4. Start the development environment
```bash
# Start frontend
npm run dev:frontend

# Start backend
npm run dev:backend

# Or run both simultaneously
npm run dev
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run frontend tests
npm run test:frontend

# Run backend tests
npm run test:backend
```

## 📈 Recent Optimizations (March 2023)

DevLaunch has undergone significant optimizations to enhance user experience and development efficiency:

### UI Component Library Enhancements

1. **Advanced UI Components**:
   - `Card` - Multi-functional card component with various styling options
   - `Modal` - Headless UI-based modal component with configuration options
   - `Tabs` - Tab component supporting multiple styles and layouts
   - `Pagination` - Advanced pagination component with sophisticated algorithm
   - `ErrorPage` - Unified error page component

2. **Form Validation Improvements**:
   - `useFormValidation` - Comprehensive form validation hook
   - Built-in validators (required, email, password matching, etc.)
   - Support for custom validation rules and error messages

### Internationalization Completion

1. **Translation Files**:
   - Complete English and Chinese UI text
   - Error messages, common terms, page text
   - Seamless language switching capability

### Error Handling Enhancements

1. **Error Boundaries**:
   - Global error boundary components
   - Friendly error interfaces
   - Error reporting and recovery support

2. **API Call Optimization**:
   - `useApi` hook for managing API request states, caching, and error handling
   - Consistent loading and error states

### Performance Optimizations

1. **Code Splitting** - Component modularization with on-demand loading
2. **Caching Strategies** - API response caching to reduce unnecessary network requests
3. **Style Optimization** - TailwindCSS utility classes for reduced CSS size

### Development Experience Improvements

1. **Full Type Safety** - TypeScript type definitions for development safety
2. **Code Organization** - Clear directory structure and consistent naming conventions
3. **Component Documentation** - Detailed comments explaining component purpose and properties

## 📱 Connect With Us

- [Website](https://devlaunch.fun)
- [Twitter](https://x.com/Dev_Launch_)
- [GitHub](https://github.com/DevLaunch-team/DevLaunch)

## 📄 License

DevLaunch is released under the MIT License. See the [LICENSE](LICENSE) file for details. 