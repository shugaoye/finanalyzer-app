# Widget Development Workflow

This document outlines the complete workflow for developing, testing, and deploying widgets in the Finanalyzer platform, including the enhanced debug widget functionality.

## Table of Contents

1. [Overview](#overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Enhanced Debug Widget Features](#enhanced-debug-widget-features)
4. [Widget Development Process](#widget-development-process)
5. [Testing and Debugging](#testing-and-debugging)
6. [Packaging and Export](#packaging-and-export)
7. [Production Deployment](#production-deployment)
8. [Code Sharing Architecture](#code-sharing-architecture)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Widget Development Examples](#widget-development-examples)

## Overview

The widget development workflow follows a structured approach that allows developers to:

1. Create and test widgets in a debug environment with actual UI preview
2. Reuse code between debug and production environments
3. Package and export widget code for production use
4. Deploy widgets to the production environment

## Development Environment Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Finanalyzer repository cloned locally

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd finanalyzer
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Start the development server**:
   ```bash
   npm run dev:all
   ```

4. **Access the application**:
   Open your browser to `http://localhost:5173`

## Enhanced Debug Widget Features

The Debug Widget has been enhanced with the following features:

### 1. Default Display Behavior
- Shows the actual widget UI by default when the debug widget is active
- Provides a realistic preview of how the widget will appear in production

### 2. Debug Tab Visibility
- Maintains two debug tabs that only become visible when the user selects the "Debug" option from the top-right corner "..." menu
- Clean interface that focuses on the widget UI by default

### 3. Menu Structure
- Dropdown menu triggered by clicking the top-right "..." icon
- Menu options in this order:
  ```
  ...
   ├── Settings
   └── Debug
       ├── Parameters & Data
       └── Definition (functioning as the current "Definition Editor")
  ```

### 4. Mode Switching
- Toggle between "Debug" and "Production" modes in Preview view
- Allows testing how the widget behaves in different environments

## Widget Development Process

### Step 1: Create a New Widget Definition

1. **Add Debug Widget**:
   - Add a Debug widget to your dashboard
   - The widget will display in Preview mode by default, showing the actual widget UI

2. **Access Debug Mode**:
   - Click the top-right "..." menu
   - Select "Debug > Definition" to open the Definition Editor

3. **Create Widget Configuration**:
   - Enter a widget ID (e.g., `my-custom-widget`)
   - Select a widget type from the dropdown or create a custom type
   - Define parameters, endpoint, and other settings
   - Click "Apply Definition" to save changes

### Step 2: Develop Widget UI

1. **Preview Mode**:
   - The Debug widget shows the actual widget UI by default
   - Switch between "Debug" and "Production" modes to test different behaviors

2. **Test Data Fetching**:
   - Click the top-right menu and select "Debug > Parameters & Data"
   - Adjust parameter values
   - Click "Fetch Data" to test API calls
   - View detailed debug information in the browser console

3. **Shared Components**:
   - Use shared components from `src/components/widgets/shared/` for common functionality
   - Extend `BaseWidgetComponent` for consistent data fetching behavior
   - Leverage the same components used in production widgets

### Step 3: Test and Iterate

1. **Debug Mode**:
   - Use the "Definition Editor" to modify widget configuration
   - Use "Parameters & Data" to test different parameter combinations
   - Check browser console for detailed debug logs

2. **Iterate**:
   - Make changes to the widget configuration
   - Test with different data sources
   - Refine the UI and functionality
   - Switch between modes to verify behavior

## Testing and Debugging

### Debug Widget Features

- **Preview Mode**: Shows the actual widget UI by default
- **Definition Editor**: Edit widget configuration JSON
- **Parameters & Data**: Test parameter values and data fetching
- **Console Logs**: View detailed debug information
- **Mode Switching**: Toggle between Debug and Production modes

### Common Testing Scenarios

1. **Data Fetching**:
   - Test with different parameter values
   - Verify error handling for invalid data
   - Test with empty or malformed responses

2. **UI Rendering**:
   - Test with different data sizes
   - Verify responsive design
   - Test with different browser sizes

3. **Performance**:
   - Measure data fetching time
   - Test with large datasets
   - Optimize rendering performance

4. **Mode Testing**:
   - Test widget behavior in Debug mode
   - Test widget behavior in Production mode
   - Ensure consistent behavior across modes

## Packaging and Export

### Export Options

1. **Export Config**:
   - Click the top-right menu and select "Export > Export Config"
   - Saves widget configuration as a JSON file

2. **Export Code**:
   - Click the top-right menu and select "Export > Export Code"
   - Generates TypeScript code for the widget

### Generated Files

- **Widget Configuration** (`*.json`): Contains widget settings, parameters, and metadata
- **Widget Code** (`*.tsx`): TypeScript component code ready for production

## Production Deployment

### Step 1: Add Widget to Production

1. **Copy Exported Files**:
   - Copy the generated TypeScript file to `src/components/widgets/`
   - Copy the configuration JSON file to your widget definitions

2. **Register Widget Type**:
   - Add the widget to `widgetFactory.ts` using `WidgetFactory.registerWidgetType()`
   - Ensure the renderer points to your new widget component
   - Set appropriate mode configurations for debug and production

### Step 2: Build and Deploy

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Deploy the built files to your production environment
   - Restart the application if necessary

### Step 3: Verify Deployment

1. **Test in Production**:
   - Add the widget to a dashboard
   - Verify it works correctly with production data
   - Check for any performance issues

## Code Sharing Architecture

### Reusable Component Architecture

The debug widget and production widgets share the same component architecture:

1. **Core Widget Functionality**:
   - Developed and tested in the debug environment
   - Directly reused in production without modification

2. **Shared Components**:
   - Located in `src/components/widgets/shared/`
   - Used by both debug and production widgets
   - Ensure consistent behavior across environments

3. **Modular System**:
   - Core widget functionality developed in debug environment
   - Deployed as standalone widgets in production
   - Changes to shared components propagate to both environments

### Development Workflow Integration

1. **Primary Development Environment**:
   - Widget development occurs primarily within the debug widget
   - Provides a safe environment for testing and iteration

2. **Packaging Mechanism**:
   - Export functionality packages debugged widget code for production
   - Generates clean, production-ready code

3. **Change Propagation**:
   - Changes to shared UI components affect both debug and production
   - Ensures consistency across environments

## Best Practices

### Code Organization

- **Single Responsibility**:
  - Each widget should have a single responsibility
  - Keep widget files small and focused

- **Reuse Components**:
  - Use shared components for common functionality
  - Extend `BaseWidgetComponent` for consistent behavior
  - Leverage existing widgets as patterns

- **Type Safety**:
  - Use TypeScript interfaces for widget props and data
  - Define clear types for parameters and responses
  - Ensure type consistency across debug and production

### Performance

- **Data Fetching**:
  - Use efficient data fetching methods
  - Implement caching where appropriate
  - Handle large datasets gracefully

- **Rendering**:
  - Optimize component rendering
  - Use React.memo for expensive components
  - Avoid unnecessary re-renders

### Security

- **Data Validation**:
  - Validate all input parameters
  - Sanitize data before rendering
  - Handle error cases appropriately

- **API Calls**:
  - Use secure API endpoints
  - Implement proper error handling
  - Avoid hardcoding sensitive information

## Troubleshooting

### Common Issues

1. **Widget Not Rendering**:
   - Check console for errors
   - Verify widget type is registered
   - Ensure renderer is correctly specified

2. **Data Fetching Failed**:
   - Check API endpoint URL
   - Verify parameters are correctly formatted
   - Test API endpoint directly in browser

3. **Exported Code Errors**:
   - Check TypeScript compilation errors
   - Verify import paths are correct
   - Ensure all dependencies are installed

4. **Mode-Specific Issues**:
   - Test widget in both Debug and Production modes
   - Check mode-specific configuration in widgetFactory

### Debugging Tips

- **Console Logs**:
  - Use `console.log()` for debugging
  - Check network requests in browser dev tools
  - Monitor performance in browser dev tools

- **Widget Factory**:
  - Verify widget type is registered correctly
  - Check renderer function is properly defined
  - Ensure parameters are correctly configured

- **Shared Components**:
  - Verify shared components are working correctly
  - Check for version compatibility

## Widget Development Examples

### Example 1: Creating a Simple Table Widget

#### Step 1: Define Widget Configuration

1. **Open Debug Widget**:
   - Add Debug widget to dashboard
   - Click "..." menu > "Debug > Definition"

2. **Configure Widget**:
   ```json
   {
     "id": "stock-table",
     "name": "Stock Table",
     "description": "Displays stock data in a table",
     "type": "table",
     "category": "Financial",
     "subcategory": "Stocks",
     "endpoint": "/api/v1/stocks",
     "gridData": { "w": 6, "h": 4 },
     "params": [
       {
         "name": "symbol",
         "type": "string",
         "label": "Symbol",
         "default": "AAPL"
       },
       {
         "name": "period",
         "type": "select",
         "label": "Period",
         "default": "1d",
         "options": [
           { "value": "1d", "label": "1 Day" },
           { "value": "1w", "label": "1 Week" },
           { "value": "1m", "label": "1 Month" }
         ]
       }
     ],
     "source": "built-in"
   }
   ```

3. **Apply Definition**:
   - Click "Apply Definition" button

#### Step 2: Test Widget

1. **Preview Mode**:
   - View the actual table widget UI
   - Switch between Debug and Production modes

2. **Test Data**:
   - Click "..." menu > "Debug > Parameters & Data"
   - Adjust parameters and click "Fetch Data"
   - Check console for API response

#### Step 3: Export and Deploy

1. **Export Code**:
   - Click "..." menu > "Export > Export Code"
   - Save the generated `stock-table.tsx` file

2. **Add to Production**:
   - Copy `stock-table.tsx` to `src/components/widgets/`
   - Register in `widgetFactory.ts`:
     ```typescript
     WidgetFactory.registerWidgetType({
       type: "stock-table",
       displayName: "Stock Table",
       description: "Displays stock data in a table",
       defaultGridData: { w: 6, h: 4 },
       supportedParameters: [
         // parameters here
       ],
       renderer: StockTableWidget,
       modeConfig: {
         debug: { enabled: true },
         production: { enabled: true }
       }
     });
     ```

3. **Build and Deploy**:
   ```bash
   npm run build
   # Deploy to production
   ```

### Example 2: Creating a Chart Widget

#### Step 1: Define Widget Configuration

1. **Open Debug Widget**:
   - Add Debug widget to dashboard
   - Click "..." menu > "Debug > Definition"

2. **Configure Widget**:
   ```json
   {
     "id": "price-chart",
     "name": "Price Chart",
     "description": "Displays price history as a chart",
     "type": "chart",
     "category": "Financial",
     "subcategory": "Stocks",
     "endpoint": "/api/v1/price-history",
     "gridData": { "w": 8, "h": 5 },
     "params": [
       {
         "name": "symbol",
         "type": "string",
         "label": "Symbol",
         "default": "AAPL"
       },
       {
         "name": "chartType",
         "type": "select",
         "label": "Chart Type",
         "default": "line",
         "options": [
           { "value": "line", "label": "Line" },
           { "value": "bar", "label": "Bar" }
         ]
       },
       {
         "name": "timeRange",
         "type": "select",
         "label": "Time Range",
         "default": "1m",
         "options": [
           { "value": "1d", "label": "1 Day" },
           { "value": "1w", "label": "1 Week" },
           { "value": "1m", "label": "1 Month" },
           { "value": "3m", "label": "3 Months" }
         ]
       }
     ],
     "source": "built-in"
   }
   ```

3. **Apply Definition**:
   - Click "Apply Definition" button

#### Step 2: Test Widget

1. **Preview Mode**:
   - View the actual chart widget UI
   - Test different chart types and time ranges

2. **Test Data**:
   - Click "..." menu > "Debug > Parameters & Data"
   - Adjust parameters and click "Fetch Data"
   - Check console for API response

#### Step 3: Export and Deploy

1. **Export Code**:
   - Click "..." menu > "Export > Export Code"
   - Save the generated `price-chart.tsx` file

2. **Add to Production**:
   - Copy `price-chart.tsx` to `src/components/widgets/`
   - Register in `widgetFactory.ts`

3. **Build and Deploy**:
   ```bash
   npm run build
   # Deploy to production
   ```

## Conclusion

The enhanced debug widget provides a powerful environment for widget development, allowing developers to create, test, and refine widgets with real-time UI previews. The code sharing architecture ensures that widgets developed in the debug environment can be directly deployed to production with minimal changes.

By following this workflow and leveraging the shared component architecture, you can create high-quality widgets that integrate seamlessly with the Finanalyzer platform. The debug widget streamlines the development process, reduces time to deployment, and ensures consistent behavior across environments.
