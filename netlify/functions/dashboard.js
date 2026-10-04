/**
 * Netlify Function Proxy: /api/dashboard
 * Mengambil data dari Google Apps Script Web App secara server-side
 * untuk mengatasi pembatasan CORS browser.
 */

const GAS_URL =
  process.env.VITE_GAS_WEB_APP_URL ||
  process.env.GAS_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbzk62kyLViOPyVBss7qtChwW1qg8OoIEeltpo-JRxWjILxhZH3scotmyB6JHkur1Z8n/exec';

export async function handler(event, context) {
  // Tangani preflight OPTIONS jika dikirim browser
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
      body: '',
    };
  }

  const targetUrl = `${GAS_URL}${GAS_URL.includes('?') ? '&' : '?'}action=getDashboardData`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: true,
          message: 'Backend Google Apps Script tidak dapat diakses.',
        }),
      };
    }

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: true,
          message: 'Backend Google Apps Script tidak dapat diakses.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: true,
        message: 'Backend Google Apps Script tidak dapat diakses.',
      }),
    };
  }
}

export default handler;
