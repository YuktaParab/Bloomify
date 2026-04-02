import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Leaf, Lock, Calendar } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";
import { auth } from "./Firebase";

const PricingPlans = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      if (!user?.email) {
        console.log("No user email available yet");
        return;
      }
      
      const url = `http://localhost:3001/subscription/${user.email}`;
      console.log("Fetching subscription from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error("❌ Backend error:", data);
        throw new Error(data.details || data.error || "Failed to fetch subscription");
      }
      
      console.log("✓ Subscription data received:", data);
      setSubscription(data);
    } catch (error) {
      console.error("❌ Error fetching subscription:", error.message);
      // Set a default subscription to prevent blank state
      setSubscription({
        email: user?.email,
        tier: "Beginner",
        subscriptionStatus: "trial",
        trialUsesRemaining: 10,
        canAccessSpaceAnalysis: true,
        daysUntilReset: 30
      });
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchSubscriptionStatus();
    }
  }, [user, fetchSubscriptionStatus]);

  const handleUpgrade = async () => {
    if (!user) {
      alert("Please sign in first");
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch("http://localhost:3001/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        // In production, redirect to Stripe checkout
        alert("✅ Subscription upgraded successfully! You now have unlimited Space Analysis access.");
        await fetchSubscriptionStatus();
      } else {
        alert("❌ Upgrade failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      alert("Error processing upgrade");
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    {
      name: "Beginner",
      price: "Free",
      description: "Perfect for plant lovers just starting",
      features: [
        "10 Space Analysis uses per month",
        "Access to all 567 plants",
        "Plant care guides & tips",
        "Voice-guided growing steps",
        "Monthly trial reset",
        "Community chat"
      ],
      cta: subscription?.tier === "Beginner" && subscription?.subscriptionStatus === "trial" ? "Current Plan" : "Get Started",
      badge: "Popular",
      color: "from-green-400 to-emerald-500",
      current: subscription?.tier === "Beginner" && subscription?.subscriptionStatus === "trial"
    },
    {
      name: "Advanced",
      price: "$10",
      period: "/month",
      description: "For serious plant enthusiasts",
      features: [
        "Unlimited Space Analysis",
        "All Beginner features",
        "Priority support",
        "Advanced plant recommendations",
        "Save custom spaces",
        "Export care reports",
        "Ad-free experience"
      ],
      cta: "Upgrade Now",
      badge: "Premium",
      color: "from-purple-400 to-pink-500",
      highlighted: true,
      current: subscription?.tier === "Advanced" && subscription?.subscriptionStatus === "active"
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the perfect plan to grow your plant collection. Start free with 10 monthly Space Analysis uses.
            </p>
          </motion.div>

          {/* Current Status */}
          {subscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-3"
            >
              <Leaf className="text-blue-600" size={20} />
              <div>
                <p className="font-semibold text-blue-900">
                  Current Plan: <span className="text-lg">{subscription.tier} {subscription.subscriptionStatus === "trial" ? "(Free Trial)" : "(Premium)"}</span>
                </p>
                {subscription.tier === "Beginner" && subscription.subscriptionStatus === "trial" && (
                  <p className="text-sm text-blue-700">
                    Space Analysis uses remaining: <strong>{subscription.trialUsesRemaining}/10</strong> | Reset in {subscription.daysUntilReset} days
                  </p>
                )}
                {subscription.tier === "Advanced" && subscription.subscriptionStatus === "active" && (
                  <p className="text-sm text-blue-700">
                    Subscription valid until: {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.6 }}
                className={`relative rounded-2xl overflow-hidden transform transition-all duration-300 ${
                  plan.highlighted ? "md:scale-105 md:shadow-2xl" : "shadow-lg hover:shadow-xl"
                } ${plan.current ? "ring-4 ring-green-400" : ""}`}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${plan.color} opacity-10`}
                />

                {/* Card Content */}
                <div className="relative p-8 bg-white">
                  {/* Badge */}
                  {plan.badge && (
                    <div className="inline-block mb-4">
                      <span className={`text-xs font-bold px-4 py-1 rounded-full bg-linear-to-r ${plan.color} text-white`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {plan.current && (
                    <div className="inline-block mb-4 ml-2">
                      <span className="text-xs font-bold px-4 py-1 rounded-full bg-green-500 text-white">
                        ✓ Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-lg text-slate-600">{plan.period}</span>}
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm mb-6">{plan.description}</p>

                  {/* CTA Button */}
                  <button
                    onClick={handleUpgrade}
                    disabled={plan.current || upgrading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6 ${
                      plan.current
                        ? "bg-slate-200 text-slate-700 cursor-not-allowed"
                          : `bg-linear-to-r ${plan.color} text-white hover:shadow-lg transform hover:-translate-y-1 ${
                            upgrading ? "opacity-50" : ""
                          }`
                    }`}
                  >
                    {plan.current ? "✓ " + plan.cta : upgrading ? "Processing..." : plan.cta}
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check
                          size={20}
                          className={`text-green-500 mt-0.5 shrink-0 ${
                            plan.name === "Advanced" ? "text-green-600" : ""
                          }`}
                        />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Zap size={18} className="text-yellow-500" />
                  What's the difference between Space Analysis uses?
                </h4>
                <p className="text-slate-600 text-sm">
                  Beginner users get 10 free Space Analysis uses per month. Each analysis helps identify the best plants for your light and space conditions. After reaching the limit, you can upgrade to Advanced for unlimited analyses.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  When does my trial reset?
                </h4>
                <p className="text-slate-600 text-sm">
                  Your 10 monthly uses reset on the same date each month. If you reach your limit before the reset date, you can upgrade to Advanced to unlock unlimited access immediately.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Lock size={18} className="text-purple-500" />
                  Can I cancel my subscription?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes! You can downgrade to Beginner at any time. Your subscription will be active until the end of the billing period, and you'll have access to Beginner features afterward.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Leaf size={18} className="text-green-500" />
                  What if I don't use my monthly uses?
                </h4>
                <p className="text-slate-600 text-sm">
                  Unused monthly uses do not roll over. However, your runs reset automatically each month, so you always have 5 new uses to start with.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PricingPlans;
