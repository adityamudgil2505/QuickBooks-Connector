import fetch from 'node-fetch';
import express from 'express';
import OAuthClient from 'intuit-oauth';
import dotenv from 'dotenv';  // Import dotenv
dotenv.config();              // Load environment variables from .env file

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
app.get('/get-customers', async (req, res) => {
  const companyID = oauthClient.getToken().realmId;
  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/query?query=SELECT * FROM Customer` })
    .then(function (authResponse) {
      console.log(`\n The response for API call is :${JSON.stringify(authResponse.json)}`);
      res.send(authResponse.json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

// Step 3: Fetch Data from QuickBooks and Push to SQL
app.get('/get-invoices', async (req, res) => {
  const companyID = oauthClient.getToken().realmId;
  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/query?query=SELECT * FROM Invoice` })
    .then(function (authResponse) {
      console.log(`\n The response for API call is :${JSON.stringify(authResponse.json)}`);
      res.send(authResponse.json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

app.get('/get-accounts', async (req, res) => {
  const companyID = oauthClient.getToken().realmId;
  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/query?query=SELECT * FROM Account` })
    .then(function (authResponse) {
      console.log(`\n The response for API call is :${JSON.stringify(authResponse.json)}`);
      res.send(authResponse.json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

app.get('/get-company', function (req, res) {
  const companyID = oauthClient.getToken().realmId;

  const url =
    oauthClient.environment == 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  oauthClient
    .makeApiCall({ url: `${url}v3/company/${companyID}/companyinfo/${companyID}` })
    .then(function (authResponse) {
      console.log(`\n The response for API call is :${JSON.stringify(authResponse.json)}`);
      res.send(authResponse.json);
    })
    .catch(function (e) {
      console.error(e);
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
