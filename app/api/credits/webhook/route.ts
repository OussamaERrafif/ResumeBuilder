import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/credits-service'

/**
 * POST /api/credits/webhook
 * Handle payment provider webhooks (Stripe, PayPal, etc.)
 * 
 * IMPORTANT: This is a placeholder webhook handler.
 * When integrating with Stripe, you'll need to:
 * 1. Install stripe: npm install stripe
 * 2. Verify webhook signatures
 * 3. Handle different event types
 * 
 * Example Stripe webhook verification:
 * ```typescript
 * import Stripe from 'stripe'
 * 
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
 * const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
 * 
 * export async function POST(request: NextRequest) {
 *   const body = await request.text()
 *   const signature = request.headers.get('stripe-signature')!
 *   
 *   let event: Stripe.Event
 *   
 *   try {
 *     event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
 *   } catch (err) {
 *     return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
 *   }
 *   
 *   // Handle the event
 *   switch (event.type) {
 *     case 'checkout.session.completed':
 *       const session = event.data.object as Stripe.Checkout.Session
 *       await handleCheckoutComplete(session)
 *       break
 *     case 'customer.subscription.updated':
 *       // Handle subscription update
 *       break
 *     case 'customer.subscription.deleted':
 *       // Handle subscription cancellation
 *       break
 *   }
 *   
 *   return NextResponse.json({ received: true })
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // In production, verify webhook signature here
    // const signature = request.headers.get('stripe-signature')
    // if (!signature) {
    //   return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    // }

    const body = await request.json()
    const { type, userId, metadata } = body

    // Validate required fields
    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle different webhook event types
    switch (type) {
      case 'payment.success':
        // Credit purchase completed
        if (metadata?.type === 'credit_purchase') {
          const success = await PaymentService.handlePaymentSuccess(
            userId,
            'credit_purchase',
            metadata
          )
          
          if (!success) {
            console.error('Failed to process credit purchase for user:', userId)
            return NextResponse.json(
              { error: 'Failed to process payment' },
              { status: 500 }
            )
          }
          
          console.log(`Successfully added ${metadata.credits} credits to user ${userId}`)
        }
        break

      case 'subscription.created':
      case 'subscription.updated':
        // Subscription created or updated
        if (metadata?.type === 'subscription') {
          const success = await PaymentService.handlePaymentSuccess(
            userId,
            'subscription',
            metadata
          )
          
          if (!success) {
            console.error('Failed to process subscription for user:', userId)
            return NextResponse.json(
              { error: 'Failed to process subscription' },
              { status: 500 }
            )
          }
          
          console.log(`Successfully activated ${metadata.tier} subscription for user ${userId}`)
        }
        break

      case 'subscription.cancelled':
        // Subscription cancelled
        const cancelled = await PaymentService.cancelSubscription(userId)
        
        if (!cancelled) {
          console.error('Failed to cancel subscription for user:', userId)
        } else {
          console.log(`Successfully cancelled subscription for user ${userId}`)
        }
        break

      case 'payment.failed':
        // Payment failed - log for monitoring
        console.warn('Payment failed for user:', userId, metadata)
        break

      default:
        console.log('Unhandled webhook event type:', type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/credits/webhook
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    supportedEvents: [
      'payment.success',
      'subscription.created',
      'subscription.updated',
      'subscription.cancelled',
      'payment.failed',
    ],
  })
}
