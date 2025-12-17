export default async function handler(req, res) {

  // ✅ CORS HEADERS (THIS FIXES SHOPIFY ISSUE)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Destination pincode required" });
  }

  const ORIGIN_PIN = "673571";
  const API_KEY = process.env.DELHIVERY_API_KEY;

  try {
    const url =
      `https://track.delhivery.com/api/dc/expected_tat` +
      `?origin_pin=${ORIGIN_PIN}` +
      `&destination_pin=${pincode}` +
      `&mot=S`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`
      }
    });

    const data = await response.json();

    const tatDays = data?.data?.tat;

    if (!tatDays) {
      return res.status(404).json({
        error: "TAT not available",
        raw: data
      });
    }

    // 6 PM dispatch rule
    const now = new Date();
    const dispatchDate = new Date(now);
    if (now.getHours() >= 18) {
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    }

    const deliveryDate = new Date(dispatchDate);
    deliveryDate.setDate(deliveryDate.getDate() + tatDays);

    return res.status(200).json({
      tat_days: tatDays,
      delivery_date: deliveryDate.toDateString()
    });

  } catch (err) {
    return res.status(500).json({ error: "Delhivery API failed" });
  }
}
