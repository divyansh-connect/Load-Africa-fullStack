const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const { generateToken } = require('../utils/jwt');

const registerUser = async (data) => {
  const { email, password, role, firstName, lastName } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Prisma Transaction for User + Profile Creation + Wallet
  const result = await prisma.$transaction(async (tx) => {
    const status = ['DRIVER', 'FLEET_OWNER', 'PLANT_OWNER', 'BROKER'].includes(role) ? 'PENDING' : 'ACTIVE';

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status,
      },
    });

    // Create Profile Based on Role
    if (role === 'CUSTOMER') {
      await tx.customer.create({ data: { user_id: user.id } });
    } else if (role === 'DRIVER') {
      await tx.driver.create({ data: { user_id: user.id } });
    } else if (role === 'FLEET_OWNER') {
      await tx.fleetOwner.create({ data: { user_id: user.id } });
    } else if (role === 'PLANT_OWNER') {
      await tx.plantOwner.create({ data: { user_id: user.id } });
    } else if (role === 'BROKER') {
      await tx.broker.create({ data: { user_id: user.id } });
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      await tx.admin.create({ data: { user_id: user.id } });
    }

    // Create Wallet
    await tx.wallet.create({ data: { user_id: user.id } });

    // Create Audit Log
    await tx.activityLog.create({
      data: {
        user_id: user.id,
        action: 'REGISTER',
        description: 'User registered via Auth Service',
      }
    });

    return user;
  });

  return { id: result.id, email: result.email, role: result.role };
};

const DUMMY_USERS = {
  'patrice@arm.co.za': 'CUSTOMER',
  'sipho.zuma@load-driver.co.za': 'DRIVER',
  'fleet@loadafrica.co.za': 'FLEET_OWNER',
  'plant@loadafrica.co.za': 'PLANT_OWNER',
  'admin@loadafrica.com': 'ADMIN',
  'lwazi.dlamini@loadafrica-broker.co.za': 'BROKER'
};

const loginUser = async (email, password) => {
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    if (DUMMY_USERS[email]) {
      // Auto-register dummy user
      const role = DUMMY_USERS[email];
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email, password: hashedPassword, role, status: 'ACTIVE' },
        });
        if (role === 'CUSTOMER') await tx.customer.create({ data: { user_id: newUser.id } });
        else if (role === 'DRIVER') await tx.driver.create({ data: { user_id: newUser.id } });
        else if (role === 'FLEET_OWNER') await tx.fleetOwner.create({ data: { user_id: newUser.id } });
        else if (role === 'PLANT_OWNER') await tx.plantOwner.create({ data: { user_id: newUser.id } });
        else if (role === 'BROKER') await tx.broker.create({ data: { user_id: newUser.id } });
        else if (role === 'ADMIN') await tx.admin.create({ data: { user_id: newUser.id } });
        await tx.wallet.create({ data: { user_id: newUser.id } });
        return newUser;
      });
    } else {
      throw new Error('Invalid email or password');
    }
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Auto-activate dummy users if they are suspended/pending
  if (user.status !== 'ACTIVE' && DUMMY_USERS[email]) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' }
    });
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('Account is suspended or inactive');
  }

  const token = generateToken(user.id, user.role);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { last_login: new Date() }
  });

  await prisma.activityLog.create({
    data: {
      user_id: user.id,
      action: 'LOGIN',
      description: 'User logged in via Auth Service',
    }
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = { registerUser, loginUser };
