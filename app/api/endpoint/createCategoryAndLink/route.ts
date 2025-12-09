import { NextRequest, NextResponse } from 'next/server';

type CreateCategoryPayload = {
  id: string;
  kind: { major: string; minor: string };
  created: string;
  terminated: string;
  name: { startTime: string; endTime: string; value: string };
  metadata: unknown[];
  attributes: unknown[];
  relationships: unknown[];
};

type LinkRelationshipPayload = {
  id: string;
  kind: Record<string, never>;
  created: string;
  terminated: string;
  name: Record<string, never>;
  metadata: unknown[];
  attributes: unknown[];
  relationships: Array<{
    key: string;
    value: {
      relatedEntityId: string;
      startTime: string;
      endTime: string;
      id: string;
      name: string;
    };
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      updateApiUrl,
      entityId,
      categoryId,
      categoryMinorKind,
      categoryName,
      date,
    } = body;

    if (!updateApiUrl || !entityId || !categoryId || !categoryMinorKind || !categoryName || !date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // 1) Create category
    const createPayload: CreateCategoryPayload = {
      id: categoryId,
      kind: {
        major: 'Category',
        minor: categoryMinorKind,
      },
      created: date,
      terminated: '',
      name: {
        startTime: date,
        endTime: '',
        value: categoryName,
      },
      metadata: [],
      attributes: [],
      relationships: [],
    };

    const createRes = await fetch(`${updateApiUrl}/entities/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
      signal: AbortSignal.timeout(30000),
    });

    const createData = await createRes.json().catch(() => ({}));

    if (!createRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: 'create-category',
          error: createData?.message || 'Failed to create category',
          response: createData,
        },
        { status: createRes.status }
      );
    }

    // 2) Link category to entity
    const relationshipId = `${entityId}-to-${categoryId}`;

    const linkPayload: LinkRelationshipPayload = {
      id: entityId,
      kind: {},
      created: '',
      terminated: '',
      name: {},
      metadata: [],
      attributes: [],
      relationships: [
        {
          key: 'AS_CATEGORY',
          value: {
            relatedEntityId: categoryId,
            startTime: date,
            endTime: '',
            id: relationshipId,
            name: 'AS_CATEGORY',
          },
        },
      ],
    };

    const linkRes = await fetch(`${updateApiUrl}/entities/${encodeURIComponent(entityId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkPayload),
      signal: AbortSignal.timeout(30000),
    });

    const linkData = await linkRes.json().catch(() => ({}));

    if (!linkRes.ok) {
      return NextResponse.json(
        {
          success: false,
          step: 'link-relationship',
          error: linkData?.message || 'Failed to link category to entity',
          response: linkData,
        },
        { status: linkRes.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        category: createData,
        relationship: linkData,
        relationshipId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in createCategoryAndLink:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout',
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

