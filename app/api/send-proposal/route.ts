import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import pool from '@/lib/config/database';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || ""); // Add your SendGrid API key here or via .env

export async function POST(req: Request) {
  try {
    const { name, email, phone, eventTitle, eventDate, mode, description, userId } = await req.json();

    if (!name || !email || !phone || !eventTitle) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Store proposal in database
    const insertQuery = `
      INSERT INTO event_proposals (name, email, phone, event_title, event_date, mode, description, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const result = await pool.query(insertQuery, [
      name,
      email,
      phone,
      eventTitle,
      eventDate,
      mode,
      description || '',
      userId || null
    ]);

    // Send email notification to admin
    const msg = {
      to: "events@businessorbit.app", // admin email
      from: "no-reply@businessorbit.app", // verified sender
      subject: `Event Proposal Inquiry from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Event Title: ${eventTitle}
        Event Date: ${eventDate}
        Mode: ${mode}
        Description: ${description}
      `,
      html: `
        <h2>New Event Proposal</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Event Title:</b> ${eventTitle}</p>
        <p><b>Event Date:</b> ${eventDate}</p>
        <p><b>Mode:</b> ${mode}</p>
        <p><b>Description:</b> ${description}</p>
      `,
    };

    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send(msg);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, message: "Proposal submitted successfully!" });
  } catch (error: any) {
    console.error("Error saving proposal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit proposal" },
      { status: 500 }
    );
  }
}



