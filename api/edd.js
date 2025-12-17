export default async function handler(req, res) {
  // 🔴 REQUIRED FOR SHOPIFY
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { pincode } = req.query;

  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ available: false });
  }

  // ⏰ DISPATCH LOGIC
  const now = new Date();
  const dispatchDate = new Date(now);

  if (now.getHours() >= 18) {
    dispatchDate.setDate(dispatchDate.getDate() + 1);
  }

  const url = `https://track.delhivery.com/api/dc/expected_tat?origin_pin=673571&destination_pin=${pincode}&mot=S`;

  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_KEY}`,
        Accept: "application/json"
      }
    });

    const j = await r.json();

    if (!j?.data?.tat) {
      return res.status(200).json({ available: false });
    }

    const deliveryDate = new Date(dispatchDate);
    deliveryDate.setDate(deliveryDate.getDate() + j.data.tat);

    return res.status(200).json({
      available: true,
      tat_days: j.data.tat,
      dispatch_date: dispatchDate.toDateString(),
      delivery_date: deliveryDate.toDateString()
    });

  } catch (err) {
    return res.status(500).json({ available: false });
  }
}
