// src/app/api/services/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePassword, hashPassword } from '@/lib/password';
import { sendLoginCredentials } from '@/lib/email';
import prisma from '@/lib/database';
import { generateAutoLoginToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateOrderId } from '@/lib/orderUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      // Form data
      directorName, directorCompany, directorEmail,
      name, email, phone, relation,
      deceasedName, dateOfBirth, dateOfPassing, serviceDate, specialRequests, // Added serviceDate
      // Service data
      servicePlan, servicePrice
    } = body;

    // Validate required fields - now including serviceDate
    if (!email || !name || !phone || !relation || !deceasedName || !dateOfBirth || !dateOfPassing || !serviceDate || !servicePlan || !servicePrice) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields. Please check that all required information is provided.' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let user;
    let password = '';
    let isNewUser = false;
    let order = null;

    if (existingUser) {
      // Use existing user
      user = existingUser;
    } else {
      // Generate password for the new user
      isNewUser = true;
      password = generatePassword();
      const hashedPassword = await hashPassword(password);

      // Create user with ONLY the basic user info
      try {
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone
          }
        });
      } catch (userCreateError) {
        console.error('Error creating user with minimal fields:', userCreateError);
        
        // If that fails, there might be a Prisma schema mismatch - use type assertion to force it
        const userData = {
          email,
          password: hashedPassword,
          name,
          phone
        } as any;
        
        user = await prisma.user.create({ data: userData });
      }
    }

    // Generate the new MFF formatted order ID
    const orderId = await generateOrderId(prisma);
    
    // Try to create an order
    try {
      // Create the order using Prisma client
      order = await prisma.order.create({
        data: {
          id: orderId,
          userId: user.id,
          relation,
          servicePlan,
          servicePrice: parseFloat(servicePrice.toString()),
          directorName: directorName || null,
          directorCompany: directorCompany || null,
          directorEmail: directorEmail || null,
          deceasedName,
          dateOfBirth: new Date(dateOfBirth),
          dateOfPassing: new Date(dateOfPassing),
          serviceDate: serviceDate ? new Date(serviceDate) : null, // Add the new field as DateTime
          specialRequests: specialRequests || null,
          status: 'pending',
          updatedAt: new Date()
        }
      });
      
      // Create initial form progress entry
      try {
        await prisma.user_form_progress.create({
          data: {
            orderId: orderId,
            userId: user.id,
            formData: {},
            currentStep: 1,
            isCompleted: false
          }
        });
      } catch (formProgressError) {
        console.error('Error creating form progress:', formProgressError);
      }
    } catch (orderError) {
      console.error('Error creating order:', orderError);
      
      // If Prisma client fails, try raw SQL queries as a fallback
      try {
        await prisma.$executeRaw`
          INSERT INTO \`order\` (
            id, userId, relation, servicePlan, servicePrice,
            directorName, directorCompany, directorEmail,
            deceasedName, dateOfBirth, dateOfPassing, serviceDate,
            specialRequests, status, createdAt, updatedAt
          ) VALUES (
            ${orderId}, ${user.id}, ${relation}, ${servicePlan}, ${parseFloat(servicePrice.toString())},
            ${directorName || null}, ${directorCompany || null}, ${directorEmail || null},
            ${deceasedName}, ${new Date(dateOfBirth)}, ${new Date(dateOfPassing)}, ${serviceDate ? new Date(serviceDate) : null},
            ${specialRequests || null}, 'pending', NOW(), NOW()
          )
        `;
        
        // Get the created order
        const orders = await prisma.$queryRaw`
          SELECT * FROM \`order\` WHERE id = ${orderId} LIMIT 1
        `;
        
        if (Array.isArray(orders) && orders.length > 0) {
          order = orders[0];
          
          // Create initial form progress entry
          try {
            await prisma.user_form_progress.create({
              data: {
                orderId: orderId,
                userId: user.id,
                formData: {},
                currentStep: 1,
                isCompleted: false
              }
            });
          } catch (formProgressError) {
            console.error('Error creating form progress:', formProgressError);
          }
        }
      } catch (rawQueryError) {
        console.error('Error creating order with raw query:', rawQueryError);
      }
    }

    // For new users, send login credentials via email
    if (isNewUser && password) {
      await sendLoginCredentials(email, password, {
        servicePlan,
        servicePrice,
        deceasedName,
        dateOfBirth,
        dateOfPassing,
        serviceDate // Include the new field
      });
    }

    // Generate auto-login token for new users
    const autoLoginToken = isNewUser ? 
      generateAutoLoginToken(user.email, user.id, 60) : null;
    
    // Set the order ID cookie
    if (orderId) {
      cookies().set('currentOrderId', orderId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }
    
    // Return success response
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ 
      success: true,
      message: isNewUser 
        ? 'Registration successful. Please check your email for login credentials.'
        : 'Order created successfully.',
      user: userWithoutPassword,
      order: order,
      orderId: orderId,
      isNewUser: isNewUser,
      requiresLogin: isNewUser,
      loginToken: autoLoginToken,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'An error occurred during registration. Please try again later.';
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'This email is already registered. Please use a different email address.';
      } else if (error.message.includes('database')) {
        errorMessage = 'Database connection issue. Please try again later.';
      } else if (error.message.includes('email')) {
        errorMessage = 'We were unable to send the login email. Please try again or contact support.';
      }
      
      console.error('Detailed error:', error.message);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}