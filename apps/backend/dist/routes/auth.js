"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const index_1 = require("../index");
const client_1 = require("@prisma/client");
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    password: zod_1.z.string().min(6)
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const authRoutes = async (fastify) => {
    // Register user
    fastify.post('/register', async (request, reply) => {
        try {
            const { email, name, password } = RegisterSchema.parse(request.body);
            const existingUser = await index_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    error: 'User already exists'
                });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await index_1.prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: client_1.Role.USER
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
            return {
                success: true,
                data: { user, token }
            };
        }
        catch (error) {
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
            const user = await index_1.prisma.user.findUnique({
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
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return reply.status(401).send({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                data: { user: userWithoutPassword, token }
            };
        }
        catch (error) {
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
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
                request.user = decoded;
            }
            catch (error) {
                return reply.status(401).send({ success: false, error: 'Invalid token' });
            }
        }
    }, async (request) => {
        const user = await index_1.prisma.user.findUnique({
            where: { id: request.user.userId },
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
exports.default = authRoutes;
