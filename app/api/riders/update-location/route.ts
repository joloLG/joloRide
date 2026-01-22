import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { riderId, orderId, location } = await request.json();

    if (!riderId || !location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: "Missing required fields: riderId, location.lat, location.lng" },
        { status: 400 }
      );
    }

    // For testing: allow location updates without strict order assignment check
    // In production, you might want to verify the rider is assigned to the order
    let order = null;
    let orderError = null;

    if (orderId) {
      const result = await supabase
        .from("orders")
        .select("id, rider_id, status")
        .eq("id", orderId)
        .single();
      
      order = result.data;
      orderError = result.error;
    }

    // For now, allow location updates if:
    // 1. No order ID provided (just updating rider location)
    // 2. Order exists and rider is assigned OR order is unassigned (for testing)
    if (orderId && (!order || orderError)) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update rider's current location in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        lat: location.lat,
        lng: location.lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", riderId);

    if (updateError) {
      console.error("Error updating rider location:", updateError);
      return NextResponse.json(
        { error: "Failed to update rider location" },
        { status: 500 }
      );
    }

    // If order exists, also update location history
    if (order) {
      const { error: historyError } = await supabase
        .from("rider_location_history")
        .insert({
          rider_id: riderId,
          order_id: orderId,
          lat: location.lat,
          lng: location.lng,
          timestamp: location.timestamp || new Date().toISOString(),
        });

      if (historyError) {
        console.error("Error saving location history:", historyError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      location: {
        lat: location.lat,
        lng: location.lng,
        timestamp: location.timestamp || Date.now(),
      },
    });

  } catch (error) {
    console.error("Error in update-location API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch rider's current location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riderId = searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json(
        { error: "Missing riderId parameter" },
        { status: 400 }
      );
    }

    // Get rider's current location from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("lat, lng, updated_at")
      .eq("user_id", riderId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Rider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        lat: profile.lat,
        lng: profile.lng,
        timestamp: profile.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching rider location:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
