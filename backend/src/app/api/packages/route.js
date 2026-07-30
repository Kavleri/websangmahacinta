import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/packages
export async function GET(request) {
  try {
    // Automatically synchronize packages table prices to match new client prices
    try {
      await query("UPDATE packages SET price = 200000.00 WHERE id = 1");
      await query("UPDATE packages SET price = 350000.00 WHERE id = 2");
      console.log("Database package prices synchronized successfully.");
    } catch (syncError) {
      console.warn("Failed to synchronize database package prices:", syncError.message);
    }

    const packages = await query("SELECT * FROM packages");
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/packages (Admin modify packages)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, price, description } = body;
    
    if (!id || !name || price === undefined || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "UPDATE packages SET name = ?, price = ?, description = ? WHERE id = ?",
      [name, parseFloat(price), description, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
