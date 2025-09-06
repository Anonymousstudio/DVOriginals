import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../index';
import { Role } from '@prisma/client';

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register user
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, name, password } = RegisterSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: 'User already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.USER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        data: { user, token }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Registration failed'
      });
    }
  });

  // Login user
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          createdAt: true
        }
      });

      if (!user || !user.password) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: { user: userWithoutPassword, token }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Login failed'
      });
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return reply.status(401).send({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        request.user = decoded;
      } catch (error) {
        return reply.status(401).send({ success: false, error: 'Invalid token' });
      }
    }
  }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: (request as any).user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return {
      success: true,
      data: { user }
    };
  });
};

export default authRoutes;