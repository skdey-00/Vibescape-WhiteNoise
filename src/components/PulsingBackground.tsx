import { motion } from "framer-motion"

export const PulsingBackground = () => (
  <motion.div
    className="absolute inset-0 -z-10"
    animate={{ scale: "var(--pulse-scale)" }}
    transition={{ type: "spring", stiffness: 40, damping: 20 }}
    style={{
      background: "radial-gradient(circle, rgba(255,200,200,0.25), transparent 60%)"
    }}
  />
)
