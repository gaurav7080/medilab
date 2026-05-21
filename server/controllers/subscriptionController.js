const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/db');

// ─── Plan Pricing Config ─────────────────────────────────────
const PLAN_CONFIG = {
    // Patient plans
    'Plus':       { amount: 19900,  label: 'Plus Plan',       role: 'Patient'  },
    'Pro':        { amount: 49900,  label: 'Pro Plan',        role: 'Patient'  },
    // Admin / Lab plans
    'Plus_Admin': { amount: 99900,  label: 'Plus (Lab)',      role: 'Admin'    },
    'Enterprise': { amount: 249900, label: 'Enterprise Plan', role: 'Admin'    },
};

// Helper: get plan key based on user role
function getPlanKey(planName, role) {
    if (role === 'Admin' && planName === 'Plus') return 'Plus_Admin';
    return planName;
}

// ─── Initialize Razorpay Instance ────────────────────────────
function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret || key_id === 'YOUR_RAZORPAY_KEY_ID') {
        return null;
    }
    return new Razorpay({ key_id, key_secret });
}

// ═══════════════════════════════════════════════════════════════
// POST /api/subscription/create-order
// Creates a Razorpay order for the selected plan
// ═══════════════════════════════════════════════════════════════
exports.createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!plan) return res.status(400).json({ error: 'Plan name is required' });

        const planKey = getPlanKey(plan, req.user.role);
        const planConfig = PLAN_CONFIG[planKey];

        if (!planConfig) {
            return res.status(400).json({ error: `Invalid plan: ${plan}` });
        }

        // Check if downgrading to Basic/Standard (free)
        if (plan === 'Basic' || plan === 'Standard') {
            return res.status(400).json({ error: 'Cannot purchase the free plan' });
        }

        const razorpay = getRazorpayInstance();

        if (!razorpay) {
            // ── Demo/Test Mode: No Razorpay keys configured ──
            // Generate a mock order so frontend can still function
            const mockOrderId = 'order_demo_' + Date.now();
            
            // Record pending subscription
            const { data: sub } = await supabase.from('subscriptions').insert({
                user_id: req.user.id,
                plan: plan,
                amount: planConfig.amount / 100,
                status: 'pending',
                razorpay_order_id: mockOrderId,
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }).select().single();

            return res.json({
                success: true,
                demo_mode: true,
                order: {
                    id: mockOrderId,
                    amount: planConfig.amount,
                    currency: 'INR',
                },
                subscription_id: sub?.id,
                key: 'demo_key',
                plan: plan,
                message: 'Running in demo mode. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for live payments.'
            });
        }

        // ── Live Mode: Create actual Razorpay order ──
        const options = {
            amount: planConfig.amount, // amount in paise
            currency: 'INR',
            receipt: `medilab_${req.user.id.slice(-8)}_${Date.now()}`,
            notes: {
                user_id: req.user.id,
                plan: plan,
                user_email: req.user.email,
                user_name: req.user.name
            }
        };

        const order = await razorpay.orders.create(options);

        // Record pending subscription
        const { data: sub } = await supabase.from('subscriptions').insert({
            user_id: req.user.id,
            plan: plan,
            amount: planConfig.amount / 100,
            status: 'pending',
            razorpay_order_id: order.id,
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }).select().single();

        // Record pending payment
        await supabase.from('payments').insert({
            user_id: req.user.id,
            subscription_id: sub?.id,
            amount: planConfig.amount / 100,
            razorpay_order_id: order.id,
            status: 'pending',
            description: `${planConfig.label} - Monthly Subscription`
        });

        res.json({
            success: true,
            demo_mode: false,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            subscription_id: sub?.id,
            key: process.env.RAZORPAY_KEY_ID,
            plan: plan
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/subscription/verify-payment
// Verifies Razorpay payment signature and activates subscription
// ═══════════════════════════════════════════════════════════════
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, demo_mode } = req.body;

        if (!plan) return res.status(400).json({ error: 'Plan is required' });

        // ── Demo Mode Verification ──
        if (demo_mode) {
            // Activate subscription directly in demo mode
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            // Update subscription record
            await supabase.from('subscriptions')
                .update({
                    status: 'active',
                    razorpay_payment_id: 'demo_pay_' + Date.now(),
                    payment_method: 'demo',
                    start_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('razorpay_order_id', razorpay_order_id)
                .eq('user_id', req.user.id);

            // Record payment
            await supabase.from('payments')
                .upsert({
                    user_id: req.user.id,
                    amount: PLAN_CONFIG[getPlanKey(plan, req.user.role)]?.amount / 100 || 0,
                    razorpay_order_id: razorpay_order_id,
                    razorpay_payment_id: 'demo_pay_' + Date.now(),
                    status: 'captured',
                    method: 'demo',
                    description: `${plan} Plan - Demo Payment`
                }, { onConflict: 'razorpay_order_id', ignoreDuplicates: true });

            // Upgrade user subscription
            await supabase.from('users')
                .update({
                    subscription: plan,
                    subscription_end_date: endDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', req.user.id);

            // Sync with lab if user is Admin
            if (req.user.role === 'Admin' && req.user.lab_id) {
                await supabase.from('labs')
                    .update({
                        subscription: plan,
                        subscription_end_date: endDate,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', req.user.lab_id);
            }

            // Get updated user
            const { data: updatedUser } = await supabase.from('users').select('*, labs(*)').eq('id', req.user.id).single();
            if (updatedUser) delete updatedUser.password;

            return res.json({
                success: true,
                message: `${plan} Plan activated successfully! (Demo Mode)`,
                user: updatedUser
            });
        }

        // ── Live Mode Verification ──
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification fields' });
        }

        // Verify signature using Razorpay HMAC SHA256
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Mark payment as failed
            await supabase.from('payments')
                .update({ status: 'failed' })
                .eq('razorpay_order_id', razorpay_order_id);

            await supabase.from('subscriptions')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('razorpay_order_id', razorpay_order_id);

            return res.status(400).json({ error: 'Payment verification failed - invalid signature' });
        }

        // ── Payment Verified! Activate subscription ──
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Update subscription
        await supabase.from('subscriptions')
            .update({
                status: 'active',
                razorpay_payment_id,
                razorpay_signature,
                start_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('razorpay_order_id', razorpay_order_id)
            .eq('user_id', req.user.id);

        // Update payment record
        await supabase.from('payments')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'captured',
            })
            .eq('razorpay_order_id', razorpay_order_id);

        // Expire any previous active subscriptions
        await supabase.from('subscriptions')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .neq('razorpay_order_id', razorpay_order_id);

        // Update user subscription tier
        await supabase.from('users')
            .update({
                subscription: plan,
                subscription_end_date: endDate,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        // Sync with lab if user is Admin
        if (req.user.role === 'Admin' && req.user.lab_id) {
            await supabase.from('labs')
                .update({
                    subscription: plan,
                    subscription_end_date: endDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', req.user.lab_id);
        }

        // Get updated user
        const { data: updatedUser } = await supabase.from('users').select('*, labs(*)').eq('id', req.user.id).single();
        if (updatedUser) delete updatedUser.password;

        res.json({
            success: true,
            message: `${plan} Plan activated successfully!`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/subscription/current
// Get the user's current active subscription details
// ═══════════════════════════════════════════════════════════════
exports.getCurrentSubscription = async (req, res) => {
    try {
        // Get user with subscription info
        const { data: user } = await supabase
            .from('users')
            .select('subscription, subscription_end_date')
            .eq('id', req.user.id)
            .single();

        // Get active subscription details
        const { data: activeSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Check if subscription is expired
        let currentPlan = user?.subscription || 'Basic';
        let isExpired = false;

        if (user?.subscription_end_date && new Date(user.subscription_end_date) < new Date()) {
            isExpired = true;
            // Auto-downgrade to Basic
            if (currentPlan !== 'Basic' && currentPlan !== 'Standard') {
                const freePlan = req.user.role === 'Admin' ? 'Standard' : 'Basic';
                await supabase.from('users')
                    .update({ subscription: freePlan, updated_at: new Date().toISOString() })
                    .eq('id', req.user.id);

                if (req.user.role === 'Admin' && req.user.lab_id) {
                    await supabase.from('labs')
                        .update({
                            subscription: freePlan,
                            subscription_end_date: null,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', req.user.lab_id);
                }
                currentPlan = freePlan;

                if (activeSub) {
                    await supabase.from('subscriptions')
                        .update({ status: 'expired', updated_at: new Date().toISOString() })
                        .eq('id', activeSub.id);
                }
            }
        }

        res.json({
            success: true,
            subscription: {
                plan: currentPlan,
                end_date: user?.subscription_end_date,
                is_expired: isExpired,
                details: activeSub || null
            }
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/subscription/history
// Get the user's payment history
// ═══════════════════════════════════════════════════════════════
exports.getPaymentHistory = async (req, res) => {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select('*, subscriptions(plan, status)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        res.json({
            success: true,
            payments: payments || []
        });

    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/subscription/cancel
// Cancel the user's active subscription
// ═══════════════════════════════════════════════════════════════
exports.cancelSubscription = async (req, res) => {
    try {
        const freePlan = req.user.role === 'Admin' ? 'Standard' : 'Basic';

        // Cancel active subscriptions
        await supabase.from('subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('user_id', req.user.id)
            .eq('status', 'active');

        // Downgrade user to free plan
        await supabase.from('users')
            .update({
                subscription: freePlan,
                subscription_end_date: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        // Sync with lab if user is Admin
        if (req.user.role === 'Admin' && req.user.lab_id) {
            await supabase.from('labs')
                .update({
                    subscription: freePlan,
                    subscription_end_date: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', req.user.lab_id);
        }

        // Get updated user
        const { data: updatedUser } = await supabase.from('users').select('*, labs(*)').eq('id', req.user.id).single();
        if (updatedUser) delete updatedUser.password;

        res.json({
            success: true,
            message: 'Subscription cancelled. Downgraded to free plan.',
            user: updatedUser
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};
