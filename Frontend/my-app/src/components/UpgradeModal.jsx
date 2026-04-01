import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UpgradeModal = ({ isOpen, onClose, usesRemaining, resetDate }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-linear-to-br from-purple-100 to-pink-100 rounded-full p-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Unlock Unlimited Access
            </h2>

            {/* Description */}
            <p className="text-center text-slate-600 mb-6">
              You've used all your monthly Space Analysis runs. Upgrade to Advanced for unlimited access and more features.
            </p>

            {/* Stats */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="font-semibold text-slate-900">{usesRemaining}/10 uses remaining</p>
                </div>
              </div>
              {resetDate && (
                <p className="text-xs text-slate-500">
                  Next reset: {new Date(resetDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-semibold text-slate-900">Advanced Tier includes:</p>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Unlimited Space Analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Advanced recommendations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Priority support
                </li>
              </ul>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600">Just</p>
              <p className="text-3xl font-bold text-slate-900">
                $10<span className="text-lg text-slate-600">/month</span>
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleUpgrade}
                className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Upgrade Now
                <ArrowRight size={18} />
              </button>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-200 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
