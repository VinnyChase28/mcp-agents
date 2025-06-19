import { getMCPClientManager } from "@mcp-agents/utils/mcp-client";

export async function POST() {
  // Only allow this in development
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "This endpoint is only available in development" },
      { status: 403 },
    );
  }

  try {
    const manager = getMCPClientManager();
    
    // Close all existing MCP connections
    await manager.closeAll();
    
    console.log("🔄 All MCP servers restarted");
    
    return Response.json({ 
      success: true, 
      message: "MCP servers restarted successfully" 
    });
  } catch (error) {
    console.error("Failed to restart MCP servers:", error);
    return Response.json(
      { error: "Failed to restart MCP servers" },
      { status: 500 },
    );
  }
} 