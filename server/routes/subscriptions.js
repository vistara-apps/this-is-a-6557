import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get current subscription
router.get('/current', catchAsync(async (req, res) => {
  const user = req.user;
  
  let stripeSubscription = null;
  if (user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
        limit: 1
      });
      stripeSubscription = subscriptions.data[0] || null;
    } catch (error) {
      logger.error('Stripe subscription fetch error:', error);
    }
  }
  
  const subscription = {
    plan: user.subscriptionPlan,
    status: user.subscriptionStatus,
    endDate: user.subscriptionEndDate,
    limits: user.getSubscriptionLimits(),
    stripeSubscription
  };
  
  res.json({
    status: 'success',
    data: { subscription }
  });
}));

// Create checkout session
router.post('/checkout', catchAsync(async (req, res) => {
  const { plan, billingCycle = 'monthly' } = req.body;
  const user = req.user;
  
  if (!['starter', 'pro', 'business'].includes(plan)) {
    throw new AppError('Invalid subscription plan', 400, 'INVALID_PLAN');
  }
  
  // Price mapping (in cents)
  const prices = {
    starter: { monthly: 2900, yearly: 29000 },
    pro: { monthly: 7900, yearly: 79000 },
    business: { monthly: 19900, yearly: 199000 }
  };
  
  const priceAmount = prices[plan][billingCycle];
  
  try {
    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = customerId;
      await user.save();
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SocialSync AI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `${billingCycle} subscription`
            },
            unit_amount: priceAmount,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?subscription=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan,
        billingCycle
      }
    });
    
    logger.logSubscriptionEvent('checkout_session_created', user._id, {
      plan,
      billingCycle,
      sessionId: session.id
    });
    
    res.json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
    
  } catch (error) {
    logger.error('Stripe checkout error:', error);
    throw new AppError('Failed to create checkout session', 500, 'CHECKOUT_ERROR');
  }
}));

// Cancel subscription
router.post('/cancel', catchAsync(async (req, res) => {
  const user = req.user;
  
  if (!user.stripeCustomerId) {
    throw new AppError('No active subscription found', 400, 'NO_SUBSCRIPTION');
  }
  
  try {
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active'
    });
    
    if (subscriptions.data.length === 0) {
      throw new AppError('No active subscription found', 400, 'NO_ACTIVE_SUBSCRIPTION');
    }
    
    // Cancel the subscription at period end
    const subscription = subscriptions.data[0];
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });
    
    logger.logSubscriptionEvent('subscription_cancelled', user._id, {
      subscriptionId: subscription.id,
      cancelAtPeriodEnd: true
    });
    
    res.json({
      status: 'success',
      message: 'Subscription will be cancelled at the end of the current billing period'
    });
    
  } catch (error) {
    logger.error('Stripe cancellation error:', error);
    throw new AppError('Failed to cancel subscription', 500, 'CANCELLATION_ERROR');
  }
}));

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
}));

// Webhook event handlers
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  
  const user = await User.findById(userId);
  if (user) {
    user.subscriptionPlan = plan;
    user.subscriptionStatus = 'active';
    await user.save();
    
    logger.logSubscriptionEvent('subscription_activated', userId, { plan });
  }
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const user = await User.findOne({ stripeCustomerId: customerId });
  
  if (user) {
    user.subscriptionStatus = 'active';
    await user.save();
    
    logger.logSubscriptionEvent('payment_succeeded', user._id, {
      invoiceId: invoice.id,
      amount: invoice.amount_paid
    });
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const user = await User.findOne({ stripeCustomerId: customerId });
  
  if (user) {
    user.subscriptionStatus = 'past_due';
    await user.save();
    
    logger.logSubscriptionEvent('payment_failed', user._id, {
      invoiceId: invoice.id,
      amount: invoice.amount_due
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const user = await User.findOne({ stripeCustomerId: customerId });
  
  if (user) {
    user.subscriptionStatus = 'cancelled';
    user.subscriptionPlan = 'starter';
    await user.save();
    
    logger.logSubscriptionEvent('subscription_deleted', user._id, {
      subscriptionId: subscription.id
    });
  }
}

export default router;
