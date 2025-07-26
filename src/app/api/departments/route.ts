import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Department from '@/models/Department';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const departments = await Department.find({ isActive: true })
      .select('name code')
      .sort({ name: 1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: departments
    }, { status: 200 });

  } catch (error) {
    console.error('Departments fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch departments'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name and code are required'
      }, { status: 400 });
    }

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() }
      ]
    });

    if (existingDepartment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Department with this name or code already exists'
      }, { status: 409 });
    }

    const newDepartment = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      isActive: true
    });

    await newDepartment.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newDepartment,
      message: 'Department created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Department creation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create department'
    }, { status: 500 });
  }
}
