import { Router, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const checkoutSchema = z.object({
  body: z.object({
    tier: z.enum(['premium', 'enterprise']),
  }),
});

// GET /api/subscription
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.userId!;

    const result = await query(
      'SELECT subscription_tier, subscription_status, stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      tier: user.subscription_tier,
      status: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscription/checkout
router.post(
  '/checkout',
  authenticate,
  validate(checkoutSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        throw new AppError('Stripe not configured', 500);
      }

      const userId = req.userId!;
      const { tier } = req.body;

      // Get user
      const userResult = await query(
        'SELECT email, stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = userResult.rows[0];

      // Pricing
      const prices: Record<string, string> = {
        premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
        enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
      };

      // Create or get Stripe customer
      let customerId = user.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        customerId = customer.id;

        await query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, userId]
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: prices[tier],
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        metadata: {
          userId,
          tier,
        },
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/subscription/cancel
router.post('/cancel', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const userId = req.userId!;

    // Get user's subscription
    const userResult = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].stripe_customer_id) {
      throw new AppError('No active subscription', 404);
    }

    const customerId = userResult.rows[0].stripe_customer_id;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      throw new AppError('No active subscription found', 404);
    }

    // Cancel subscription
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true,
    });

    await query(
      'UPDATE users SET subscription_status = $1 WHERE id = $2',
      ['cancelled', userId]
    );

    res.json({
      message: 'Subscription cancelled. Active until period end.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/subscription/invoices
router.get('/invoices', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const userId = req.userId!;

    const userResult = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].stripe_customer_id) {
      return res.json({ invoices: [] });
    }

    const customerId = userResult.rows[0].stripe_customer_id;

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10,
    });

    res.json({
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        amount: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        date: new Date(inv.created * 1000),
        pdf: inv.invoice_pdf,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Webhook handler (will be called by Stripe)
router.post('/webhook', async (req, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err}` });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;

      if (userId && tier) {
        await query(
          'UPDATE users SET subscription_tier = $1, subscription_status = $2 WHERE id = $3',
          [tier, 'active', userId]
        );
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userResult = await query(
        'SELECT id FROM users WHERE stripe_customer_id = $1',
        [customerId]
      );

      if (userResult.rows.length > 0) {
        const status = subscription.status === 'active' ? 'active' : 'cancelled';
        await query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          [status, userResult.rows[0].id]
        );
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;

