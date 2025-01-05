const express = require('express');
const OAuthClient = require('intuit-oauth');
const mysql = require('mysql2-promise');
const fetch = require('node-fetch');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = 3000;

// QuickBooks Configuration
const quickbooksConfig = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
  environment: process.env.QUICKBOOKS_ENV || 'sandbox', // Default to 'sandbox'
};

const oauthClient = new OAuthClient(quickbooksConfig);
console.log("quickbooksConfig", quickbooksConfig);
// SQL Configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

app.get('/', (req, res)=>{
  res.send("App is running.");
})

// Step 1: Authorization URL
app.get('/auth', (req, res) => {
  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: 'testState',
  });
  console.log("authUri: " + authUri)
  res.redirect(authUri);
});

// Step 2: Callback for OAuth
app.get('/callback', async (req, res) => {
  const { url } = req;
  try {
    const authResponse = await oauthClient.createToken(url);
    console.log('OAuth Token:', authResponse.getJson());
    res.send('QuickBooks OAuth successful! You can now pull data.');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth failed!');
  }
});

// Step 3: Fetch Data from QuickBooks and Push to SQL
app.get('/sync-customers', async (req, res) => {
  try {
    const companyId = oauthClient.getToken().realmId;
    const accessToken = oauthClient.getToken().access_token;

    // Fetch Customers from QuickBooks
    const response = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${companyId}/query?query=SELECT * FROM Customer`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );
    const data = await response.json();
    const customers = data.QueryResponse.Customer || [];

    // Connect to SQL database
    const connection = await mysql.createConnection(dbConfig);

    // Push data to SQL database
    for (const customer of customers) {
      await connection.execute(
        'INSERT INTO customers (id, display_name, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE display_name = ?, email = ?',
        [
          customer.Id,
          customer.DisplayName,
          customer.PrimaryEmailAddr?.Address || null,
          customer.DisplayName,
          customer.PrimaryEmailAddr?.Address || null,
        ]
      );
    }

    await connection.end();
    res.send('Data synced successfully!');
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).send('Failed to sync data!');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
