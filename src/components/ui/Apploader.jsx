// Import the Loader2 icon component from Lucide React for the spinning loader animation
import { Loader2 } from "lucide-react";

// Define the main AppLoader component that displays a loading screen
// Accepts a 'message' prop with a default value if none is provided
export default function AppLoader({
  message = "Loading Sales Management System...",
}) {
  return (
    // Container div that centers the loader and message on the screen
    <div
      style={{
        display: "flex", // Enables flexbox layout
        flexDirection: "column", // Stacks children vertically
        alignItems: "center", // Centers children horizontally
        justifyContent: "center", // Centers children vertically
        minHeight: "100vh", // Takes up full viewport height
        gap: "16px", // Adds spacing between child elements
        // Creates a dark gradient background
        background:
          "linear-gradient(135deg, #0f0c29 0%, #1a0533 40%, #0d1b3e 100%)",
        color: "white", // Sets text color to white
      }}
    >
      {/* Spinning loader icon with size 48px and infinite rotation animation */}
      <Loader2 size={48} style={{ animation: "spin 1s linear infinite" }} />

      {/* Paragraph displaying the loading message */}
      <p style={{ fontSize: "16px", fontWeight: 500 }}>{message}</p>

      {/* Inject custom CSS keyframe animation for the spinning effect */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }   // Starting position
            to { transform: rotate(360deg); }   // Full rotation
          }
        `}
      </style>
    </div>
  );
}
