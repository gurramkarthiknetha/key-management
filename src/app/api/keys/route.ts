import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Key } from '@/models';
import { withAuth, withHODOrAdmin, AuthenticatedRequest } from '@/middleware/auth';
import { generateKeyQRData, generateQRCode } from '@/utils/qr';
import { canAccessDepartmentData } from '@/utils/auth';
import { ApiResponse, KeyStatus, UserRole } from '@/types';

// GET /api/keys - Get all keys
async function getKeysHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const currentUser = req.user!;

    // Build query based on user permissions
    const query: any = { isActive: true };
    
    // Non-admin users can only see keys from their department
    if (currentUser.role !== UserRole.SECURITY_INCHARGE) {
      query.department = currentUser.department;
    } else if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { keyId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get keys with pagination and populate current holder
    const [keys, total] = await Promise.all([
      Key.find(query)
        .populate('currentHolder', 'name employeeId email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Key.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        keys,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get keys error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/keys - Create new key (HOD or Admin only)
async function createKeyHandler(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    const { keyId, name, description, department, location, category, priority, maxLoanDuration } = body;
    const currentUser = req.user!;

    // Validate input
    if (!keyId || !name || !department || !location) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key ID, name, department, and location are required'
      }, { status: 400 });
    }

    // Check if user can create keys for this department
    if (!canAccessDepartmentData(currentUser.role, currentUser.department, department)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Insufficient permissions for this department'
      }, { status: 403 });
    }

    // Check if key ID already exists
    const existingKey = await Key.findOne({ keyId });
    if (existingKey) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Key with this ID already exists'
      }, { status: 409 });
    }

    // Create new key
    const newKey = new Key({
      keyId,
      name,
      description,
      department,
      location,
      category,
      priority: priority || 'medium',
      maxLoanDuration: maxLoanDuration || 24,
      qrCode: '' // Will be updated after key is saved
    });

    // Save key to get the ID
    const savedKey = await newKey.save();

    // Generate QR code for the key
    const qrData = generateKeyQRData(savedKey._id.toString());
    const qrCodeDataURL = await generateQRCode(qrData);

    // Update key with QR code
    savedKey.qrCode = qrCodeDataURL;
    await savedKey.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: savedKey,
      message: 'Key created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create key error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export const GET = withAuth(getKeysHandler);
export const POST = withHODOrAdmin(createKeyHandler);
