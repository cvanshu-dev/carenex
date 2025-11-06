// /app/api/webhook/clerk/route.js (Simplified - ADD SVIX SIGNATURE VERIFICATION IN PRODUCTION)
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const payload = await req.json();
  const eventType = payload.type;

  // 1. Handle user created event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = payload.data;

    try {
      await db.user.create({
        data: {
          clerkUserId: id, // 💡 THIS IS THE CRUCIAL LINK
          email: email_addresses[0].email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          imageUrl: image_url,
          // All other fields will take their default values (e.g., role: UNASSIGNED)
        },
      });
      console.log(`✅ User created in DB: ${id}`);
    } catch (error) {
      // Handle potential duplicate key error (P2002) if webhook retries
      console.error("Error creating user from webhook:", error);
      return new NextResponse("Error processing user creation", { status: 500 });
    }
  }

  // 2. Add handlers for user.updated or user.deleted here if needed

  return new NextResponse('Webhook processed successfully', { status: 200 });
}