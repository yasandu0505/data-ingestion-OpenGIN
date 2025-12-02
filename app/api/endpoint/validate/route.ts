import { NextRequest, NextResponse } from 'next/server';

// POST - Validate endpoint connections
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { readApiUrl, updateApiUrl } = body;

    // Validate required fields
    if (!readApiUrl || !updateApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Both readApiUrl and updateApiUrl are required',
        },
        { status: 400 }
      );
    }

    // Test both endpoints
    const results = {
      readApi: { success: false, error: null as string | null },
      updateApi: { success: false, error: null as string | null },
    };

    // Test READ API endpoint
    try {
      const readResponse = await fetch(readApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (readResponse.status >= 200 && readResponse.status < 500) {
        results.readApi.success = true;
      } else {
        results.readApi.error = `HTTP ${readResponse.status}: ${readResponse.statusText}`;
      }
    } catch (error) {
      results.readApi.error = error instanceof Error ? error.message : 'Connection failed';
    }

    // Test UPDATE API endpoint
    try {
      // Try a simple request to test if endpoint is reachable
      // You might want to use a specific test endpoint or method
      const updateResponse = await fetch(updateApiUrl, {
        method: 'GET', // Using GET for validation, adjust if needed
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (updateResponse.status >= 200 && updateResponse.status < 500) {
        results.updateApi.success = true;
      } else {
        results.updateApi.error = `HTTP ${updateResponse.status}: ${updateResponse.statusText}`;
      }
    } catch (error) {
      results.updateApi.error = error instanceof Error ? error.message : 'Connection failed';
    }

    // Determine overall success
    const allValid = results.readApi.success && results.updateApi.success;

    return NextResponse.json(
      {
        success: allValid,
        data: results,
        message: allValid
          ? 'Connection validated successfully'
          : 'One or more endpoints failed validation',
      },
      { status: allValid ? 200 : 400 }
    );
  } catch (error) {
    console.error('Error validating endpoints:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate endpoints',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

