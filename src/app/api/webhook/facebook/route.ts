import { NextResponse } from "next/server";
import { prisma } from "@/backend/db/prisma";

// GET handler for Facebook Webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}

// POST handler for incoming Facebook messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging[0];
        const senderPsid = webhookEvent.sender.id;

        console.log("Incoming webhook event:", JSON.stringify(webhookEvent));

        // Check if there is a referral payload (e.g. from m.me link with ?ref=USER_ID)
        let refPayload = null;

        if (webhookEvent.referral && webhookEvent.referral.ref) {
          refPayload = webhookEvent.referral.ref;
        } else if (webhookEvent.postback && webhookEvent.postback.referral && webhookEvent.postback.referral.ref) {
          refPayload = webhookEvent.postback.referral.ref;
        }

        if (refPayload) {
          console.log(`Received referral payload: ${refPayload} for PSID: ${senderPsid}`);
          
          // Update the user's facebookPsid in the database
          await prisma.user.updateMany({
            where: { id: refPayload },
            data: { facebookPsid: senderPsid }
          });
          
          // Optionally, send a welcome message back to the teacher here.
          await sendWelcomeMessage(senderPsid);
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function sendWelcomeMessage(psid: string) {
  const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!PAGE_ACCESS_TOKEN) return;

  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: psid },
      message: { 
        text: "✅ Success! Your AIRA AI Teacher Feedback account is now linked. You will receive your daily feedback summaries right here." 
      }
    })
  });
}
