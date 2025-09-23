import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || ""); // Add your SendGrid API key here or via .env

export async function POST(req: Request) {
  try {
    const { name, email, eventTitle, eventDate, mode, description } = await req.json();

    if (!name || !email || !eventTitle) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const msg = {
      to: "events@businessorbit.app", // admin email
      from: "no-reply@businessorbit.app", // verified sender
      subject: `Event Proposal Inquiry from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Event Title: ${eventTitle}
        Event Date: ${eventDate}
        Mode: ${mode}
        Description: ${description}
      `,
      html: `
        <h2>New Event Proposal</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Event Title:</b> ${eventTitle}</p>
        <p><b>Event Date:</b> ${eventDate}</p>
        <p><b>Mode:</b> ${mode}</p>
        <p><b>Description:</b> ${description}</p>
      `,
    };

    if (!process.env.SENDGRID_API_KEY) {
      console.log("Demo mode: proposal not sent (SendGrid API key missing)");
      return NextResponse.json({ success: true, message: "Proposal logged (demo mode)" });
    }

    await sgMail.send(msg);

    return NextResponse.json({ success: true, message: "Proposal sent successfully!" });
  } catch (error: any) {
    console.error("Error sending proposal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send proposal (check console)" },
      { status: 500 }
    );
  }
}



