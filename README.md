# Amazon Selling Partner API MCP Server

A Model Context Protocol (MCP) server for interacting with the Amazon Selling Partner API. This server provides tools for accessing Amazon SP-API functionality through Claude Code.

## Features

- Simple OAuth authentication (no AWS credentials required)
- Tools for managing catalog, inventory, orders, reports, and more
- Works with Claude Code out of the box

## Prerequisites

- Node.js 18 or higher
- Amazon Selling Partner API credentials (Client ID, Client Secret, Refresh Token)

## Installation for Claude Code

Run this command to add the MCP server to Claude Code:

```bash
claude mcp add amazon-seller -e SP_API_CLIENT_ID=your_client_id -e SP_API_CLIENT_SECRET=your_client_secret -e SP_API_REFRESH_TOKEN=your_refresh_token -e SP_API_REGION=eu-west-1 -- npx github:Kalakata/AmazonSeller-mcp-server
```

Replace the placeholder values with your actual credentials:
- `your_client_id` - Your SP-API LWA Client ID
- `your_client_secret` - Your SP-API LWA Client Secret
- `your_refresh_token` - Your SP-API Refresh Token
- `eu-west-1` - Your region (`us-east-1` for NA, `eu-west-1` for EU, `us-west-2` for FE)

After adding, restart Claude Code to use the new MCP server.

## Manual Installation

Clone and install:

```bash
git clone https://github.com/Kalakata/AmazonSeller-mcp-server.git
cd AmazonSeller-mcp-server
npm install
```

Create a `.env` file:

```
SP_API_CLIENT_ID=your_client_id
SP_API_CLIENT_SECRET=your_client_secret
SP_API_REFRESH_TOKEN=your_refresh_token
SP_API_REGION=eu-west-1
```

Start the server:

```bash
npm start
```

## Available Tools

- `checkCredentials` - Verify API credentials
- `getMarketplaceParticipations` - List marketplaces you sell in
- `searchCatalogItems` - Search product catalog
- `getCatalogItem` - Get product details by ASIN
- `getInventorySummaries` - Get inventory levels
- `updateInventory` - Update inventory quantities
- `getOrders` - List orders
- `getOrder` - Get order details
- `getOrderItems` - Get items in an order
- `createReport` / `getReport` / `getReports` - Manage reports
- `getPricing` / `getCompetitivePricing` - Get pricing data
- `getListingsItem` / `putListingsItem` / `deleteListingsItem` - Manage listings
- `getFbaInventorySummaries` - Get FBA inventory
- And more...

## License

MIT
