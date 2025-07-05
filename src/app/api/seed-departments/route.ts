import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Department, User } from '@/models';
import { UserRole } from '@/types';
import { hashPassword } from '@/utils/auth';
import { generateUserQRData, generateQRCode } from '@/utils/qr';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if departments already exist
    const existingDepartments = await Department.countDocuments();
    if (existingDepartments > 0) {
      return NextResponse.json({
        success: true,
        message: 'Departments already exist',
        data: await Department.find({}).select('name code')
      });
    }

    // Create a default admin user first if none exists
    let adminUser = await User.findOne({ role: UserRole.SECURITY_INCHARGE });
    if (!adminUser) {
      // Create a temporary admin user for department creation
      const hashedPassword = await hashPassword('admin123');
      const qrData = generateUserQRData('ADMIN001', 'System Admin', UserRole.SECURITY_INCHARGE);
      const qrCode = await generateQRCode(qrData);

      adminUser = new User({
        name: 'System Admin',
        email: 'admin@institution.edu',
        employeeId: 'ADMIN001',
        password: hashedPassword,
        role: UserRole.SECURITY_INCHARGE,
        department: 'Administration',
        qrCode: qrCode,
        isActive: true
      });
      await adminUser.save();
    }

    // Default departments for educational institutions
    const defaultDepartments = [
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Computer Science and Engineering Department',
        location: 'Block A',
        contactEmail: 'cs@institution.edu'
      },
      {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Electrical and Electronics Engineering Department',
        location: 'Block B',
        contactEmail: 'ee@institution.edu'
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Mechanical Engineering Department',
        location: 'Block C',
        contactEmail: 'me@institution.edu'
      },
      {
        name: 'Civil Engineering',
        code: 'CE',
        description: 'Civil Engineering Department',
        location: 'Block D',
        contactEmail: 'ce@institution.edu'
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology Department',
        location: 'Block E',
        contactEmail: 'it@institution.edu'
      },
      {
        name: 'Administration',
        code: 'ADMIN',
        description: 'Administrative Department',
        location: 'Main Building',
        contactEmail: 'admin@institution.edu'
      },
      {
        name: 'Security',
        code: 'SEC',
        description: 'Security Department',
        location: 'Security Office',
        contactEmail: 'security@institution.edu'
      }
    ];

    const createdDepartments = [];

    for (const deptData of defaultDepartments) {
      const department = new Department({
        ...deptData,
        hodId: adminUser._id, // Temporarily assign admin as HOD
        isActive: true
      });

      await department.save();
      createdDepartments.push(department);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdDepartments.length} departments`,
      data: createdDepartments.map(dept => ({
        _id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description
      }))
    }, { status: 201 });

  } catch (error) {
    console.error('Seed departments error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed departments'
    }, { status: 500 });
  }
}
