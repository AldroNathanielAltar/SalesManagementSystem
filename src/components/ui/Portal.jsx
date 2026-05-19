import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Portal component that renders children outside the parent DOM hierarchy, directly into document.body
export default function Portal({ children }) {
  // Track if component has mounted on client side to avoid SSR hydration mismatches
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after component mounts
    setMounted(true);
    // Cleanup: set mounted to false when component unmounts
    return () => setMounted(false);
  }, []);

  // Prevent rendering on server or before mounting to avoid portal issues
  if (!mounted) return null;

  // Render children directly into body using React Portal
  return createPortal(children, document.body);
}
