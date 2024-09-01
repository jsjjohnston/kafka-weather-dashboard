import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(req: NextRequest) {
  const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || '5432', 10),
  });

  await client.connect();

  try {
    const result = await client.query('SELECT * FROM weather_data ORDER BY id DESC LIMIT 20'); // Fetch the last 10 records
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  } finally {
    await client.end();
  }
}
